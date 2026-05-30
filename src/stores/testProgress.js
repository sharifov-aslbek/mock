import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const PROGRESS_STORAGE_KEY = 'test_progress_map'

const readProgressFromStorage = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!storedValue) {
      return {}
    }
    const parsedValue = JSON.parse(storedValue)
    if (!parsedValue || typeof parsedValue !== 'object') {
      return {}
    }
    return parsedValue
  } catch (error) {
    console.error(error)
    return {}
  }
}

const writeProgressToStorage = (progressMap) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressMap))
  } catch (error) {
    console.error(error)
  }
}

export const useTestProgressStore = defineStore('testProgress', () => {
  const progressMap = ref({})

  // Restore the map from localStorage so refreshing the test page does not
  // reset the timer or answer state.
  const hydrate = () => {
    progressMap.value = readProgressFromStorage()
    return progressMap.value
  }

  const getProgress = (testId) => progressMap.value[String(testId)] || null

  const saveProgress = (progress) => {
    const testId = String(progress.testId)

    progressMap.value = {
      ...progressMap.value,
      [testId]: {
        ...progress,
        testId: Number(progress.testId),
        updatedAt: Date.now(),
      },
    }

    writeProgressToStorage(progressMap.value)
  }

  const clearProgress = (testId) => {
    const nextProgressMap = { ...progressMap.value }
    delete nextProgressMap[String(testId)]
    progressMap.value = nextProgressMap

    writeProgressToStorage(progressMap.value)
  }

  const inProgressTests = computed(() =>
    Object.values(progressMap.value)
      .filter((item) => item && !item.completed)
      .sort((firstItem, secondItem) => Number(secondItem.updatedAt) - Number(firstItem.updatedAt)),
  )

  return {
    progressMap,
    inProgressTests,
    hydrate,
    getProgress,
    saveProgress,
    clearProgress,
  }
})
