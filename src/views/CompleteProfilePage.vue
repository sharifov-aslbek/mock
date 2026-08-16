<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import OtpCodeInput from '@/components/auth/OtpCodeInput.vue'
import { useResendCountdown } from '@/composables/useResendCountdown'
import { formatPhoneDigits } from '@/utils/phone'
import { COMPLETE_PROFILE_PATH } from '@/utils/postAuth'
import { PLATFORM_HOME } from '@/composables/usePlatformEntry'

// The one gate that stands between a signed-in user and a test attempt.
// UserTestAttemptService refuses start-test unless the phone is confirmed, and
// the certificate is printed from the real name — so both are collected here:
//
//  'profile' → name + phone, saved with PUT /user. Changing the number clears
//              PhoneNumberConfirmed server-side, so verification follows.
//  'otp'     → POST /auth/verify-my-phone sends the code to the number we just
//              saved; verify-otp confirms it and returns a fresh token.
//
// Password-registered users arrive already confirmed (their row is only created
// once the code is verified), so for them this is a one-step name form.
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const step = ref('profile')

const firstName = ref('')
const lastName = ref('')
const fatherName = ref('')
// National part only (9 digits) — the +998 prefix is a fixed box in the UI.
const phoneDigits = ref('')

const validationError = ref('')
const isSaving = ref(false)
const isVerifying = ref(false)
const isResending = ref(false)

const OTP_LENGTH = 6

const otpCode = ref('')
const otpInput = ref(null)

const {
  remaining: resendRemaining,
  label: resendCountdownLabel,
  start: startResendCountdown,
  stop: stopResendCountdown,
} = useResendCountdown()

const phoneDisplay = computed(() => formatPhoneDigits(phoneDigits.value))
const fullPhoneDisplay = computed(() => `+998 ${formatPhoneDigits(phoneDigits.value)}`)
const apiPhoneNumber = computed(() => `998${phoneDigits.value}`)

const onPhoneInput = (event) => {
  phoneDigits.value = String(event.target.value).replace(/\D/g, '').slice(0, 9)
  event.target.value = formatPhoneDigits(phoneDigits.value)
}

const destination = computed(() => {
  const target =
    typeof route.query.redirect === 'string' ? route.query.redirect : ''
  // Never bounce back into this page — that would loop. With nothing to return
  // to, land in the platform — the same default as Login/Register.
  return target && !target.startsWith(COMPLETE_PROFILE_PATH) ? target : PLATFORM_HOME
})

const finish = () => router.replace(destination.value)

const enterOtpStep = async () => {
  step.value = 'otp'
  otpCode.value = ''
  validationError.value = ''
  startResendCountdown()
  await nextTick()
  otpInput.value?.focus()
}

const submitProfile = async () => {
  if (isSaving.value) {
    return
  }

  validationError.value = ''

  if (!firstName.value.trim() || !lastName.value.trim() || !fatherName.value.trim()) {
    validationError.value = t('completeProfile.validation')
    return
  }

  if (phoneDigits.value.length !== 9) {
    validationError.value = t('completeProfile.phoneValidation')
    return
  }

  isSaving.value = true

  try {
    await authStore.updateProfile({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      fatherName: fatherName.value.trim(),
      phoneNumber: apiPhoneNumber.value,
    })

    // Unchanged number on an already-confirmed account: nothing to verify.
    if (authStore.isPhoneVerified) {
      await finish()
      return
    }

    await sendCode()
  } catch (error) {
    validationError.value = authStore.errorMessage || error?.message || ''
  } finally {
    isSaving.value = false
  }
}

// Asks the backend to text the number now stored on the profile. A 409 means it
// was already confirmed — treat that as done rather than waiting for a code that
// will never come.
const sendCode = async () => {
  try {
    await authStore.sendMyPhoneOtp()
    await enterOtpStep()
  } catch (error) {
    if (error?.alreadyVerified) {
      await authStore.getUserInfo().catch(() => {})
      await finish()
      return
    }
    throw error
  }
}

