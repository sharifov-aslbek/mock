import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function shuffleItems(items) {
  // Shuffle disabled until the option-id mismatch is root-caused; preserve backend order.
  return [...items]
}

function withOptionLetters(options) {
  return options.map((option, index) => ({
    ...option,
    letter: OPTION_LETTERS[index] || String(index + 1),
  }))
}

function buildImageUrl(apiBaseUrl, imagePath) {
  if (!imagePath) {
    return null
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }

  const apiOrigin = new URL(apiBaseUrl).origin

  return `${apiOrigin}/${String(imagePath).replace(/^\/+/, '')}`
}

function normalizeTest(test, apiBaseUrl) {
  const questionGroups = Array.isArray(test.questionGroups)
    ? test.questionGroups.map((group) => ({
        ...group,
          options: withOptionLetters(
              Array.isArray(group.options) ? group.options : [],
          ),
      }))
    : []

  const groupOptionsById = new Map(
    questionGroups.map((group) => [group.id, group.options]),
  )

  const questions = Array.isArray(test.questions)
    ? [...test.questions]
        .sort(
          (firstQuestion, secondQuestion) =>
            Number(firstQuestion.order) - Number(secondQuestion.order) ||
            Number(firstQuestion.id) - Number(secondQuestion.id),
        )
        .map((question) => {
          const directOptions = Array.isArray(question.options)
            ? question.options
            : []
          const resolvedOptions = directOptions.length
            ? withOptionLetters(shuffleItems(directOptions))
            : [...(groupOptionsById.get(question.questionGroupId) || [])]

          return {
            ...question,
            imageUrl: buildImageUrl(apiBaseUrl, question.imagePath),
            options: resolvedOptions,
          }
        })
    : []

  return {
    ...test,
    questionGroups,
    questions,
  }
}

