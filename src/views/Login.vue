<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { onMounted, ref } from 'vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { PLATFORM_HOME } from '@/composables/usePlatformEntry'

// Telegram Login. We drive the OAuth popup ourselves via `Telegram.Login.auth`
// (defined by telegram-widget.js) instead of embedding Telegram's iframe widget.
// The iframe button lives on a cross-origin origin so its look can't be changed,
// and in the "Log in as <name>" state it draws a bordered avatar/logo circle that
// looks off against our design. A custom button gives us a clean, on-brand plane
// icon with no stray borders. 8302060174 is the public numeric id of @milliymock_bot.
const TELEGRAM_BOT_ID = 8302060174
const TELEGRAM_WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22'

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// Minimal shape of the Google Identity Services credential callback payload.
interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

declare global {
  interface Window {
    Telegram?: {
      Login?: {
        auth: (
          options: { bot_id: number; request_access?: string; lang?: string },
          callback: (user: TelegramUser | false | null) => void,
        ) => void;
      };
    };
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const telegramButton = ref<HTMLElement | null>(null)
const googleContainer = ref<HTMLElement | null>(null)
const telegramReady = ref(false)
const telegramSubmitting = ref(false)

// After any successful login, honour a `?redirect=` target if present,
// otherwise fall back to the math dashboard.
const redirectAfterAuth = () => {
  // Default to the platform, not /math: signing in is entering the product, and
  // landing back on the public subject catalogue made "Platformaga kirish" a
  // button that never reached the platform. A `?redirect=` from the guard (or
  // from a landing CTA) still wins.
  const redirectTarget =
    typeof route.query.redirect === 'string' && route.query.redirect
      ? route.query.redirect
      : PLATFORM_HOME
  return router.push(redirectTarget)
}

const redirectQuery =
  typeof route.query.redirect === 'string' && route.query.redirect
    ? { redirect: route.query.redirect }
    : {}

// "No account?" leads to the phone registration page; "Unutdingizmi?" to the
// OTP verify flow. Both keep the post-auth redirect target intact.
const registerLocation = { path: '/register', query: redirectQuery }
const forgotLocation = { path: '/verify-phone', query: redirectQuery }

// Email/phone + password login (design frame 1a). The store picks the
// Email vs PhoneNumber field from the identifier's shape.
const identifier = ref('')
const password = ref('')
const showPassword = ref(false)
const validationError = ref('')

const submitPasswordLogin = async () => {
  validationError.value = ''
  if (!identifier.value.trim() || !password.value) {
    validationError.value = t('login.validation')
    return
  }
  try {
    await authStore.login(identifier.value, password.value)
    await redirectAfterAuth()
  } catch (error: any) {
    // An account whose phone was never OTP-confirmed can't log in — hand the
    // user to the verify flow with the number they just tried prefilled.
    if (error?.phoneNotVerified) {
      const digits = identifier.value.replace(/\D/g, '')
      await router.push({
        path: '/verify-phone',
        query: {
          reason: 'unverified',
          ...(digits.length >= 9
            ? { phone: digits.length === 9 ? `998${digits}` : digits }
            : {}),
          ...redirectQuery,
        },
      })
      return
    }
    // Store state already holds the backend/network error message.
  }
}

// Load telegram-widget.js once so `window.Telegram.Login.auth` exists. Loaded
// WITHOUT any data-telegram-login attributes, so it only defines the API and
// renders no iframe of its own — our custom button drives the popup.
onMounted(() => {
  const markReady = () => {
    telegramReady.value = Boolean(window.Telegram?.Login?.auth)
  }
  if (window.Telegram?.Login?.auth) {
    markReady()
    return
  }
  const existing = document.querySelector<HTMLScriptElement>(
    'script[src^="https://telegram.org/js/telegram-widget.js"]',
  )
  if (existing) {
    existing.addEventListener('load', markReady)
    markReady()
    return
  }
  const script = document.createElement('script')
  script.src = TELEGRAM_WIDGET_SRC
  script.async = true
  script.onload = markReady
  document.head.appendChild(script)
})

// Open Telegram's OAuth popup. Called synchronously from the click handler so
// the browser keeps `window.open` inside the user gesture (no popup blocker).
// The button is disabled until `telegramReady`, so `auth` is present here.
const loginWithTelegram = () => {
  const auth = window.Telegram?.Login?.auth
  if (!auth || telegramSubmitting.value) return

  telegramSubmitting.value = true
  auth({ bot_id: TELEGRAM_BOT_ID, request_access: 'write' }, (user) => {
    // `user` is false/null when the popup is closed or access is declined.
    if (!user) {
      telegramSubmitting.value = false
      return
    }
    authStore
      .telegramLogin(user)
      .then(() => redirectAfterAuth())
      .catch(() => {})
      .finally(() => {
        telegramSubmitting.value = false
      })
  })
}

// Google Identity Services. Loads the GIS client, then renders the official
// sign-in button. On success Google hands us a `credential` (a JWT id token)
// which we forward to the backend for verification.
onMounted(() => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId || !googleContainer.value) return

  const initGoogle = () => {
    if (!window.google || !googleContainer.value) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: GoogleCredentialResponse) => {
        try {
          await authStore.googleLogin(response.credential)
          await redirectAfterAuth()
        } catch {
          // Store state already holds the backend/network error message.
        }
      },
    })

    window.google.accounts.id.renderButton(googleContainer.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'center',
      width: 320,
    })
  }

  // The script may already be loaded (e.g. SPA navigation back to /login).
  if (window.google?.accounts?.id) {
    initGoogle()
    return
  }

  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = initGoogle
  document.head.appendChild(script)
})


