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
  // Set by resumeAttempt right before currentTest changes; read once by the test
  // page to re-fill saved answers and start the clock from the server's remaining
  // time. Null on a fresh start so that path begins from the full duration.
  const lastResume = ref(null)
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
        const error = new Error(payload?.message || 'Could not start the test.')
        // UserTestAttemptService refuses to mint an attempt while the phone is
        // unconfirmed. That's the one gate that actually matters, so callers
        // send the user to /complete-profile instead of showing a dead error.
        error.phoneNotConfirmed =
          payload?.code === 403 ||
          response.status === 403 ||
          /verify your phone number/i.test(String(payload?.message || ''))
        throw error
      }

      // Fresh attempt: no resume state, so the page starts from the full duration
      // with no pre-filled answers. Clear before currentTest changes (the page's
      // watcher reads lastResume when the attempt first initializes).
      lastResume.value = null

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

  // Resume an in-progress attempt by id (page refresh / direct link / "continue"
  // card). Returns the answer-less exam content plus the answers already saved
  // for this attempt and the server's remaining time — no new attempt, no charge.
  // If the window has elapsed the backend finishes the attempt and returns
  // isCompleted; the caller then routes to the graded result instead of resuming.
  async function resumeAttempt(attemptId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await apiFetch(
        `${apiBaseUrl}/user-test-attempt/resume?testAttemptId=${Number(attemptId)}`,
        {
          headers: buildAuthHeaders(),
        },
      )

      const payload = await response.json()

      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || 'Could not resume the test.')
      }

      const data = payload.data
      const resumeState = {
        isCompleted: Boolean(data.isCompleted),
        remainingSeconds: Number(data.remainingSeconds) || 0,
        userAnswers: Array.isArray(data.userAnswers) ? data.userAnswers : [],
      }

      // Set resume state BEFORE currentTest so the page's watcher (which fires
      // when the attempt first initializes) sees it on this same change.
      lastResume.value = resumeState
      currentTest.value = normalizeTest({ ...data, id: Number(data.testId) }, apiBaseUrl)
      currentAttempt.value = { id: Number(data.testAttemptId) }

      void enrichSubject(data.testId, apiBaseUrl)

      return resumeState
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not resume the test.'
      throw error
    } finally {
      isLoading.value = false
    }
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

      // The backend grades on read (get-results) and returns the tallies the
      // certificate needs — score, max, correct/incorrect counts — so we pass
      // them straight through instead of recomputing (which couldn't judge free
      // answers or grouped questions). TotalScore stays the authoritative grade.
      lastSubmission.value = {
        testAttemptId: data.testAttemptId,
        totalScore: data.totalScore,
        maxScore: data.maxScore,
        correctCount: data.correctCount,
        incorrectCount: data.incorrectCount,
        // AI grading for an Essay question (Ona tili). Null for tests without an
        // essay, or while grading is still pending. ExplanationPage renders it
        // via EssayAnalysisSection.
        essayReview: data.essayReview ?? null,
        // AI grading for the image-only open responses (Biology 41–43), one
        // entry per question. Empty for tests without them, or while grading is
        // still pending. Rendered by BiologyReviewSection.
        biologyReviews: Array.isArray(data.biologyReviews) ? data.biologyReviews : [],
        userAnswers,
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

  // Lean finalize: grade + mark the attempt completed server-side. The graded
  // review payload (questions, groups, answers, score) is read separately via
  // fetchAttemptResults (get-results), so we don't consume this response for
  // rendering — it just confirms the submit succeeded.
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

    return payload?.data ?? null
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

  // OCR the handwritten essay pages of an attempt (Ona tili). Multipart body:
  // testAttemptId + the page images. Returns the transcription text, which the
  // test page then stores as the essay's regular /user-answer textAnswer before
  // submit — so grading reads the handwritten essay, not the typed one.
  async function transcribeEssay(testAttemptId, imageFiles) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    const formData = new FormData()
    for (const file of imageFiles) {
      formData.append('images', file)
    }

    const response = await apiFetch(
      `${apiBaseUrl}/essay-review/transcribe?testAttemptId=${Number(testAttemptId)}`,
      {
        method: 'POST',
        // No Content-Type here — the browser sets the multipart boundary itself.
        headers: buildAuthHeaders(),
        body: formData,
      },
    )

    const payload = await response.json().catch(() => null)

    if (!response.ok || payload?.code !== 200 || !payload?.data) {
      throw new Error(payload?.message || 'Could not transcribe the essay.')
    }

    const transcription = payload.data.transcription ?? payload.data.Transcription

    return typeof transcription === 'string' ? transcription : ''
  }

  // Store the photo answer for an AI-reviewed open-response question
  // (AiReviewMode.BiologyOpenResponse). Multipart body matching
  // SetUserAnswerImagesDto: UserTestAttemptId + QuestionId + Images[].
  //
  // This SETS the question's image list, so callers post the full current
  // selection rather than a delta. Nothing else changes: the attempt is finished
  // with the usual submit, and get-results runs the AI review over the images.
  async function setUserAnswerImages(testAttemptId, questionId, imageFiles) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    const formData = new FormData()
    formData.append('UserTestAttemptId', String(Number(testAttemptId)))
    formData.append('QuestionId', String(Number(questionId)))

    for (const file of imageFiles) {
      formData.append('Images', file)
    }

    const response = await apiFetch(`${apiBaseUrl}/user-answer/images`, {
      method: 'POST',
      // No Content-Type here — the browser sets the multipart boundary itself.
      headers: buildAuthHeaders(),
      body: formData,
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || (payload && payload.code !== 200)) {
      throw new Error(payload?.message || 'Could not save the answer images.')
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
    lastResume.value = null
    errorMessage.value = ''
  }

  function clearError() {
    errorMessage.value = ''
  }

  return {
    currentTest,
    currentAttempt,
    lastSubmission,
    lastResume,
    isLoading,
    errorMessage,
    fetchAttemptResults,
    fetchUserAttempts,
    startTest,
    resumeAttempt,
    submitTestAttempt,
    transcribeEssay,
    fetchQuestionExplanation,
    createUserAnswer,
    updateUserAnswer,
    setUserAnswerImages,
    clearCurrentTest,
    clearError,
  }
})