export const useTestStore = defineStore('test', () => {
  const currentTest = ref(null)
  const currentAttempt = ref(null)
  const lastSubmission = ref(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  function buildAuthHeaders(extraHeaders = {}) {
    const authStore = useAuthStore()
    const headers = { accept: '*/*', ...extraHeaders }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    return headers
  }

  function ensureAuth() {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Authentication is required.')
    }
  }

  // start-test omits the test's subject; resolve it from the list endpoint so
  // subject-gated UI (e.g. the math-only formula tool) works. Best-effort and
  // non-blocking — a failure just leaves subject undefined.
  async function enrichSubject(testId, apiBaseUrl) {
    try {
      const response = await apiFetch(`${apiBaseUrl}/test`, {
        headers: buildAuthHeaders(),
      })
      const payload = await response.json().catch(() => null)
      const list = Array.isArray(payload?.data) ? payload.data : []
      const match = list.find((test) => Number(test.id) === Number(testId))

      if (
        match?.subject &&
        currentTest.value &&
        Number(currentTest.value.id) === Number(testId)
      ) {
        currentTest.value = { ...currentTest.value, subject: match.subject }
      }
    } catch {
      // Subject is a nice-to-have; ignore network/parse failures.
    }
  }

  // Begin an attempt. One backend call now loads the test content, creates the
  // attempt, and (for premium tests) performs the purchase — replacing the old
  // GET /test/{id} + POST /user-test-attempt + POST /balance/purchase trio.
  // The backend mints a FRESH attempt on every call, so this must be triggered
  // once by an explicit user action (the card), never on a page refresh.
  async function startTest(testId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await apiFetch(`${apiBaseUrl}/user-test-attempt/start-test`, {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ testId: Number(testId) }),
      })

      const payload = await response.json()

      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || 'Could not start the test.')
      }

      // start-test returns the same content shape as the old detail endpoint
      // plus testAttemptId, but no test id — inject the requested one so the
      // test page can match it against the route's testId.
      currentTest.value = normalizeTest({ ...payload.data, id: Number(testId) }, apiBaseUrl)

      // The attempt id drives every later /user-answer + submit call. Read it
      // tolerantly so a backend field rename doesn't silently disable syncing.
      const attemptId =
        payload.data.testAttemptId ?? payload.data.attemptId ?? payload.data.id
      currentAttempt.value = { id: Number(attemptId) }

      // Resolve subject in the background so it never delays test start.
      void enrichSubject(testId, apiBaseUrl)

      return { test: currentTest.value, attempt: currentAttempt.value }
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not start the test.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Derive the correct/incorrect/max-score tallies the certificate needs from a
  // graded results payload. get-results returns per-option `isCorrect` and the
  // user's picks but no aggregate counts, so we compute them here. Free-text
  // answers can't be judged from options — matching the explanation table, an
  // answered free response counts as incorrect (the point-based TotalScore from
  // the backend remains the source of truth for the grade).
  function computeResultAggregates(test, userAnswers) {
    const answerByQuestionId = new Map(
      (userAnswers || []).map((answer) => [Number(answer?.questionId), answer]),
    )

    let correctCount = 0
    let incorrectCount = 0
    let maxScore = 0

    for (const question of test.questions || []) {
      maxScore += Number(question?.score) || 0

      const answer = answerByQuestionId.get(Number(question.id))
      if (!answer) {
        continue
      }

      const selectedOptionId = Number(answer.selectedOptionId || 0)

      if (selectedOptionId > 0) {
        const option = (question.options || []).find(
          (candidate) => Number(candidate.id) === selectedOptionId,
        )
        if (option?.isCorrect) {
          correctCount += 1
        } else {
          incorrectCount += 1
        }
      } else if (typeof answer.textAnswer === 'string' && answer.textAnswer.trim()) {
        incorrectCount += 1
      }
    }

    return { correctCount, incorrectCount, maxScore }
  }

  // Read-only graded results for a single attempt (no charge, no new attempt).
  // Returns the same content shape as start-test plus userAnswers + totalScore,
  // so we can render the explanation page from one call. Powers both the
  // post-submit results screen and "view a past attempt".
  async function fetchAttemptResults(attemptId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await apiFetch(
        `${apiBaseUrl}/user-test-attempt/get-results?testAttemptId=${Number(attemptId)}`,
        {
          headers: buildAuthHeaders(),
        },
      )

      const payload = await response.json()

      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || 'Could not load the results.')
      }

      const data = payload.data
      currentTest.value = normalizeTest(data, apiBaseUrl)

      const userAnswers = Array.isArray(data.userAnswers) ? data.userAnswers : []
      const aggregates = computeResultAggregates(currentTest.value, userAnswers)

      lastSubmission.value = {
        testAttemptId: data.testAttemptId,
        totalScore: data.totalScore,
        userAnswers,
        ...aggregates,
      }

      return { test: currentTest.value, submission: lastSubmission.value }
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not load the results.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // The signed-in user's attempt history (backend reads the user from the
  // token). Used to resolve "view last result" to a concrete attempt id and,
  // later, to drive an attempt-history list.
  async function fetchUserAttempts() {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    const response = await apiFetch(`${apiBaseUrl}/user-test-attempt/get-user-attempts`, {
      headers: buildAuthHeaders(),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || (payload && payload.code !== 200)) {
      throw new Error(payload?.message || 'Could not load attempts.')
    }

    return Array.isArray(payload?.data) ? payload.data : []
  }

  async function submitTestAttempt(testId, testAttemptId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    const response = await apiFetch(
      `${apiBaseUrl}/user-test-attempt/submit?testId=${Number(testId)}&testAttemptId=${Number(testAttemptId)}`,
      {
        method: 'POST',
        headers: buildAuthHeaders(),
      },
    )

    const payload = await response.json().catch(() => null)

    if (!response.ok || (payload && payload.code !== 200)) {
      throw new Error(payload?.message || 'Could not submit the test.')
    }

    lastSubmission.value = payload?.data ?? null

    return lastSubmission.value
  }

  async function fetchQuestionExplanation(questionId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    const response = await apiFetch(
      `${apiBaseUrl}/question-explanation?questionId=${Number(questionId)}`,
      {
        headers: buildAuthHeaders(),
      },
    )

    const payload = await response.json().catch(() => null)

    if (!response.ok || (payload && payload.code !== 200)) {
      throw new Error(payload?.message || 'Could not load the explanation.')
    }

    return payload?.data ?? null
  }

  async function requestUserAnswer(method, answerPayload) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    const response = await apiFetch(`${apiBaseUrl}/user-answer`, {
      method,
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(answerPayload),
    })

    const payload = await response.json()

    if (!response.ok || payload?.code !== 200) {
      throw new Error(payload?.message || 'Could not save the answer.')
    }

    return payload.data
  }

  async function createUserAnswer(answerPayload) {
    return requestUserAnswer('POST', answerPayload)
  }

  async function updateUserAnswer(answerPayload) {
    return requestUserAnswer('PUT', answerPayload)
  }

  function clearCurrentTest() {
    currentTest.value = null
    currentAttempt.value = null
    errorMessage.value = ''
  }

  function clearError() {
    errorMessage.value = ''
  }

  return {
    currentTest,
    currentAttempt,
    lastSubmission,
    isLoading,
    errorMessage,
    fetchAttemptResults,
    fetchUserAttempts,
    startTest,
    submitTestAttempt,
    fetchQuestionExplanation,
    createUserAnswer,
    updateUserAnswer,
    clearCurrentTest,
    clearError,
  }
})
