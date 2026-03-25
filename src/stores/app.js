import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const dashboardType = ref('admin')
  const sidebarCollapsed = ref(false)
  const currentTestId = ref(null)

  const isAdminDashboard = computed(() => dashboardType.value === 'admin')

  function setDashboardType(type) {
    dashboardType.value = type
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setCurrentTestId(testId) {
    currentTestId.value = testId
  }

  return {
    dashboardType,
    sidebarCollapsed,
    currentTestId,
    isAdminDashboard,
    setDashboardType,
    toggleSidebar,
    setCurrentTestId,
  }
})
