import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const currentTestId = ref(null)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setCurrentTestId(testId) {
    currentTestId.value = testId
  }

  return {
    sidebarCollapsed,
    currentTestId,
    toggleSidebar,
    setCurrentTestId,
  }
})
