import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'

// Real tanga balance + purchases, backed entirely by the API.
//
// The balance is read from `GET /api/balance` (granted by the admin via the
// Telegram bot). Premium tests are bought once via
// `POST /api/balance/purchase/{testId}` — the backend deducts `test.price`,
// records a Purchase transaction, and then gates attempt creation server-side
// (premium tests can only be attempted once). No client-side simulation.

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

  // Buy a premium test once. The backend deducts `test.price` and records the
  // purchase; the real balance is re-read afterwards. A 409 means the user
  // already owns it, which we treat as success (idempotent). Throws on real
  // failures (e.g. 400 "Insufficient balance") so the caller can react.
  async function purchaseTest(testId) {
    const authStore = useAuthStore()
    if (!authStore.token) throw new Error('Not authenticated.')

    const apiBaseUrl = getTestApiBaseUrl()
    if (!apiBaseUrl) throw new Error('API base URL is missing.')

    const response = await apiFetch(`${apiBaseUrl}/balance/purchase/${testId}`, {
      method: 'POST',
      headers: { accept: '*/*', Authorization: `Bearer ${authStore.token}` },
    })

    let payload = null
    try {
      payload = await response.json()
    } catch {
      // Some success responses may have no body — that's fine.
    }

    // Already purchased → the user already owns this test; let them through.
    if (response.status === 409) {
      await refresh().catch(() => {})
      return true
    }

    if (!response.ok || (payload?.code && payload.code !== 200)) {
      throw new Error(payload?.message || 'Could not purchase test.')
    }

    await refresh().catch(() => {})
    return true
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
    purchaseTest,
    reset,
  }
})
