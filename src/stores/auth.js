import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'

const TOKEN_KEY = 'milliymock_token'

// Every OTP/SMS endpoint hands the code to an external SMS gateway (Eskiz).
// When that gateway answers with anything but 200 — it's down, or our balance
// ran out — the backend bubbles it up as 502 `{"message": "Failed to send SMS"}`.
// Nothing the user typed is wrong, so callers flag it and show a "try again or
// contact support" message instead of the raw provider error.
function isSmsProviderDown(response, payload) {
  return (
    response.status === 502 ||
    payload?.code === 502 ||
    payload?.status === 502 ||
    /failed to send sms/i.test(String(payload?.message || ''))
  )
}

// The account row is written before the OTP goes out, so an SMS outage
// mid-signup leaves a real-but-unconfirmed account behind — the user comes
// back, registers the same number again, and the backend answers
// 409 {"code":409,"message":"This phone number is already registered."}.
// Flagged so the UI can send them to the login page in their own language
// instead of showing the raw English message.
function isAccountAlreadyRegistered(response, payload) {
  return response.status === 409 || payload?.code === 409
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const userInfo = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  // The certificate is printed from the user's real name. A profile is only
  // "complete" once firstName, lastName, fatherName and phoneNumber are all
  // filled — that's what the first-time test gate checks before an attempt is
  // started. See src/composables/useProfileGate.js.
  const isProfileComplete = computed(() => {
    const info = userInfo.value
    return Boolean(
      info &&
        String(info.firstName || '').trim() &&
        String(info.lastName || '').trim() &&
        String(info.fatherName || '').trim() &&
        String(info.phoneNumber || '').trim(),
    )
  })

  // Password login. The single identifier field accepts an email or a phone
  // number — the endpoint takes Email or PhoneNumber, so we pick the field
  // from the input's shape. A bare 9-digit local number gets the 998 country
  // code the backend stores ("90 123 45 67" -> "998901234567").
  async function login(identifier, password) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const trimmed = String(identifier).trim()
      const digits = trimmed.replace(/\D/g, '')
      const looksLikePhone =
        /^\+?[\d\s\-()]+$/.test(trimmed) && digits.length >= 9

      const formData = new FormData()
      if (looksLikePhone) {
        formData.append(
          'PhoneNumber',
          digits.length === 9 ? `998${digits}` : digits,
        )
      } else {
        formData.append('Email', trimmed)
      }
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
        const messageText = payload?.message || 'Login failed.'
        const error = new Error(messageText)
        // The backend refuses password logins until the phone number is
        // OTP-confirmed. Flag that case so the login page can hand the user
        // to /verify-phone instead of showing a dead-end error. Detected by
        // status/message since swagger doesn't type the response.
        error.phoneNotVerified =
          payload?.code === 403 ||
          /verif|tasdiq|подтвер|confirm/i.test(messageText) ||
          payload?.data?.phoneNumberVerified === false ||
          payload?.data?.isPhoneVerified === false ||
          payload?.data?.phoneNumberConfirmed === false
        throw error
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


  // Phone registration, step 1: create the account and trigger the SMS OTP.
  // The backend stores phone numbers as digits only (e.g. "998901234567").
  async function register({ firstName, lastName, phoneNumber, password }) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phoneNumber: String(phoneNumber).replace(/\D/g, ''),
          password,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || (payload?.code && payload.code !== 200)) {
        const error = new Error(payload?.message || 'Registration failed.')
        error.smsUnavailable = isSmsProviderDown(response, payload)
        error.accountExists = isAccountAlreadyRegistered(response, payload)
        throw error
      }

      return payload
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Registration failed.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Phone registration, step 2: confirm the SMS code. When the backend returns
  // a token the session starts right here (no separate login step).
  async function verifyOtp({ phoneNumber, code }) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({
          phoneNumber: String(phoneNumber).replace(/\D/g, ''),
          code: String(code),
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || (payload?.code && payload.code !== 200)) {
        throw new Error(payload?.message || 'Verification failed.')
      }

      if (payload?.data?.token) {
        token.value = payload.data.token
        localStorage.setItem(TOKEN_KEY, payload.data.token)
      }

      return payload?.data || null
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Verification failed.'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function resendOtp({ phoneNumber }) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBaseUrl}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({
          phoneNumber: String(phoneNumber).replace(/\D/g, ''),
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || (payload?.code && payload.code !== 200)) {
        const error = new Error(payload?.message || 'Could not resend the code.')
        error.smsUnavailable = isSmsProviderDown(response, payload)
        throw error
      }

      return payload
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not resend the code.'
      throw error
    }
  }

  // Forgot-password, step 1: send a reset code over the given channel.
  // The backend only sends to a CONFIRMED email/phone (403 otherwise) and
  // applies the OTP rate-limit policy (1-min cooldown, daily/IP caps).
  async function forgotPassword({ email, phoneNumber }) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({
          ...(email ? { email } : {}),
          ...(phoneNumber
            ? { phoneNumber: String(phoneNumber).replace(/\D/g, '') }
            : {}),
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || (payload?.code && payload.code !== 200)) {
        const error = new Error(payload?.message || 'Could not send the reset code.')
        // 403 = the account exists but this channel was never confirmed, so no
        // reset code is sent there. The UI offers the verify-phone drill instead.
        error.channelNotConfirmed =
          payload?.code === 403 || response.status === 403
        error.smsUnavailable = isSmsProviderDown(response, payload)
        throw error
      }

      return payload
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not send the reset code.'
      throw error
    }
  }

  // Forgot-password, step 2: code + new password in one call. Returns the same
  // LoginResultDto as login, so a valid reset lands the user signed in.
  async function resetPassword({ email, phoneNumber, code, newPassword }) {
    const apiBaseUrl = getTestApiBaseUrl()

    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({
          ...(email ? { email } : {}),
          ...(phoneNumber
            ? { phoneNumber: String(phoneNumber).replace(/\D/g, '') }
            : {}),
          code: String(code),
          newPassword,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || (payload?.code && payload.code !== 200)) {
        throw new Error(payload?.message || 'Could not reset the password.')
      }

      if (payload?.data?.token) {
        token.value = payload.data.token
        localStorage.setItem(TOKEN_KEY, payload.data.token)
      }

      return payload?.data || null
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Could not reset the password.'
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

  // Persist the test-taker's name/contact details (PUT /api/user). Used by the
  // first-time test gate so the certificate can be issued with their real name.
  // On success we merge the values into userInfo immediately (and refresh from
  // the server) so the gate won't ask again.
  //
  // phoneNumber is optional here so callers that only edit the name (e.g. the
  // profile page) don't wipe the stored phone. When provided we send only the
  // digits (e.g. "+998770343363" -> "998770343363"), which is what the backend
  // stores and returns.
  async function updateProfile({ firstName, lastName, fatherName, phoneNumber }) {
    const apiBaseUrl = getTestApiBaseUrl()
    if (!apiBaseUrl) {
      throw new Error('API base URL is missing.')
    }

    const body = { firstName, lastName, fatherName }
    let phoneDigits
    if (phoneNumber !== undefined && phoneNumber !== null) {
      phoneDigits = String(phoneNumber).replace(/\D/g, '')
      body.phoneNumber = phoneDigits
    }

    const response = await apiFetch(`${apiBaseUrl}/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(body),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok || (payload?.code && payload.code !== 200)) {
      throw new Error(payload?.message || 'Failed to update profile.')
    }

    // Optimistically merge so isProfileComplete flips right away, then refresh
    // from the server to pick up anything it derived (e.g. fullName).
    userInfo.value = {
      ...(userInfo.value || {}),
      firstName,
      lastName,
      fatherName,
      ...(phoneDigits !== undefined ? { phoneNumber: phoneDigits } : {}),
    }

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
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    telegramLogin,
    googleLogin,
    getUserInfo,
    updateProfile,
    userInfo,
    logout,
  }
})
