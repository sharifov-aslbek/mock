<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import MathTestCard from '@/components/MathTestCard.vue'
import { useAuthStore } from '@/stores/auth'
import { apiFetch, getTestApiBaseUrl, isNetworkError } from '@/utils/api'
import { isPremiumTest } from '@/utils/premium'

// Each subject maps to a set of accepted backend `subject` strings (matched
// case-insensitively) and an icon. Aliases cover likely spellings so the page
// works regardless of how the admin enum is stored. `subjectParam` is the
// backend SubjectType enum name — when set, the list request is filtered
// server-side (`GET /test?subject=…`); the alias filter stays as a safety net.
const SUBJECT_CONFIG = {
  math: {
    aliases: ['math', 'matematika', 'математика'],
    paths: ['M3 13h2.5l2.5 6L13 5h8'],
  },
  history: {
    // Scroll / manuscript — classic history symbol.
    aliases: ['history', 'tarix', 'история'],
    paths: [
      'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4',
      'M19 17V5a2 2 0 0 0-2-2H4',
    ],
  },
  physics: {
    // Atom — nucleus with two crossing electron orbits.
    aliases: ['physics', 'fizika', 'физика'],
    paths: [
      'M12 11.3a0.7 0.7 0 1 0 0 1.4 0.7 0.7 0 1 0 0-1.4',
      'M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z',
      'M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z',
    ],
  },
  motherTongue: {
    // Open book — language & literature symbol.
    subjectParam: 'MotherTongue',
    aliases: ['mothertongue', 'mother tongue', 'ona tili', 'onatili', 'родной язык'],
    paths: [
      'M12 7v14',
      'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3Z',
    ],
  },
  biology: {
    // Leaf — life sciences symbol. Keep in sync with utils/subjects.js.
    subjectParam: 'Biology',
    aliases: ['biology', 'biologiya', 'биология'],
    paths: [
      'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
      'M2 21c0-3 1.85-5.36 5.08-6',
    ],
  },
}

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const apiBaseUrl = getTestApiBaseUrl()

const isLoading = ref(true)
const errorKey = ref('')
const rawTests = ref([])

const subjectKey = computed(() => {
  const key = route.meta?.subjectKey
  return key && SUBJECT_CONFIG[key] ? key : 'math'
})
const config = computed(() => SUBJECT_CONFIG[subjectKey.value])

// Per-subject copy.
const sb = (field) => t(`subjects.${subjectKey.value}.${field}`)
const subjectValue = computed(() => sb('subjectValue'))

const matchesSubject = (value) => {
  const v = String(value || '').toLowerCase().trim()
  if (!v) return false
  return config.value.aliases.some((alias) => v === alias || v.includes(alias) || alias.includes(v))
}

