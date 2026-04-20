import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getTestApiBaseUrl } from '@/utils/api'

const TOKEN_KEY = 'milliymock_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const userInfo = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(email, password) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const formData = new FormData()
      formData.append('Email', email)
      formData.append('Password', password)

      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          accept: '*/*',
        },
        body: formData,
      })

      const payload = await response.json()

      if (!response.ok || payload?.code !== 200 || !payload?.data?.token) {
        throw new Error(payload?.message || 'Login failed.')
      }

      token.value = payload.data.token
      localStorage.setItem(TOKEN_KEY, payload.data.token)

      return payload
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Login failed.'
      throw error
    } finally {
      isLoading.value = false
    }
  }



  async function getUserInfo() {
    const apiBaseUrl = getTestApiBaseUrl()
    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    try {
      const response = await fetch(`${apiBaseUrl}/user`, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token.value}`,
        },
      })

      const payload = await response.json()

      userInfo.value = payload.data

      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || 'Failed to fetch user info.')
      }

      return payload.data
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Failed to fetch user info.')
    }
  }

  function logout() {
    token.value = ''
    errorMessage.value = ''
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    token,
    isLoading,
    errorMessage,
    isAuthenticated,
    login,
    getUserInfo,
    userInfo,
    logout,
  }
})
