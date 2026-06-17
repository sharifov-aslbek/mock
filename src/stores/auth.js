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

    async function telegramLogin(tgUser) {
        const apiBaseUrl = getTestApiBaseUrl()

        if (!apiBaseUrl) {
            throw new Error('API base URL is missing.')
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            const body = JSON.stringify({
                id: tgUser.id,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name ?? null,
                username: tgUser.username,
                photoUrl: tgUser.photo_url,
                authDate: tgUser.auth_date,
                hash: tgUser.hash,
            })

            const response = await fetch(`${apiBaseUrl}/auth/telegram-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    accept: '*/*',
                },
                body,
            })

            const payload = await response.json()

            if (!response.ok || payload?.code !== 200 || !payload?.data?.token) {
                throw new Error(payload?.message || 'Login failed.')
            }

            token.value = payload.data.token
            localStorage.setItem(TOKEN_KEY, payload.data.token)

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

      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || 'Failed to fetch user info.')
      }

      userInfo.value = payload.data

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
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    token,
    isLoading,
    errorMessage,
    isAuthenticated,
    login,
    telegramLogin,
    getUserInfo,
    userInfo,
    logout,
  }
})