const fetchTests = async () => {
  isLoading.value = true
  errorKey.value = ''

  if (!apiBaseUrl) {
    errorKey.value = 'math.errorConfig'
    isLoading.value = false
    return
  }

  try {
    const subjectQuery = config.value.subjectParam
      ? `?subject=${encodeURIComponent(config.value.subjectParam)}`
      : ''
    const response = await apiFetch(`${apiBaseUrl}/test${subjectQuery}`, {
      headers: { accept: '*/*' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    rawTests.value = Array.isArray(payload.data) ? payload.data : []
  } catch (error) {
    console.error(error)
    errorKey.value = isNetworkError(error) ? 'math.errorNetwork' : 'math.errorFetch'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    void authStore.getUserInfo().catch((error) => {
      console.error(error)
    })
  }
  fetchTests()
})

// One component instance serves every subject route, so switching subjects
// doesn't remount — and the list request is subject-scoped, so it must re-run.
watch(subjectKey, () => {
  fetchTests()
})

// This subject's tests: free tests first, then premium — so newcomers start on
// the free ones before hitting a paywall. Within each group, newest first.
const filteredTests = computed(() =>
  rawTests.value
    .filter((test) => matchesSubject(test.subject))
    .map((test) => ({ ...test, subject: test.subject || subjectValue.value }))
    .sort(
      (a, b) =>
        Number(isPremiumTest(a)) - Number(isPremiumTest(b)) ||
        Number(b.id) - Number(a.id),
    ),
)

const SKELETON_COUNT = 6
</script>

<template>
  <section
    class="relative min-h-screen overflow-hidden bg-[#f5f3ef] px-4 py-8 selection:bg-black selection:text-white sm:px-6 sm:py-16 lg:px-8"
  >
    <!-- Subtle warm dot grid -->
    <div class="math-dots absolute inset-0 -z-20"></div>
    <!-- Cream fade -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-[#f5f3ef]/30 via-[#f5f3ef]/70 to-[#f5f3ef]"></div>
    <!-- Ambient stone blobs -->
    <div class="math-blob blob-a absolute -left-20 top-10 h-[360px] w-[360px] rounded-full bg-[#e6e1d7]/50 blur-3xl"></div>
    <div class="math-blob blob-b absolute -right-24 top-40 h-[320px] w-[320px] rounded-full bg-[#ebe7e0]/60 blur-3xl"></div>
    <!-- Film grain -->
    <div class="math-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

    <div class="relative z-10 mx-auto max-w-[1400px]">
      <div class="mb-6 flex flex-col gap-4 sm:mb-10 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-3xl animate-[fadeInUp_.7s_ease-out]">
          <div class="mb-4 flex items-center gap-3 sm:mb-5">
            <span class="font-mono-custom text-[11px] font-semibold tracking-[0.22em] text-[#bcb6a9]">01</span>
            <span class="h-px w-8 bg-[#d8d3ca]"></span>
            <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a857c]">
              {{ sb('eyebrow') }}
            </span>
          </div>

          <h1 class="text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1814] sm:text-5xl md:text-6xl">
            {{ sb('title') }}
          </h1>
        </div>

        <!-- Subject card -->
        <div class="group relative shrink-0 animate-[fadeInUp_.9s_ease-out] overflow-hidden rounded-[22px] border border-[#e0ddd7] bg-gradient-to-br from-white/90 via-white/70 to-[#f1ede5]/60 px-5 py-4 shadow-[0_12px_36px_rgba(26,24,20,0.08)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(26,24,20,0.12)] sm:rounded-[26px] sm:px-7 sm:py-6 lg:min-w-[240px]">
          <div class="absolute inset-0 bg-[radial-gradient(circle,#d8d3ca_1px,transparent_1px)] bg-[size:18px_18px] opacity-40 [mask-image:radial-gradient(ellipse_70%_80%_at_85%_15%,#000,transparent_75%)]"></div>
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

          <div class="relative flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1a1814] text-white shadow-[0_8px_20px_rgba(26,24,20,0.2)] transition-transform duration-500 group-hover:scale-105">
              <span v-if="subjectKey === 'math'" class="select-none font-serif text-[26px] italic leading-none">π</span>
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(d, i) in config.paths" :key="i" :d="d" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-[#1a1814]"></span>
                <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a857c]">{{ t('math.subjectLabel') }}</p>
              </div>
              <p class="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ subjectValue }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton loaders -->
      <div
        v-if="isLoading"
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="n in SKELETON_COUNT"
          :key="`skeleton-${n}`"
          class="flex flex-col overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white/60 p-6 backdrop-blur-sm"
        >
          <div class="skeleton mb-4 h-12 w-12 rounded-2xl"></div>
          <div class="skeleton mb-3 h-7 w-3/4 rounded-lg"></div>
          <div class="skeleton mb-6 h-4 w-1/3 rounded-lg"></div>
          <div class="mb-6 grid grid-cols-2 gap-3">
            <div class="skeleton h-20 rounded-2xl"></div>
            <div class="skeleton h-20 rounded-2xl"></div>
          </div>
          <div class="skeleton mt-auto h-12 w-full rounded-full"></div>
        </div>
      </div>

      <div
        v-else-if="filteredTests.length > 0"
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="(test, index) in filteredTests"
          :key="test.id"
          class="card-enter"
          :style="{ animationDelay: Math.min(index, 12) * 55 + 'ms' }"
        >
          <MathTestCard :test="test" />
        </div>
      </div>

      <div
        v-else-if="errorKey"
        class="rounded-[28px] border border-dashed border-red-200 bg-red-50/80 px-6 py-16 text-center shadow-sm backdrop-blur-sm"
      >
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-500">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 9v4m0 4h.01M10.3 3.86l-8.5 14.7A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.73-3L13.7 3.86a2 2 0 0 0-3.4 0Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="font-medium text-red-600">{{ t(errorKey) }}</p>
      </div>

      <div
        v-else
        class="rounded-[28px] border border-dashed border-[#d8d3ca] bg-white/70 px-6 py-16 text-center shadow-[0_10px_30px_rgba(26,24,20,0.05)] backdrop-blur-sm"
      >
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] text-[#8a857c]">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 12h6m-6 4h6M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="font-medium text-[#8a857c]">{{ t('math.empty') }}</p>
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.skeleton {
  position: relative;
  overflow: hidden;
  background: #ece8e1;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.blob-a {
  animation: drift-a 18s ease-in-out infinite;
}
.blob-b {
  animation: drift-b 22s ease-in-out infinite;
}

@keyframes drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(28px, 22px) scale(1.06); }
}
@keyframes drift-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 26px) scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .math-blob,
  .skeleton::after {
    animation: none;
  }
  .card-enter {
    opacity: 1;
    animation: none;
  }
}
</style>
