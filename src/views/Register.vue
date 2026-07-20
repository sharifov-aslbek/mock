<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import logoBlack from '@/assets/logo-black.jpg'
import logoMark from '@/assets/logo-removed.png'

const { t, tm } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

// 'form' → name + phone, POST /auth/register sends the SMS code;
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
const otpDigits = ref(Array(OTP_LENGTH).fill(''))
const otpInputs = ref([])

const RESEND_COOLDOWN_SECONDS = 60
const resendRemaining = ref(0)
let resendIntervalId = null
const isResending = ref(false)
const isVerifying = ref(false)

const setOtpInputRef = (element, index) => {
  otpInputs.value[index] = element
}

// "90 123 45 67" grouping, used both inside the input and in the OTP subtitle.
const formatPhoneDigits = (digits) =>
  [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(' ')

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
  const redirectTarget =
    typeof route.query.redirect === 'string' && route.query.redirect
      ? route.query.redirect
      : '/math'
  return router.push(redirectTarget)
}

const stopResendCountdown = () => {
  if (resendIntervalId) {
    clearInterval(resendIntervalId)
    resendIntervalId = null
  }
}

const startResendCountdown = () => {
  stopResendCountdown()
  resendRemaining.value = RESEND_COOLDOWN_SECONDS
  resendIntervalId = window.setInterval(() => {
    resendRemaining.value -= 1
    if (resendRemaining.value <= 0) {
      stopResendCountdown()
    }
  }, 1000)
}

