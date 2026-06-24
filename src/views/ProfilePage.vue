<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBalanceStore } from '@/stores/balance'

const authStore = useAuthStore()
const balanceStore = useBalanceStore()
const route = useRoute()

const tangaBalance = computed(() => balanceStore.available)
const isLoading = ref(false)
const errorMessage = ref('')

const user = computed(() => authStore.userInfo || null)

// Inline edit of the certificate name fields (firstName/lastName/fatherName).
// Mirrors the first-test gate so users can fill or correct these straight from
// their profile rather than only when starting a test.
const isEditing = ref(false)
const isSaving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const form = reactive({ firstName: '', lastName: '', fatherName: '' })

function startEdit() {
  form.firstName = user.value?.firstName || ''
  form.lastName = user.value?.lastName || ''
  form.fatherName = user.value?.fatherName || ''
  saveError.value = ''
  saveSuccess.value = false
  isEditing.value = true
}

function cancelEdit() {
  if (isSaving.value) {
    return
  }
  isEditing.value = false
  saveError.value = ''
}

async function saveProfile() {
  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()
  const fatherName = form.fatherName.trim()

  // All three print on the certificate — require them so saving here can't blank
  // out a name the way a partial update would.
  if (!firstName || !lastName || !fatherName) {
    saveError.value = 'Iltimos, barcha maydonlarni to‘ldiring.'
    return
  }

  isSaving.value = true
  saveError.value = ''
  saveSuccess.value = false

  try {
    await authStore.updateProfile({ firstName, lastName, fatherName })
    isEditing.value = false
    saveSuccess.value = true
  } catch (error) {
    saveError.value =
      error instanceof Error ? error.message : 'Ma’lumotlarni saqlab bo‘lmadi.'
  } finally {
    isSaving.value = false
  }
}

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Ha' : 'Yo‘q'
  }

  return String(value)
}

