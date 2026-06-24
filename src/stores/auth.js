import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'

const TOKEN_KEY = 'milliymock_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const userInfo = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  // The certificate is printed from the user's real name. A profile is only
  // "complete" once firstName, lastName and fatherName are all filled — that's
  // what the first-time test gate checks before an attempt is started.
  // See src/composables/useProfileGate.js.
  const isProfileComplete = computed(() => {
    const info = userInfo.value
    return Boolean(
      info &&
        String(info.firstName || '').trim() &&
        String(info.lastName || '').trim() &&
        String(info.fatherName || '').trim(),
    )
  })

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


    async function googleLogin(idToken) {
        const apiBaseUrl = getTestApiBaseUrl()

        if (!apiBaseUrl) {
            throw new Error('API base URL is missing.')
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await fetch(`${apiBaseUrl}/auth/google-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    accept: '*/*',
                },
                // `idToken` is the JWT credential Google Identity Services
                // hands back to the browser; the backend verifies it against
                // the same Google client id.
                body: JSON.stringify({ token: idToken }),
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
      const response = await apiFetch(`${apiBaseUrl}/user`, {
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

  // Persist the test-taker's name details (PUT /api/user). Used by the
  // first-time test gate so the certificate can be issued with their real name.
  // On success we merge the values into userInfo immediately (and refresh from
  // the server) so the gate won't ask again.
  async function updateProfile({ firstName, lastName, fatherName }) {
    const apiBaseUrl = getTestApiBaseUrl()
    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    const response = await apiFetch(`${apiBaseUrl}/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({ firstName, lastName, fatherName }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || (payload?.code && payload.code !== 200)) {
      throw new Error(payload?.message || 'Failed to update profile.')
    }

    // Optimistically merge so isProfileComplete flips right away, then refresh
    // from the server to pick up anything it derived (e.g. fullName).
    userInfo.value = { ...(userInfo.value || {}), firstName, lastName, fatherName }

    try {
      await getUserInfo()
    } catch {
      // Refresh is best-effort — the optimistic merge above already unblocks
      // the gate even if the follow-up GET fails.
    }

    return userInfo.value
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
    isProfileComplete,
    login,
    telegramLogin,
    googleLogin,
    getUserInfo,
    updateProfile,
    userInfo,
    logout,
  }
})