const highlightTelegram = ref(false)

// Legacy deep link (`?focus=telegram` from the pricing CTA): scroll to and
// highlight the Telegram button, which also registers social accounts.
const focusTelegram = () => {
  const element = telegramButton.value
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  highlightTelegram.value = true
  window.setTimeout(() => {
    highlightTelegram.value = false
  }, 1800)
}

// Pages can redirect here with `?reason=auth-required` to explain why the
// user landed back on login (typically: tried to open the test page while
// logged out). Show a small toast so the prompt isn't silent.
onMounted(() => {
  // Don't resurface an error left over from a previous auth attempt.
  authStore.errorMessage = ''
  if (route.query.reason === 'auth-required') {
    message.warning(t('testPage.authRequired'), { duration: 3500 })
  }
  // Deep-link from the pricing "register" CTA → scroll to + highlight the
  // Telegram sign-up widget (registration only happens through it).
  if (route.query.focus === 'telegram') {
    window.setTimeout(focusTelegram, 400)
  }
})


</script>

<template>
  <AuthLayout>
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-[-0.02em] text-[#1a1814]">
        {{ t('login.title') }}
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-[#6b6760]">
        {{ t('login.description') }}
      </p>
    </div>

    <div class="rounded-[24px] border border-[#e4e0d8] bg-white p-7 shadow-[0_18px_50px_rgba(26,24,20,0.08)] ring-1 ring-[#f0ece5]">
      <!-- Email/phone + password login (POST /auth/login). -->
      <form novalidate @submit.prevent="submitPasswordLogin">
        <div>
          <label
            for="login-identifier"
            class="mb-1.5 block text-[13px] font-semibold text-[#1a1814]"
          >
            {{ t('login.email') }}
          </label>
          <input
            id="login-identifier"
            v-model="identifier"
            type="text"
            name="username"
            autocomplete="username"
            :placeholder="t('login.emailPlaceholder')"
            class="w-full rounded-xl border-[1.5px] border-[#dcd8d0] bg-white px-4 py-3 text-[15px] text-[#1a1814] outline-none transition placeholder:text-[#b5b0a6] focus:border-[#1a1814]"
          />
        </div>

        <div class="mt-4">
          <div class="mb-1.5 flex items-center justify-between">
            <label
              for="login-password"
              class="text-[13px] font-semibold text-[#1a1814]"
            >
              {{ t('login.password') }}
            </label>
            <router-link
              :to="forgotLocation"
              class="text-xs font-medium text-[#8a857c] transition hover:text-[#1a1814]"
            >
              {{ t('login.forgot') }}
            </router-link>
          </div>
          <div class="relative">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              :placeholder="t('login.passwordPlaceholder')"
              class="w-full rounded-xl border-[1.5px] border-[#dcd8d0] bg-white py-3 pl-4 pr-24 text-[15px] text-[#1a1814] outline-none transition placeholder:text-[#b5b0a6] focus:border-[#1a1814]"
            />
            <button
              type="button"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8a857c] transition hover:text-[#1a1814]"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? t('login.hide') : t('login.show') }}
            </button>
          </div>
        </div>

        <!-- Form validation + any auth error (password or social flows). -->
        <p
          v-if="validationError || authStore.errorMessage"
          class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ validationError || authStore.errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="mt-5 h-11 w-full rounded-full bg-[#1a1814] text-[15px] font-semibold text-white transition hover:bg-[#2b2b2b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ authStore.isLoading ? t('login.loading') : t('login.submit') }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-[#6b6760]">
        {{ t('login.noAccount') }}
        <router-link
          :to="registerLocation"
          class="font-semibold text-[#1a1814] underline underline-offset-2"
        >
          {{ t('login.signUp') }}
        </router-link>
      </p>

      <div class="my-5 flex items-center gap-3">
        <div class="h-px flex-1 bg-[#e4e0d8]"></div>
        <span class="text-xs text-[#8a857c]">{{ t('login.or') }}</span>
        <div class="h-px flex-1 bg-[#e4e0d8]"></div>
      </div>

      <!-- Custom Telegram login button (also the registration entry point).
           Drives Telegram's OAuth popup via Telegram.Login.auth so we own
           the styling — a clean plane icon, no cross-origin iframe. -->
      <button
        ref="telegramButton"
        type="button"
        :disabled="!telegramReady || telegramSubmitting"
        @click="loginWithTelegram"
        class="tg-button mx-auto flex h-11 w-[320px] max-w-full items-center justify-center gap-2.5 rounded-full bg-[#29a9eb] text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(41,169,235,0.28)] transition hover:bg-[#1e97d6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        :class="highlightTelegram ? 'tg-pulse ring-2 ring-[#1a1814] ring-offset-4 ring-offset-white' : ''"
      >
        <svg class="h-[18px] w-[18px]" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
          <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
        </svg>
        <span>{{ telegramSubmitting ? t('login.loading') : t('login.telegram') }}</span>
      </button>

      <!-- Google Identity Services renders its sign-in button here. -->
      <div
        ref="googleContainer"
        class="mt-3 flex min-h-[44px] items-center justify-center"
      ></div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.tg-pulse {
  animation: tg-pulse 0.9s ease-in-out 2;
}

@keyframes tg-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tg-pulse {
    animation: none;
  }
}
</style>
