import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'

// Real tanga balance, backed entirely by the API.
//
// The balance is read from `GET /api/balance` (granted by the admin via the
// Telegram bot). Purchasing a premium test is no longer a separate call — it is
// folded into `POST /api/user-test-attempt/start-test`, which deducts the price
// and starts the attempt in one step (see useTestStore.startTest). This store is
// now read-only: it just reports the balance for display.

export const useBalanceStore = defineStore('balance', () => {
  const serverBalance = ref(0)
  const userId = ref(null)
  const isLoaded = ref(false)
  const isLoading = ref(false)

  // Display only — the real value the server reported. The frontend never makes
  // affordability/validation decisions from this; the backend does that when a
  // purchase is attempted.
  const available = computed(() => Math.max(0, serverBalance.value))

  // Fetch the real balance.
  async function refresh() {
    const authStore = useAuthStore()
    if (!authStore.token) {
      isLoaded.value = false
      return null
    }

    const apiBaseUrl = getTestApiBaseUrl()
    if (!apiBaseUrl) throw new Error('API base URL is missing.')

    isLoading.value = true
    try {
      const response = await apiFetch(`${apiBaseUrl}/balance`, {
        headers: { accept: '*/*', Authorization: `Bearer ${authStore.token}` },
      })

      const payload = await response.json()
      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || 'Could not load balance.')
      }

      serverBalance.value = Number(payload.data.balance) || 0
      userId.value = payload.data.userId ?? null
      isLoaded.value = true
      return payload.data
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    serverBalance.value = 0
    userId.value = null
    isLoaded.value = false
  }

  return {
    serverBalance,
    available,
    isLoaded,
    isLoading,
    refresh,
    reset,
  }
})