const resendCountdownLabel = computed(() => {
  const minutes = String(Math.floor(resendRemaining.value / 60)).padStart(2, '0')
  const seconds = String(resendRemaining.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const focusOtpInput = (index) => {
  const input = otpInputs.value[index]
  if (input) {
    input.focus()
    input.select?.()
  }
}

const enterOtpStep = async () => {
  step.value = 'otp'
  otpDigits.value = Array(OTP_LENGTH).fill('')
  startResendCountdown()
  await nextTick()
  focusOtpInput(0)
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
  const code = otpDigits.value.join('')

  if (code.length !== OTP_LENGTH) {
    validationError.value = t('register.otpValidation')
    return
  }

  isVerifying.value = true

  try {
    const result = await authStore.verifyOtp({
      phoneNumber: apiPhoneNumber.value,
      code,
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
    otpDigits.value = Array(OTP_LENGTH).fill('')
    await nextTick()
    focusOtpInput(0)
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

const onOtpInput = (index, event) => {
  const digits = String(event.target.value).replace(/\D/g, '')

  if (!digits) {
    otpDigits.value[index] = ''
    event.target.value = ''
    return
  }

  // Typing normally gives one digit; an autofill/paste into a box can give
  // several — spread them across the following boxes.
  const nextValues = [...otpDigits.value]
  let cursor = index
  for (const digit of digits.slice(0, OTP_LENGTH - index)) {
    nextValues[cursor] = digit
    cursor += 1
  }
  otpDigits.value = nextValues
  event.target.value = nextValues[index]

  if (cursor < OTP_LENGTH) {
    focusOtpInput(cursor)
  } else {
    focusOtpInput(OTP_LENGTH - 1)
    void submitOtp()
  }
}

const onOtpKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    focusOtpInput(index - 1)
    event.preventDefault()
  } else if (event.key === 'ArrowLeft' && index > 0) {
    focusOtpInput(index - 1)
    event.preventDefault()
  } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
    focusOtpInput(index + 1)
    event.preventDefault()
  } else if (event.key === 'Enter') {
    void submitOtp()
  }
}

const onOtpPaste = (event) => {
  const pasted = String(event.clipboardData?.getData('text') || '').replace(/\D/g, '')
  if (!pasted) {
    return
  }
  event.preventDefault()
  const nextValues = Array(OTP_LENGTH).fill('')
  for (let index = 0; index < Math.min(pasted.length, OTP_LENGTH); index += 1) {
    nextValues[index] = pasted[index]
  }
  otpDigits.value = nextValues
  if (pasted.length >= OTP_LENGTH) {
    void submitOtp()
  } else {
    focusOtpInput(pasted.length)
  }
}

onMounted(() => {
  // A fresh visit shouldn't show a stale error from the login page.
  authStore.errorMessage = ''
})

onBeforeUnmount(stopResendCountdown)
</script>

<template>
  <section class="relative min-h-screen w-full bg-[#f5f3ef] font-sans-custom selection:bg-black selection:text-white lg:grid lg:grid-cols-2">
    <!-- Brand panel (desktop only) — mirrors the login page -->
    <aside class="register-aside relative hidden overflow-hidden bg-[#1a1814] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="register-dots pointer-events-none absolute inset-0"></div>
      <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl"></div>

      <router-link to="/" class="relative flex items-center gap-2.5">
        <img :src="logoMark" alt="MilliyMock" class="h-9 w-auto object-contain" />
        <span class="text-[17px] font-bold tracking-[-0.025em] text-white">MilliyMock</span>
      </router-link>

      <div class="relative max-w-md">
        <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          MilliyMock
        </span>
        <h2 class="mt-4 text-3xl font-bold leading-[1.15] tracking-[-0.02em] xl:text-[2.5rem]">
          {{ t('login.brandTagline') }}
        </h2>
        <ul class="mt-9 space-y-4">
          <li
            v-for="(point, index) in tm('login.points')"
            :key="index"
            class="flex items-start gap-3 text-[15px] leading-relaxed text-white/75"
          >
            <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1814]">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span>{{ point }}</span>
          </li>
        </ul>
      </div>

      <p class="relative font-mono-custom text-[11px] uppercase tracking-[0.18em] text-white/35">
        © 2026 MilliyMock
      </p>
    </aside>

    <!-- Form panel -->
    <div class="relative flex min-h-screen flex-col px-4 py-7 sm:px-8">
      <router-link
        to="/"
        class="inline-flex items-center gap-2 text-sm font-medium text-[#8a857c] transition hover:text-[#1a1814]"
      >
        <span class="text-base">←</span>
        <span>{{ t('login.home') }}</span>
      </router-link>

      <div class="flex flex-1 items-center justify-center py-8">
        <div class="register-form w-full max-w-md">
          <div class="mb-8 text-center">
            <div class="mb-5 flex items-center justify-center gap-2 lg:hidden">
              <img :src="logoBlack" alt="MilliyMock" class="h-9 w-auto object-contain" />
              <span class="text-[18px] font-bold tracking-[-0.025em] text-[#1a1814]">MilliyMock</span>
            </div>

            <template v-if="step === 'form'">
              <h1 class="text-3xl font-bold tracking-[-0.02em] text-[#1a1814]">
                {{ t('register.title') }}
              </h1>
              <p class="mt-3 text-sm leading-relaxed text-[#6b6760]">
                {{ t('register.description') }}
              </p>
            </template>
          </div>

          <!-- ── Step 1: name + phone ─────────────────────────────────── -->
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

          <!-- ── Step 2: OTP confirmation ─────────────────────────────── -->
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

            <div class="mt-6 flex justify-center gap-2" @paste="onOtpPaste">
              <input
                v-for="(digit, index) in otpDigits"
                :key="index"
                :ref="(element) => setOtpInputRef(element, index)"
                :value="digit"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                class="h-[52px] w-[42px] rounded-xl border-[1.5px] bg-white text-center text-xl font-bold text-[#1a1814] outline-none transition focus:border-[#1a1814]"
                :class="digit ? 'border-[#1a1814]' : 'border-[#e0ddd7]'"
                @input="onOtpInput(index, $event)"
                @keydown="onOtpKeydown(index, $event)"
              />
            </div>

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
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.register-dots {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
  background-size: 26px 26px;
  opacity: 0.08;
  -webkit-mask-image: radial-gradient(ellipse 90% 70% at 30% 20%, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse 90% 70% at 30% 20%, #000 20%, transparent 75%);
}

.register-aside {
  animation: register-slide-left 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.register-form {
  animation: register-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.07s both;
}

@keyframes register-slide-left {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes register-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .register-aside,
  .register-form {
    animation: none;
  }
}
</style>