const profileFields = computed(() => [
  { key: 'fullName', label: 'To‘liq ism', value: user.value?.fullName, editable: false },
  { key: 'firstName', label: 'Ism', value: user.value?.firstName, editable: true },
  { key: 'lastName', label: 'Familiya', value: user.value?.lastName, editable: true },
  { key: 'fatherName', label: 'Otasining ismi', value: user.value?.fatherName, editable: true },
  { key: 'email', label: 'Email', value: user.value?.email, editable: false },
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
    balanceStore.refresh().catch(() => {})
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Profilni yuklab bo‘lmadi.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <section class="relative min-h-screen overflow-hidden bg-[#f5f3ef] px-4 py-10 font-sans-custom sm:px-6 lg:px-8">
    <!-- Ambient background — matches the main pages -->
    <div class="math-dots pointer-events-none absolute inset-0 -z-20"></div>
    <div class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#f5f3ef]/30 via-[#f5f3ef]/70 to-[#f5f3ef]"></div>
    <div class="math-blob pointer-events-none absolute -left-20 top-10 -z-10 h-[360px] w-[360px] rounded-full bg-[#e6e1d7]/50 blur-3xl"></div>
    <div class="math-blob pointer-events-none absolute -right-24 top-40 -z-10 h-[320px] w-[320px] rounded-full bg-[#ebe7e0]/60 blur-3xl"></div>
    <div class="math-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

    <div class="relative z-10 mx-auto max-w-5xl">
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a857c]">
            Hisob
          </p>
          <h1 class="mt-3 text-4xl font-bold tracking-tight text-[#1a1814] sm:text-5xl">
            Profil
          </h1>
        </div>

        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-full border border-[#1a1814] bg-white px-5 text-sm font-semibold text-[#1a1814] transition hover:bg-[#1a1814] hover:text-white"
          :disabled="isLoading"
          @click="loadProfile"
        >
          {{ isLoading ? 'Yangilanmoqda...' : 'Yangilash' }}
        </button>
      </div>

      <div
        v-if="!authStore.isAuthenticated"
        class="rounded-[28px] border border-[#e0ddd7] bg-white p-8 text-center shadow-sm"
      >
        <h2 class="text-2xl font-bold text-[#1a1814]">Kirish talab qilinadi</h2>
        <p class="mt-2 text-sm text-[#8a857c]">Profilingizni ko‘rish uchun tizimga kiring.</p>
        <RouterLink
          :to="loginRoute"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#1a1814] px-6 text-sm font-semibold text-white transition hover:bg-[#2a2722]"
        >
          Kirish
        </RouterLink>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside class="rounded-[28px] border border-[#e0ddd7] bg-white p-6 shadow-sm">
          <div class="flex flex-col items-center text-center">
            <div class="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#1a1814] text-3xl font-black uppercase text-white">
              {{ initials }}
            </div>
            <h2 class="mt-5 text-2xl font-bold tracking-tight text-[#1a1814]">
              {{ displayValue(user?.fullName) }}
            </h2>
            <p class="mt-1 text-sm text-[#8a857c]">{{ displayValue(user?.email) }}</p>
            <span
              class="mt-4 font-mono-custom rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
              :class="user?.emailConfirmed ? 'bg-green-50 text-green-700' : 'bg-[#f0ece4] text-[#8a857c]'"
            >
              {{ user?.emailConfirmed ? 'Email tasdiqlangan' : 'Email tasdiqlanmagan' }}
            </span>

            <div class="mt-6 w-full rounded-2xl border border-[#ece8e0] bg-[#faf8f4] px-4 py-4">
              <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a39e94]">
                Balans
              </p>
              <div class="mt-2 flex items-center justify-center gap-2">
                <svg class="h-5 w-5 text-[#1a1814]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4.25" />
                </svg>
                <span class="text-2xl font-bold tracking-tight text-[#1a1814] tabular-nums">{{ tangaBalance }}</span>
                <span class="text-sm font-semibold text-[#8a857c]">tanga</span>
              </div>
              <RouterLink
                to="/pricing"
                class="mt-3 inline-flex h-9 w-full items-center justify-center rounded-full border border-[#1a1814] bg-white px-4 text-xs font-semibold text-[#1a1814] transition hover:bg-[#1a1814] hover:text-white"
              >
                Hisobni to‘ldirish
              </RouterLink>
            </div>
          </div>
        </aside>

        <main class="rounded-[28px] border border-[#e0ddd7] bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center justify-between gap-3">
            <h2 class="text-xl font-bold tracking-tight text-[#1a1814]">Profil ma'lumotlari</h2>
            <div class="flex items-center gap-3">
              <span
                v-if="isLoading"
                class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#e0ddd7] border-t-[#1a1814]"
              ></span>
              <button
                v-if="!isEditing"
                type="button"
                class="inline-flex h-9 items-center justify-center rounded-full border border-[#1a1814] bg-white px-4 text-xs font-semibold text-[#1a1814] transition hover:bg-[#1a1814] hover:text-white"
                @click="startEdit"
              >
                Tahrirlash
              </button>
            </div>
          </div>

          <p
            v-if="errorMessage"
            class="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ errorMessage }}
          </p>

          <p
            v-if="saveSuccess && !isEditing"
            class="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            Ma'lumotlar saqlandi.
          </p>

          <form @submit.prevent="saveProfile">
            <dl class="grid gap-3">
              <div
                v-for="field in profileFields"
                :key="field.label"
                class="grid gap-1 rounded-2xl border border-[#ece8e0] bg-[#faf8f4] px-4 py-3 sm:grid-cols-[180px_1fr] sm:items-center"
              >
                <dt class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a39e94]">
                  {{ field.label }}
                </dt>
                <dd class="break-words text-sm font-semibold text-[#1a1814]">
                  <input
                    v-if="isEditing && field.editable"
                    v-model="form[field.key]"
                    type="text"
                    :placeholder="field.label"
                    class="w-full rounded-xl border border-[#e0ddd7] bg-white px-3 py-2 text-sm font-semibold text-[#1a1814] outline-none transition focus:border-[#1a1814]"
                  />
                  <span v-else>{{ displayValue(field.value) }}</span>
                </dd>
              </div>
            </dl>

            <p v-if="saveError" class="mt-4 text-sm font-medium text-red-600">
              {{ saveError }}
            </p>

            <div v-if="isEditing" class="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                :disabled="isSaving"
                class="inline-flex h-11 items-center justify-center rounded-full border border-[#e0ddd7] bg-white px-6 text-sm font-semibold text-[#8a857c] transition hover:text-[#1a1814] disabled:cursor-not-allowed disabled:opacity-60"
                @click="cancelEdit"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="inline-flex h-11 items-center justify-center rounded-full bg-[#1a1814] px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isSaving ? 'Saqlanmoqda...' : 'Saqlash' }}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  </section>
</template>

<style scoped>
.math-dots {
  background-image: radial-gradient(circle, #d8d3ca 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 30%, transparent 80%);
  mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 30%, transparent 80%);
  opacity: 0.5;
}

.math-grain {
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
