<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    authStore.errorMessage = t('login.validation')
    return
  }

  try {
    await authStore.login(email.value, password.value)
    await router.push('/dashboard')
  } catch {
    // Store state already contains the backend or network error message.
  }
}

const handleGoogleLogin = () => {
  authStore.errorMessage = t('login.socialDisabled')
}

const handleTelegramLogin = () => {
  authStore.errorMessage = t('login.socialDisabled')
}
</script>

<template>
  <section class="relative min-h-screen bg-white px-4">
    <router-link
      to="/"
      class="absolute left-6 top-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
    >
      <span>←</span>
      <span>{{ t('login.home') }}</span>
    </router-link>

    <div class="mx-auto flex min-h-screen max-w-7xl items-center justify-center">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white"
          >
            M
          </div>
          <h1 class="text-3xl font-semibold tracking-tight text-black">
            {{ t('login.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            {{ t('login.description') }}
          </p>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div class="space-y-3">
            <button
              type="button"
              @click="handleGoogleLogin"
              class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="authStore.isLoading"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.805 10.023H12v3.955h5.617c-.242 1.272-.967 2.35-2.06 3.074v2.554h3.334c1.95-1.795 3.074-4.44 3.074-7.606 0-.66-.059-1.293-.16-1.977Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 22c2.79 0 5.133-.924 6.845-2.494l-3.334-2.554c-.924.618-2.108.984-3.511.984-2.701 0-4.989-1.823-5.805-4.274H2.75v2.635A10 10 0 0 0 12 22Z"
                  fill="#34A853"
                />
                <path
                  d="M6.195 13.662A5.998 5.998 0 0 1 5.87 12c0-.577.1-1.136.325-1.662V7.703H2.75A9.997 9.997 0 0 0 2 12c0 1.61.384 3.134 1.06 4.297l3.135-2.635Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 6.064c1.518 0 2.881.522 3.953 1.55l2.966-2.966C17.128 2.978 14.787 2 12 2A10 10 0 0 0 2.75 7.703l3.445 2.635C7.011 7.887 9.299 6.064 12 6.064Z"
                  fill="#EA4335"
                />
              </svg>
              {{ t('login.google') }}
            </button>

            <button
              type="button"
              @click="handleTelegramLogin"
              class="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="authStore.isLoading"
            >
              <svg class="h-5 w-5 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M21.944 4.666c.16-.714-.53-1.306-1.187-1.02L2.927 10.38c-.77.296-.73 1.401.058 1.64l4.55 1.377 1.76 5.51c.236.737 1.185.89 1.64.264l2.54-3.497 4.983 3.66c.611.448 1.488.11 1.647-.635l1.839-8.633ZM9.025 12.995l9.132-5.761-7.096 6.865a.75.75 0 0 0-.196.347l-.965 3.897-.875-3.53a.75.75 0 0 0-.45-.51l-2.886-1.108 3.336-1.2Z"
                />
              </svg>
              {{ t('login.telegram') }}
            </button>
          </div>

          <div class="my-6 flex items-center gap-3">
            <div class="h-px flex-1 bg-gray-200"></div>
            <span class="text-xs text-gray-400">{{ t('login.or') }}</span>
            <div class="h-px flex-1 bg-gray-200"></div>
          </div>

          <form class="space-y-4" @submit.prevent="handleLogin">
            <div>
              <label class="mb-2 block text-sm font-medium text-black">
                {{ t('login.email') }}
              </label>
              <input
                v-model="email"
                type="text"
                :placeholder="t('login.emailPlaceholder')"
                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black"
                :disabled="authStore.isLoading"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-black">
                {{ t('login.password') }}
              </label>

              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="t('login.passwordPlaceholder')"
                  class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-14 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black"
                  :disabled="authStore.isLoading"
                />

                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-black"
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
              <label class="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-black focus:ring-0"
                />
                {{ t('login.remember') }}
              </label>

              <a href="#" class="text-sm text-gray-500 hover:text-black">
                {{ t('login.forgot') }}
              </a>
            </div>

            <button
              type="submit"
              class="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400"
              :disabled="authStore.isLoading"
            >
              {{ authStore.isLoading ? t('login.loading') : t('login.submit') }}
            </button>
          </form>
        </div>

        <p class="mt-6 text-center text-sm text-gray-500">
          {{ t('login.noAccount') }}
          <a href="#" class="font-medium text-black hover:underline">
            {{ t('login.signUp') }}
          </a>
        </p>
      </div>
    </div>
  </section>
</template>
