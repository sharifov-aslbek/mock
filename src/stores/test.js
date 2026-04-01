import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { getTestApiBaseUrl } from '@/utils/api'

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function shuffleItems(items) {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = result[index]

    result[index] = result[swapIndex]
    result[swapIndex] = currentItem
  }

  return result
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
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function fetchTestById(testId) {
    const apiBaseUrl = getTestApiBaseUrl()
    const authStore = useAuthStore()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    if (!authStore.token) {
      throw new Error('Authentication token is missing.')
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBaseUrl}/test/${testId}`, {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${authStore.token}`,
        },
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
    const authStore = useAuthStore()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    if (!authStore.token) {
      throw new Error('Authentication token is missing.')
    }

    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBaseUrl}/user-test-attempt`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          testId: Number(testId),
        }),
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

  async function requestUserAnswer(method, answerPayload) {
    const apiBaseUrl = getTestApiBaseUrl()
    const authStore = useAuthStore()

    if (!apiBaseUrl) {
      throw new Error('Test API base URL is missing.')
    }

    if (!authStore.token) {
      throw new Error('Authentication token is missing.')
    }

    const response = await fetch(`${apiBaseUrl}/user-answer`, {
      method,
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
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
    isLoading,
    errorMessage,
    fetchTestById,
    startTestAttempt,
    createUserAnswer,
    updateUserAnswer,
    clearCurrentTest,
    clearError,
  }
})