const submitOtp = async () => {
  if (isVerifying.value) {
    return
  }

  validationError.value = ''

  if (otpCode.value.length !== OTP_LENGTH) {
    validationError.value = t('register.otpValidation')
    return
  }

  isVerifying.value = true

  try {
    // Confirming the phone re-issues the session token; the store swaps it in.
    await authStore.verifyOtp({
      phoneNumber: apiPhoneNumber.value,
      code: otpCode.value,
    })
    await authStore.getUserInfo().catch(() => {})
    await finish()
  } catch {
    // Wrong/expired code: clear the boxes for a clean retry.
    await otpInput.value?.clear()
  } finally {
    isVerifying.value = false
  }
}

const resendCode = async () => {
  if (isResending.value || resendRemaining.value > 0) {
    return
  }

  isResending.value = true
  validationError.value = ''

  try {
    await authStore.sendMyPhoneOtp()
    startResendCountdown()
  } catch (error) {
    if (error?.alreadyVerified) {
      await authStore.getUserInfo().catch(() => {})
      await finish()
    }
    // Anything else is already in authStore.errorMessage.
  } finally {
    isResending.value = false
  }
}

// Back to the name form to fix a mistyped number — the next save re-sends.
const backToProfile = () => {
  stopResendCountdown()
  authStore.errorMessage = ''
  validationError.value = ''
  step.value = 'profile'
}

onMounted(async () => {
  authStore.errorMessage = ''

  if (!authStore.userInfo) {
    await authStore.getUserInfo().catch(() => {})
  }

  // Prefill whatever the backend already knows — a Telegram sign-in arrives
  // with first/last name, a password sign-up with everything but fatherName.
  const info = authStore.userInfo || {}
  firstName.value = info.firstName || ''
  lastName.value = info.lastName || ''
  fatherName.value = info.fatherName || ''

  const digits = String(info.phoneNumber || '').replace(/\D/g, '')
  phoneDigits.value = digits.startsWith('998') ? digits.slice(3, 12) : digits.slice(0, 9)

  // Nothing left to collect (e.g. landed here from a stale link).
  if (!authStore.needsProfileSetup && authStore.userInfo) {
    await finish()
  }
})
</script>

