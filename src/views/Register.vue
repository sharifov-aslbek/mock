<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import OtpCodeInput from '@/components/auth/OtpCodeInput.vue'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons.vue'
import AuthSwitchCta from '@/components/auth/AuthSwitchCta.vue'
import TelegramCodeLink from '@/components/auth/TelegramCodeLink.vue'
import { PLATFORM_HOME } from '@/composables/usePlatformEntry'
import { resolvePostAuthRoute } from '@/utils/postAuth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

// Phone sign-up runs through the Telegram bot (@milliymock_bot); the number
// itself never passes through this page.
//  'form' → name + password. POST /auth/register/telegram answers with a
//           ticket and a bot deep link that carries it.
//  'otp'  → the user opens that link, shares their contact with the bot, the
//           bot shows a 6-digit code, and POST /auth/register/telegram/verify
//           turns ticket + code into a session (same LoginResultDto as login).
const step = ref('form')

const firstName = ref('')
const lastName = ref('')
const fatherName = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const validationError = ref('')

const PASSWORD_MIN_LENGTH = 6
const OTP_LENGTH = 6
const DEFAULT_TICKET_MINUTES = 30

// The pending registration. Mirrored into sessionStorage so that leaving for
// the Telegram app and coming back to a reloaded tab (common on phones) lands
// on the code screen again, not on an empty form.
const STORAGE_KEY = 'milliymock_telegram_registration'
const ticket = ref('')
const botUrl = ref('')
// Epoch ms. The ticket lives `expiresInMinutes` (30) from step 1; afterwards
// the server drops it and the user starts over.
const expiresAt = ref(0)

const qrDataUrl = ref('')
const otpCode = ref('')
const otpInput = ref(null)
const isVerifying = ref(false)

// Ticket countdown, driven by a 1s tick while the code screen is up.
const now = ref(Date.now())
let tickId = null

const stopTicking = () => {
  if (tickId) {
    window.clearInterval(tickId)
    tickId = null
  }
}

const startTicking = () => {
  stopTicking()
  now.value = Date.now()
  tickId = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

const remainingSeconds = computed(() =>
  Math.max(0, Math.ceil((expiresAt.value - now.value) / 1000)),
)

const remainingLabel = computed(() => {
  const minutes = String(Math.floor(remainingSeconds.value / 60)).padStart(2, '0')
  const seconds = String(remainingSeconds.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const persistRegistration = () => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ticket: ticket.value, botUrl: botUrl.value, expiresAt: expiresAt.value }),
    )
  } catch {
    // Private mode / storage disabled: the in-memory state still carries the flow.
  }
}

const clearStoredRegistration = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}

// A stored registration that is still inside its 30-minute window, or null.
const readStoredRegistration = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const stored = JSON.parse(raw)
    if (!stored?.ticket || !stored?.botUrl || !(Number(stored.expiresAt) > Date.now())) {
      return null
    }
    return stored
  } catch {
    return null
  }
}

// Desktop users scan this with their phone to land in the bot with the ticket
// attached. The encoder is loaded on demand — it's dead weight for the form
// step and for phone users, who just tap the button.
const renderQr = async () => {
  qrDataUrl.value = ''
  if (!botUrl.value) {
    return
  }
  try {
    const { default: QRCode } = await import('qrcode')
    qrDataUrl.value = await QRCode.toDataURL(botUrl.value, {
      width: 176,
      margin: 1,
      color: { dark: '#1a1814', light: '#ffffff' },
    })
  } catch {
    // The button and link still work without the QR.
  }
}

const redirectQuery = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect
    ? { redirect: route.query.redirect }
    : {},
)

