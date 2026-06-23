<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import { onMounted, onUnmounted, ref } from 'vue'
import logoBlack from '@/assets/logo-black.jpg'
import logoMark from '@/assets/logo-removed.png'

const telegramContainer = ref<HTMLElement | null>(null)
const googleContainer = ref<HTMLElement | null>(null)

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
    onTelegramAuth: (user: TelegramUser) => void;
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


onMounted(() => {
  if (!telegramContainer.value) return

  // Listen for postMessage from Telegram popup
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== 'https://oauth.telegram.org') return

    // Telegram's OAuth origin posts several message types, not all JSON — guard
    // the parse so a non-JSON payload doesn't throw inside the listener.
    let data
    try {
      data =
        typeof event.data === 'string'
            ? JSON.parse(event.data)
            : event.data
    } catch {
      return
    }

    if (data?.event === 'auth_user' && data?.auth_data) {
      const user: TelegramUser = data.auth_data

      authStore.telegramLogin(user)
          .then(() => {
            redirectAfterAuth()
          })
          .catch(() => {})
    }
  }

  window.addEventListener('message', handleMessage)

  window.onTelegramAuth = async (user: TelegramUser) => {
    try {
      await authStore.telegramLogin(user)
      await redirectAfterAuth()
    } catch {}
  }

  const script = document.createElement('script')
  script.src = 'https://telegram.org/js/telegram-widget.js?66'
  script.async = true
  script.setAttribute('data-telegram-login', 'milliymock_bot')
  script.setAttribute('data-size', 'large')
  script.setAttribute('data-onauth', 'window.onTelegramAuth')
  script.setAttribute('data-request-access', 'write')

  telegramContainer.value.appendChild(script)

  // Store handler ref for cleanup
  ;(window as any)._tgMessageHandler = handleMessage
})

onUnmounted(() => {
  window.removeEventListener('message', (window as any)._tgMessageHandler)
  delete window.onTelegramAuth
})

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


const email = ref('')
const password = ref('')
const showPassword = ref(false)
const highlightTelegram = ref(false)

// Registration happens through the Telegram widget — there is no separate
// sign-up page. The "sign up" link scrolls to and highlights the widget.
const focusTelegram = () => {
  const element = telegramContainer.value
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  highlightTelegram.value = true
  window.setTimeout(() => {
    highlightTelegram.value = false
  }, 1800)
}
const { t, tm } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

// After any successful login, honour a `?redirect=` target if present,
// otherwise fall back to the math dashboard.
const redirectAfterAuth = () => {
  const redirectTarget =
    typeof route.query.redirect === 'string' ? route.query.redirect : '/math'
  return router.push(redirectTarget)
}

// hello world
// Pages can redirect here with `?reason=auth-required` to explain why the
// user landed back on login (typically: tried to open the test page while
// logged out). Show a small toast so the prompt isn't silent.
onMounted(() => {
  if (route.query.reason === 'auth-required') {
    message.warning(t('testPage.authRequired'), { duration: 3500 })
  }
  // Deep-link from the pricing "register" CTA → scroll to + highlight the
  // Telegram sign-up widget (registration only happens through it).
  if (route.query.focus === 'telegram') {
    window.setTimeout(focusTelegram, 400)
  }
})


const handleLogin = async () => {
  if (!email.value || !password.value) {
    authStore.errorMessage = t('login.validation')
    return
  }

  try {
    await authStore.login(email.value, password.value)
    await redirectAfterAuth()
  } catch {
    // Store state already contains the backend or network error message.
  }
}

</script>

