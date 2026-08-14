<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import OtpCodeInput from '@/components/auth/OtpCodeInput.vue'
import { useResendCountdown } from '@/composables/useResendCountdown'
import { formatPhoneDigits } from '@/utils/phone'
import { PLATFORM_HOME } from '@/composables/usePlatformEntry'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

// 'form' → name + phone + password, POST /auth/register sends the SMS code;
// 'otp'  → 6-digit confirmation, POST /auth/verify-otp starts the session.
const step = ref('form')

const firstName = ref('')
const lastName = ref('')
// The national part only (9 digits, e.g. "901234567") — the +998 prefix is a
// fixed box in the UI and re-attached when calling the API.
const phoneDigits = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const validationError = ref('')

const PASSWORD_MIN_LENGTH = 6
const OTP_LENGTH = 6

const otpCode = ref('')
const otpInput = ref(null)
const isVerifying = ref(false)
const isResending = ref(false)

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
  // Rewrite the input so stray characters vanish and grouping stays live.
  event.target.value = formatPhoneDigits(phoneDigits.value)
}

const redirectQuery = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect
    ? { redirect: route.query.redirect }
    : {},
)

const redirectAfterAuth = () => {
  // Same as Login: finishing registration lands the student in the platform,
  // not back on the public catalogue.
  const redirectTarget =
    typeof route.query.redirect === 'string' && route.query.redirect
      ? route.query.redirect
      : PLATFORM_HOME
  return router.push(redirectTarget)
}

const enterOtpStep = async () => {
  step.value = 'otp'
  otpCode.value = ''
  startResendCountdown()
  await nextTick()
  otpInput.value?.focus()
}

const submitRegisterForm = async () => {
  if (authStore.isLoading) {
    return
  }

  validationError.value = ''

  if (!firstName.value.trim() || !lastName.value.trim() || phoneDigits.value.length !== 9) {
    validationError.value = t('register.validation')
    return
  }

  if (password.value.length < PASSWORD_MIN_LENGTH) {
    validationError.value = t('register.passwordValidation')
    return
  }

  if (password.value !== passwordConfirm.value) {
    validationError.value = t('register.passwordMismatch')
    return
  }

  try {
    await authStore.register({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      phoneNumber: apiPhoneNumber.value,
      password: password.value,
    })
    await enterOtpStep()
  } catch {
    // authStore.errorMessage already carries the backend message.
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
    const result = await authStore.verifyOtp({
      phoneNumber: apiPhoneNumber.value,
      code: otpCode.value,
    })

    if (result?.token) {
      await redirectAfterAuth()
      return
    }

    // Verified but no session token — send them through the normal login.
    message.success(t('register.registered'), { duration: 4000 })
    await router.push({ path: '/login', query: redirectQuery.value })
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

  try {
    await authStore.resendOtp({ phoneNumber: apiPhoneNumber.value })
    message.success(t('register.otpResent'), { duration: 3000 })
    startResendCountdown()
  } catch {
    // authStore.errorMessage already carries the backend message.
  } finally {
    isResending.value = false
  }
}

const backToForm = () => {
  stopResendCountdown()
  authStore.errorMessage = ''
  validationError.value = ''
  step.value = 'form'
}

onMounted(() => {
  // A fresh visit shouldn't show a stale error from the login page.
  authStore.errorMessage = ''
})
</script>

<template>
  <AuthLayout>
    <div v-if="step === 'form'" class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-[-0.02em] text-[#1a1814]">
        {{ t('register.title') }}
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-[#6b6760]">
        {{ t('register.description') }}
      </p>
    </div>

    <!-- ── Step 1: name + phone + password ──────────────────────────── -->
    <form
      v-if="step === 'form'"
      class="rounded-[24px] border border-[#e4e0d8] bg-white p-7 shadow-[0_18px_50px_rgba(26,24,20,0.08)] ring-1 ring-[#f0ece5]"
      @submit.prevent="submitRegisterForm"
    >
      <div class="flex flex-col gap-4">
        <div class="flex gap-3">
          <label class="flex-1">
            <span class="mb-1.5 block text-[12px] font-semibold text-[#1a1814]">
              {{ t('register.firstName') }}
            </span>
            <input
              v-model="firstName"
              type="text"
              name="given-name"
              autocomplete="given-name"
              :placeholder="t('register.firstNamePlaceholder')"
              class="w-full rounded-xl border-[1.5px] border-[#e0ddd7] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
            />
          </label>
          <label class="flex-1">
            <span class="mb-1.5 block text-[12px] font-semibold text-[#1a1814]">
              {{ t('register.lastName') }}
            </span>
            <input
              v-model="lastName"
              type="text"
              name="family-name"
              autocomplete="family-name"
              :placeholder="t('register.lastNamePlaceholder')"
              class="w-full rounded-xl border-[1.5px] border-[#e0ddd7] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
            />
          </label>
        </div>

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
        </label>

        <label class="block">
          <span class="mb-1.5 flex items-center justify-between text-[12px] font-semibold text-[#1a1814]">
            {{ t('register.password') }}
            <button
              type="button"
              class="font-medium text-[#8a857c] transition hover:text-[#1a1814]"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? t('login.hide') : t('login.show') }}
            </button>
          </span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="new-password"
            autocomplete="new-password"
            :placeholder="t('register.passwordPlaceholder')"
            class="w-full rounded-xl border-[1.5px] border-[#e0ddd7] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
          />
        </label>

        <label class="block">
          <span class="mb-1.5 block text-[12px] font-semibold text-[#1a1814]">
            {{ t('register.passwordConfirm') }}
          </span>
          <input
            v-model="passwordConfirm"
            :type="showPassword ? 'text' : 'password'"
            name="confirm-password"
            autocomplete="new-password"
            :placeholder="t('register.passwordConfirmPlaceholder')"
            class="w-full rounded-xl border-[1.5px] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
            :class="passwordConfirm && passwordConfirm !== password ? 'border-red-300' : 'border-[#e0ddd7]'"
          />
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
        :disabled="authStore.isLoading"
        class="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1a1814] text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {{ authStore.isLoading ? t('register.submitting') : t('register.continue') }}
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
        @click="backToForm"
      >
        {{ t('register.changeNumber') }}
      </button>
    </div>

    <p v-if="step === 'form'" class="mt-6 text-center text-sm text-[#6b6760]">
      {{ t('register.haveAccount') }}
      <router-link
        :to="{ path: '/login', query: redirectQuery }"
        class="font-semibold text-[#1a1814] underline-offset-2 hover:underline"
      >
        {{ t('register.signIn') }}
      </router-link>
    </p>
  </AuthLayout>
</template>
