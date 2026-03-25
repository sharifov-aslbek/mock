import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

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
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function fetchTestById(testId) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
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

  function clearCurrentTest() {
    currentTest.value = null
    errorMessage.value = ''
  }

  return {
    currentTest,
    isLoading,
    errorMessage,
    fetchTestById,
    clearCurrentTest,
  }
})
