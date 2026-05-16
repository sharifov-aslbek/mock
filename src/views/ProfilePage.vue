<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const isLoading = ref(false)
const errorMessage = ref('')

const user = computed(() => authStore.userInfo || null)

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}

const profileFields = computed(() => [
  { label: 'Full Name', value: user.value?.fullName },
  { label: 'First Name', value: user.value?.firstName },
  { label: 'Last Name', value: user.value?.lastName },
  { label: 'Father Name', value: user.value?.fatherName },
  { label: 'Email', value: user.value?.email },
])

const initials = computed(() => {
  const first = user.value?.firstName?.trim()?.[0] || ''
  const last = user.value?.lastName?.trim()?.[0] || ''
  const fallback = user.value?.fullName?.trim()?.[0] || 'U'

  return `${first}${last}` || fallback
})

const loginRoute = computed(() => ({
  path: '/login',
  query: {
    redirect: route.fullPath,
  },
}))

async function loadProfile() {
  if (!authStore.isAuthenticated) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.getUserInfo()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not load profile.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <section class="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Account
          </p>
          <h1 class="mt-3 text-4xl font-black tracking-tight text-black sm:text-5xl">
            Profile
          </h1>
        </div>

        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-full border border-black bg-white px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
          :disabled="isLoading"
          @click="loadProfile"
        >
          {{ isLoading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div
        v-if="!authStore.isAuthenticated"
        class="rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-sm"
      >
        <h2 class="text-2xl font-bold text-black">Login required</h2>
        <p class="mt-2 text-sm text-gray-500">Please login to view your profile.</p>
        <RouterLink
          :to="loginRoute"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Login
        </RouterLink>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside class="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
          <div class="flex flex-col items-center text-center">
            <div class="relative">
              <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-black text-3xl font-black uppercase text-white">
                {{ initials }}
              </div>
              <span
                class="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white"
                :class="user?.emailConfirmed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'"
                :title="user?.emailConfirmed ? 'Email confirmed' : 'Email not confirmed'"
                :aria-label="user?.emailConfirmed ? 'Email confirmed' : 'Email not confirmed'"
              >
                <svg
                  v-if="user?.emailConfirmed"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" stroke-linecap="round" />
                  <path d="m6 6 12 12" stroke-linecap="round" />
                </svg>
              </span>
            </div>
            <h2 class="mt-5 text-2xl font-bold tracking-tight text-black">
              {{ displayValue(user?.fullName) }}
            </h2>
            <p class="mt-1 text-sm text-gray-500">{{ displayValue(user?.email) }}</p>
            <span
              class="mt-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
              :class="user?.emailConfirmed ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ user?.emailConfirmed ? 'Email confirmed' : 'Email not confirmed' }}
            </span>
          </div>
        </aside>

        <main class="rounded-[28px] border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center justify-between gap-3">
            <h2 class="text-xl font-bold tracking-tight text-black">Profile information</h2>
            <span
              v-if="isLoading"
              class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-black"
            ></span>
          </div>

          <p
            v-if="errorMessage"
            class="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ errorMessage }}
          </p>

          <dl class="grid gap-3">
            <div
              v-for="field in profileFields"
              :key="field.label"
              class="grid gap-1 rounded-2xl border border-black/5 bg-[#fafafa] px-4 py-3 sm:grid-cols-[180px_1fr] sm:items-center"
            >
              <dt class="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                {{ field.label }}
              </dt>
              <dd class="break-words text-sm font-semibold text-black">
                {{ displayValue(field.value) }}
              </dd>
            </div>
          </dl>
        </main>
      </div>
    </div>
  </section>
</template>