<template>
  <AuthLayout>
    <div v-if="step === 'profile'" class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-[-0.02em] text-[#1a1814]">
        {{ t('completeProfile.title') }}
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-[#6b6760]">
        {{ t('completeProfile.description') }}
      </p>
    </div>

    <!-- ── Step 1: name + phone ─────────────────────────────────────── -->
    <form
      v-if="step === 'profile'"
      class="rounded-[24px] border border-[#e4e0d8] bg-white p-7 shadow-[0_18px_50px_rgba(26,24,20,0.08)] ring-1 ring-[#f0ece5]"
      @submit.prevent="submitProfile"
    >
      <div class="flex flex-col gap-4">
        <label class="block">
          <span class="mb-1.5 block text-[12px] font-semibold text-[#1a1814]">
            {{ t('completeProfile.lastName') }}
          </span>
          <input
            v-model="lastName"
            type="text"
            name="family-name"
            autocomplete="family-name"
            :placeholder="t('completeProfile.lastNamePlaceholder')"
            class="w-full rounded-xl border-[1.5px] border-[#e0ddd7] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
          />
        </label>

        <label class="block">
          <span class="mb-1.5 block text-[12px] font-semibold text-[#1a1814]">
            {{ t('completeProfile.firstName') }}
          </span>
          <input
            v-model="firstName"
            type="text"
            name="given-name"
            autocomplete="given-name"
            :placeholder="t('completeProfile.firstNamePlaceholder')"
            class="w-full rounded-xl border-[1.5px] border-[#e0ddd7] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
          />
        </label>

        <label class="block">
          <span class="mb-1.5 block text-[12px] font-semibold text-[#1a1814]">
            {{ t('completeProfile.fatherName') }}
          </span>
          <input
            v-model="fatherName"
            type="text"
            :placeholder="t('completeProfile.fatherNamePlaceholder')"
            class="w-full rounded-xl border-[1.5px] border-[#e0ddd7] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
          />
        </label>

        <label class="block">
          <span class="mb-1.5 block text-[12px] font-semibold text-[#1a1814]">
            {{ t('register.phone') }}
          </span>
          <div class="flex items-stretch overflow-hidden rounded-xl border-[1.5px] border-[#e0ddd7] bg-white transition focus-within:border-[#1a1814]">
            <span class="flex items-center border-r border-[#e0ddd7] bg-[#f5f3ef] px-3.5 text-sm font-medium text-[#1a1814]">
              +998
            </span>
            <input
              :value="phoneDisplay"
              type="tel"
              name="tel-national"
              inputmode="numeric"
              autocomplete="tel-national"
              :placeholder="t('register.phonePlaceholder')"
              class="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#1a1814] outline-none placeholder:text-[#b8b3a9]"
              @input="onPhoneInput"
            />
          </div>
          <span class="mt-1.5 block text-[12px] leading-relaxed text-[#8a857c]">
            {{ t('completeProfile.phoneHint') }}
          </span>
        </label>
      </div>

      <p
        v-if="validationError || authStore.errorMessage"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
      >
        {{ validationError || authStore.errorMessage }}
      </p>

      <button
        type="submit"
        :disabled="isSaving"
        class="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1a1814] text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {{ isSaving ? t('completeProfile.submitting') : t('completeProfile.submit') }}
      </button>
    </form>

    <!-- ── Step 2: OTP confirmation ─────────────────────────────────── -->
    <div
      v-else
      class="rounded-[24px] border border-[#e4e0d8] bg-white p-7 text-center shadow-[0_18px_50px_rgba(26,24,20,0.08)] ring-1 ring-[#f0ece5]"
    >
      <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a1814] text-white">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <path d="M9 18h6" />
        </svg>
      </div>

      <h1 class="text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">
        {{ t('register.otpTitle') }}
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-[#6b6760]">
        {{ t('register.otpSentPrefix') }}
        <b class="text-[#1a1814]">{{ fullPhoneDisplay }}</b>
        {{ t('register.otpSentSuffix') }}
      </p>

      <OtpCodeInput
        ref="otpInput"
        v-model="otpCode"
        class="mt-6"
        @complete="submitOtp"
        @enter="submitOtp"
      />

      <p
        v-if="validationError || authStore.errorMessage"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-600"
      >
        {{ validationError || authStore.errorMessage }}
      </p>

      <button
        type="button"
        :disabled="isVerifying"
        class="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1a1814] text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        @click="submitOtp"
      >
        {{ isVerifying ? t('register.otpSubmitting') : t('register.otpSubmit') }}
      </button>

      <p class="mt-5 text-sm text-[#6b6760]">
        {{ t('register.otpNotReceived') }}
        <span
          v-if="resendRemaining > 0"
          class="font-mono-custom font-semibold text-[#1a1814]"
        >
          {{ resendCountdownLabel }}
        </span>
        <button
          v-else
          type="button"
          :disabled="isResending"
          class="font-semibold text-[#1a1814] underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          @click="resendCode"
        >
          {{ t('register.otpResend') }}
        </button>
      </p>

      <button
        type="button"
        class="mt-2 text-[12.5px] font-medium text-[#8a857c] underline underline-offset-2 transition hover:text-[#1a1814]"
        @click="backToProfile"
      >
        {{ t('register.changeNumber') }}
      </button>
    </div>

    <p class="mt-6 text-center text-sm text-[#6b6760]">
      <!-- Browsing stays open: only start-test is gated on this. A signed-in
           user's "later" is the platform, not the marketing landing page. -->
      <router-link
        :to="PLATFORM_HOME"
        class="font-semibold text-[#1a1814] underline-offset-2 hover:underline"
      >
        {{ t('completeProfile.later') }}
      </router-link>
    </p>
  </AuthLayout>
</template>
