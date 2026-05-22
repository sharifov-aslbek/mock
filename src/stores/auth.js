import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getTestApiBaseUrl } from '@/utils/api'

const TOKEN_KEY = 'milliymock_token'
const TEMP_USER_KEY = 'milliymock_temp_user'

function loadStoredTempUser() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(TEMP_USER_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    if (!parsed || !parsed.id) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const userInfo = ref(null)
  const tempUser = ref(loadStoredTempUser())

  const isAuthenticated = computed(() => Boolean(token.value))
  const tempUserId = computed(() => tempUser.value?.id || null)

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
      setTempUser(null)

      return payload
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Login failed.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

    async function telegramLogin(userInfo) {
        const apiBaseUrl = getTestApiBaseUrl()

        if (!apiBaseUrl) {
            throw new Error('API base URL is missing.')
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            const body = JSON.stringify({
                id: userInfo.id,
                firstName: userInfo.first_name,
                lastName: userInfo.last_name ?? null,
                username: userInfo.username,
                photoUrl: userInfo.photo_url,
                authDate: userInfo.auth_date,
                hash: userInfo.hash,
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
            setTempUser(null)

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

  function setTempUser(value) {
    if (!value || !value.id) {
      tempUser.value = null
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(TEMP_USER_KEY)
      }
      return
    }

    tempUser.value = value
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TEMP_USER_KEY, JSON.stringify(value))
    }
  }

  async function createTempUser({ firstName, lastName, fatherName }) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    const response = await fetch(`${apiBaseUrl}/temp-user`, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, fatherName }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || payload?.code !== 200 || !payload?.data?.id) {
      throw new Error(payload?.message || 'Could not create temp user.')
    }

    setTempUser(payload.data)
    return payload.data
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
    telegramLogin,
    getUserInfo,
    userInfo,
    tempUser,
    tempUserId,
    createTempUser,
    setTempUser,
    logout,
  }
})