<template>
  <section class="relative min-h-screen w-full bg-[#f5f3ef] font-sans-custom selection:bg-black selection:text-white lg:grid lg:grid-cols-2">
    <!-- Brand panel (desktop only) -->
    <aside class="login-aside relative hidden overflow-hidden bg-[#1a1814] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="login-dots pointer-events-none absolute inset-0"></div>
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
        <div class="login-form w-full max-w-md">
          <div class="mb-8 text-center">
            <div class="mb-5 flex items-center justify-center gap-2 lg:hidden">
              <img :src="logoBlack" alt="MilliyMock" class="h-9 w-auto object-contain" />
              <span class="text-[18px] font-bold tracking-[-0.025em] text-[#1a1814]">MilliyMock</span>
            </div>
            <h1 class="text-3xl font-bold tracking-[-0.02em] text-[#1a1814]">
              {{ t('login.title') }}
            </h1>
            <p class="mt-3 text-sm leading-relaxed text-[#6b6760]">
              {{ t('login.description') }}
            </p>
          </div>

          <div class="rounded-[24px] border border-[#e4e0d8] bg-white p-7 shadow-[0_18px_50px_rgba(26,24,20,0.08)] ring-1 ring-[#f0ece5]">
            <!-- Telegram login widget mounts here (also used for registration) -->
            <div
              ref="telegramContainer"
              class="flex min-h-[44px] items-center justify-center rounded-xl transition duration-500"
              :class="highlightTelegram ? 'tg-pulse ring-2 ring-[#1a1814] ring-offset-4 ring-offset-white' : ''"
            ></div>

            <!-- Google Identity Services renders its sign-in button here. -->
            <div
              ref="googleContainer"
              class="mt-3 flex min-h-[44px] items-center justify-center"
            ></div>

            <div class="my-6 flex items-center gap-3">
              <div class="h-px flex-1 bg-[#ece8e0]"></div>
              <span class="font-mono-custom text-[11px] uppercase tracking-[0.14em] text-[#a39e94]">{{ t('login.or') }}</span>
              <div class="h-px flex-1 bg-[#ece8e0]"></div>
            </div>

            <form class="space-y-4" @submit.prevent="handleLogin">
              <div>
                <label class="mb-2 block text-sm font-semibold text-[#1a1814]">
                  {{ t('login.email') }}
                </label>
                <input
                  v-model="email"
                  type="text"
                  :placeholder="t('login.emailPlaceholder')"
                  class="w-full rounded-xl border border-[#e4e0d8] bg-[#faf9f6] px-4 py-3 text-sm text-[#1a1814] outline-none transition placeholder:text-[#a39e94] focus:border-[#1a1814] focus:bg-white focus:ring-4 focus:ring-[#1a1814]/5"
                  :disabled="authStore.isLoading"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-semibold text-[#1a1814]">
                  {{ t('login.password') }}
                </label>

                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="t('login.passwordPlaceholder')"
                    class="w-full rounded-xl border border-[#e4e0d8] bg-[#faf9f6] px-4 py-3 pr-16 text-sm text-[#1a1814] outline-none transition placeholder:text-[#a39e94] focus:border-[#1a1814] focus:bg-white focus:ring-4 focus:ring-[#1a1814]/5"
                    :disabled="authStore.isLoading"
                  />

                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-[#8a857c] transition hover:bg-[#f5f3ef] hover:text-[#1a1814]"
                    :disabled="authStore.isLoading"
                  >
                    {{ showPassword ? t('login.hide') : t('login.show') }}
                  </button>
                </div>
              </div>

              <p
                v-if="authStore.errorMessage"
                class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {{ authStore.errorMessage }}
              </p>

              <div class="flex items-center justify-between pt-1">
                <label class="flex cursor-pointer items-center gap-2 text-sm text-[#6b6760]">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-[#d8d3ca] text-[#1a1814] focus:ring-0"
                  />
                  {{ t('login.remember') }}
                </label>

                <a href="#" class="text-sm font-medium text-[#8a857c] transition hover:text-[#1a1814]">
                  {{ t('login.forgot') }}
                </a>
              </div>

              <button
                type="submit"
                class="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1a1814] px-4 text-sm font-semibold text-white transition duration-300 hover:bg-black active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#a39e94]"
                :disabled="authStore.isLoading"
              >
                {{ authStore.isLoading ? t('login.loading') : t('login.submit') }}
              </button>
            </form>
          </div>

          <p class="mt-6 text-center text-sm text-[#6b6760]">
            {{ t('login.noAccount') }}
            <button
              type="button"
              @click="focusTelegram"
              class="font-semibold text-[#1a1814] underline-offset-2 hover:underline"
            >
              {{ t('login.signUp') }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-dots {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
  background-size: 26px 26px;
  opacity: 0.08;
  -webkit-mask-image: radial-gradient(ellipse 90% 70% at 30% 20%, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse 90% 70% at 30% 20%, #000 20%, transparent 75%);
}

/* Entrance transitions on mount */
.login-aside {
  animation: login-slide-left 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.login-form {
  animation: login-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.07s both;
}

@keyframes login-slide-left {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes login-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  .login-aside,
  .login-form,
  .tg-pulse {
    animation: none;
  }
}
</style>
