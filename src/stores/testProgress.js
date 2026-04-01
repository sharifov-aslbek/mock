import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useTestProgressStore = defineStore('testProgress', () => {
  const progressMap = ref({})

  const hydrate = () => {
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
  }

  const clearProgress = (testId) => {
    const nextProgressMap = { ...progressMap.value }
    delete nextProgressMap[String(testId)]
    progressMap.value = nextProgressMap
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