// Runs after the bot code confirms a registration AND after a Telegram/Google
// sign-in from the social buttons below the form.
const redirectAfterAuth = async () => {
  // Same as Login: finishing registration lands the student in the platform,
  // not back on the public catalogue.
  const redirectTarget =
    typeof route.query.redirect === 'string' && route.query.redirect
      ? route.query.redirect
      : PLATFORM_HOME
  // A bot-confirmed registration arrives with the full name and the phone
  // confirmed, so it goes straight through. A Telegram/Google sign-in has no
  // phone at all, so it always detours via /complete-profile.
  return router.push(await resolvePostAuthRoute(redirectTarget))
}

const enterOtpStep = async () => {
  step.value = 'otp'
  otpCode.value = ''
  validationError.value = ''
  startTicking()
  void renderQr()
  await nextTick()
  // Focus the code boxes on desktop only: on a phone that raises the keyboard
  // over the bot button, which is the thing to tap first.
  if (window.matchMedia?.('(min-width: 768px)').matches) {
    otpInput.value?.focus()
  }
}

const backToForm = () => {
  stopTicking()
  clearStoredRegistration()
  ticket.value = ''
  botUrl.value = ''
  expiresAt.value = 0
  qrDataUrl.value = ''
  otpCode.value = ''
  authStore.errorMessage = ''
  validationError.value = ''
  step.value = 'form'
}

// Our clock says the ticket is gone — same outcome as the server's "This
// registration has expired", without waiting for a doomed verify call.
const expireRegistration = () => {
  backToForm()
  validationError.value = t('authErrors.registrationExpired')
}

watch(remainingSeconds, (seconds) => {
  if (step.value === 'otp' && expiresAt.value && seconds <= 0) {
    expireRegistration()
  }
})

const submitRegisterForm = async () => {
  if (authStore.isLoading) {
    return
  }

  validationError.value = ''

  if (!firstName.value.trim() || !lastName.value.trim() || !fatherName.value.trim()) {
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
    const data = await authStore.registerTelegram({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      fatherName: fatherName.value.trim(),
      password: password.value,
    })
    ticket.value = data.ticket
    // Always the API's own link — it carries the ticket into the bot.
    botUrl.value = data.botUrl
    expiresAt.value =
      Date.now() + (Number(data.expiresInMinutes) || DEFAULT_TICKET_MINUTES) * 60_000
    persistRegistration()
    await enterOtpStep()
  } catch {
    // authStore.errorMessage already carries the localized backend message.
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
    // Same LoginResultDto as /auth/login — the store holds the token by now.
    await authStore.verifyTelegramRegistration({
      ticket: ticket.value,
      code: otpCode.value,
    })
    stopTicking()
    clearStoredRegistration()
    await redirectAfterAuth()
  } catch (error) {
    if (error?.phoneAlreadyRegistered) {
      // The number the bot saw now belongs to an account (409): this person
      // should sign in, not register.
      stopTicking()
      clearStoredRegistration()
      message.warning(t('authErrors.phoneRegisteredGoLogin'), { duration: 5000 })
      await router.push({ path: '/login', query: redirectQuery.value })
      return
    }

    if (error?.restartRegistration) {
      // Five wrong codes, or a ticket older than 30 minutes: the server dropped
      // it. Back to the form, keeping the reason on screen.
      const reason = authStore.errorMessage
      backToForm()
      validationError.value = reason
      return
    }

    // Wrong code, no code issued yet, or a code that expired in the bot: stay
    // here — the message says what to do in the bot. Clear the boxes for a
    // clean retry.
    await otpInput.value?.clear()
  } finally {
    isVerifying.value = false
  }
}

onMounted(async () => {
  // A fresh visit shouldn't show a stale error from the login page.
  authStore.errorMessage = ''

  // The test gate (test card / TestPage) sends guests here with
  // ?reason=auth-required — say why they were bounced instead of dropping them
  // on a signup form with no explanation.
  if (route.query.reason === 'auth-required') {
    message.warning(t('testPage.authRequiredRegister'), { duration: 4000 })
  }

  // Back from Telegram into a reloaded tab: pick the code screen up again.
  const stored = readStoredRegistration()
  if (stored) {
    ticket.value = stored.ticket
    botUrl.value = stored.botUrl
    expiresAt.value = Number(stored.expiresAt)
    await enterOtpStep()
  } else {
    clearStoredRegistration()
  }
})

