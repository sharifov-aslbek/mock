import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'milliymock_test_progress'

const readProgressMap = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue)

    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {}
  } catch {
    return {}
  }
}

export const useTestProgressStore = defineStore('testProgress', () => {
  const progressMap = ref(readProgressMap())

  const persist = () => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap.value))
  }

  const hydrate = () => {
    progressMap.value = readProgressMap()
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

    persist()
  }

  const clearProgress = (testId) => {
    const nextProgressMap = { ...progressMap.value }
    delete nextProgressMap[String(testId)]
    progressMap.value = nextProgressMap
    persist()
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
