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
          shuffleItems(Array.isArray(group.options) ? group.options : []),
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

  async function fetchTestById(testId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await apiFetch(`${apiBaseUrl}/test/${testId}`, {
        headers: buildAuthHeaders(),
      })

      const payload = await response.json()

      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || 'Could not load the test.')
      }

      currentTest.value = normalizeTest(payload.data, apiBaseUrl)

      return currentTest.value
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not load the test.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function startTestAttempt(testId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    errorMessage.value = ''

    try {
      const response = await apiFetch(`${apiBaseUrl}/user-test-attempt`, {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ testId: Number(testId) }),
      })

      const payload = await response.json()

      if (!response.ok || payload?.code !== 200 || !payload?.data?.id) {
        throw new Error(payload?.message || 'Could not start the test attempt.')
      }

      currentAttempt.value = payload.data
      return payload.data
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not start the test attempt.'
      throw error
    }
  }

  async function fetchTestProgress(testId) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    ensureAuth()

    const response = await apiFetch(
      `${apiBaseUrl}/user-test-attempt/get-progress?testId=${Number(testId)}`,
      {
        headers: buildAuthHeaders(),
      },
    )

    const payload = await response.json()

    if (!response.ok || payload?.code !== 200) {
      throw new Error(payload?.message || 'Could not load test progress.')
    }

    return payload.data || null
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
    fetchTestById,
    fetchTestProgress,
    startTestAttempt,
    submitTestAttempt,
    fetchQuestionExplanation,
    createUserAnswer,
    updateUserAnswer,
    clearCurrentTest,
    clearError,
  }
})