onBeforeUnmount(stopTicking)
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

    <!-- ── Step 1: name + password (no phone — the bot supplies it) ─── -->
    <div
      v-if="step === 'form'"
      class="rounded-[24px] border border-[#e4e0d8] bg-white p-7 shadow-[0_18px_50px_rgba(26,24,20,0.08)] ring-1 ring-[#f0ece5]"
    >
      <form @submit.prevent="submitRegisterForm">
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
              {{ t('register.fatherName') }}
            </span>
            <input
              v-model="fatherName"
              type="text"
              name="additional-name"
              autocomplete="additional-name"
              :placeholder="t('register.fatherNamePlaceholder')"
              class="w-full rounded-xl border-[1.5px] border-[#e0ddd7] bg-white px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#b8b3a9] focus:border-[#1a1814]"
            />
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

      <div class="my-5 flex items-center gap-3">
        <div class="h-px flex-1 bg-[#e4e0d8]"></div>
        <span class="text-xs text-[#8a857c]">{{ t('register.or') }}</span>
        <div class="h-px flex-1 bg-[#e4e0d8]"></div>
      </div>

      <!-- Telegram + Google, the same block /login shows. Both create the
           account on first sign-in, so they are a registration path too; the
           name step happens on /complete-profile afterwards. Errors surface in
           the form's message above, via authStore.errorMessage. -->
      <SocialAuthButtons
        :telegram-label="t('register.telegram')"
        google-text="signup_with"
        @authenticated="redirectAfterAuth"
      />

      <AuthSwitchCta
        :question="t('register.haveAccount')"
        :action="t('register.signIn')"
        :to="{ path: '/login', query: redirectQuery }"
      />
    </div>

    <!-- ── Step 2: the code from the bot ────────────────────────────── -->
    <div
      v-else
      class="rounded-[24px] border border-[#e4e0d8] bg-white p-7 text-center shadow-[0_18px_50px_rgba(26,24,20,0.08)] ring-1 ring-[#f0ece5]"
    >
      <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#29a9eb] text-white">
        <svg class="h-6 w-6" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
          <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
        </svg>
      </div>

      <h1 class="text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">
        {{ t('register.otpTitle') }}
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-[#6b6760]">
        {{ t('register.botInstruction') }}
      </p>

      <!-- The user has to reach the bot THROUGH this link: it carries the ticket. -->
      <TelegramCodeLink
        class="mt-5"
        :href="botUrl"
        :label="t('register.openBot')"
        variant="primary"
      />

      <!-- Desktop only — on a phone the button above already opens the app. -->
      <div v-if="qrDataUrl" class="mt-4 hidden flex-col items-center md:flex">
        <img
          :src="qrDataUrl"
          :alt="t('register.openBot')"
          width="176"
          height="176"
          class="rounded-xl border border-[#e4e0d8] p-1"
        />
        <span class="mt-2 text-[12px] text-[#8a857c]">{{ t('register.qrHint') }}</span>
      </div>

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

      <!-- No resend endpoint: the bot re-shows the code while it's valid
           (5 min) or hands out a new one, on the same 📱 tap. -->
      <p class="mt-5 text-sm text-[#6b6760]">
        {{ t('register.botNotReceived') }}
      </p>

      <p class="mt-3 text-[12px] text-[#8a857c]">
        {{ t('register.ticketExpiresIn', { time: remainingLabel }) }}
      </p>

      <button
        type="button"
        class="mt-2 text-[12.5px] font-medium text-[#8a857c] underline underline-offset-2 transition hover:text-[#1a1814]"
        @click="backToForm"
      >
        {{ t('register.startOver') }}
      </button>
    </div>
  </AuthLayout>
</template>
