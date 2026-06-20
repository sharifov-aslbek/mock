<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MathTestCard from '@/components/MathTestCard.vue'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'
import { SUBJECT_FILTER_OPTIONS, subjectMatches } from '@/utils/subjects'

const { t } = useI18n()
const selectedSort = ref('newest')
const isLoading = ref(true)
const errorKey = ref('')
const rawTests = ref([])
const apiBaseUrl = getTestApiBaseUrl()

const fetchTests = async () => {
  isLoading.value = true
  errorKey.value = ''

  if (!apiBaseUrl) {
    errorKey.value = 'resultExam.errorConfig'
    isLoading.value = false
    return
  }

  try {
    const response = await apiFetch(`${apiBaseUrl}/test`, {
      headers: {
        accept: '*/*',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    rawTests.value = Array.isArray(payload.data) ? payload.data : []
  } catch (error) {
    console.error(error)
    errorKey.value = 'resultExam.errorFetch'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTests()
})

const selectedSubject = ref('all')
const subjectOpen = ref(false)
const SUBJECT_OPTIONS = SUBJECT_FILTER_OPTIONS
const currentSubjectLabel = computed(
  () => SUBJECT_OPTIONS.find((option) => option.value === selectedSubject.value)?.label || '',
)
const selectSubject = (value) => {
  selectedSubject.value = value
  subjectOpen.value = false
}

const attemptedTests = computed(() => {
  // This page aggregates attempts across ALL subjects, so we must NOT blanket
  // a missing subject to "Matematika" (that would mislabel a History/Ona-tili
  // test and hide it from its real filter). Keep the backend subject as-is.
  let tests = rawTests.value
    .filter((test) => Number(test.attemptCount) > 0)
    .map((test) => ({
      ...test,
      subject: test.subject || '',
    }))

  if (selectedSubject.value !== 'all') {
    const option = SUBJECT_OPTIONS.find((item) => item.value === selectedSubject.value)
    tests = tests.filter((test) => subjectMatches(test.subject, option?.aliases))
  }

  if (selectedSort.value === 'popular') {
    return tests.sort((a, b) => Number(b.attemptCount) - Number(a.attemptCount))
  }

  if (selectedSort.value === 'score') {
    return tests.sort((a, b) => Number(b.questionCount) - Number(a.questionCount))
  }

  return tests.sort((a, b) => Number(b.id) - Number(a.id))
})

const SKELETON_COUNT = 6

const sortOptions = computed(() => [
  { value: 'newest', label: t('math.sort.newest') },
  { value: 'popular', label: t('math.sort.popular') },
  { value: 'score', label: t('math.sort.score') },
])

const shouldShowLoading = computed(() => isLoading.value)
const shouldShowError = computed(() => !isLoading.value && Boolean(errorKey.value))
</script>

<template>
  <section
    class="relative min-h-screen overflow-hidden bg-[#f5f3ef] px-4 py-14 font-sans-custom selection:bg-black selection:text-white sm:px-6 sm:py-16 lg:px-8"
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
      <div class="mb-10 flex flex-col gap-6 animate-[fadeInUp_.7s_ease-out] lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <div class="mb-5 flex items-center gap-3">
            <span class="font-mono-custom text-[11px] font-semibold tracking-[0.22em] text-[#bcb6a9]">01</span>
            <span class="h-px w-8 bg-[#d8d3ca]"></span>
            <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a857c]">
              {{ t('resultExam.eyebrow') }}
            </span>
          </div>

          <h1 class="text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1814] sm:text-5xl md:text-6xl">
            {{ t('resultExam.title') }}
          </h1>
          <p class="mt-5 max-w-2xl text-base leading-relaxed text-[#6b6760] sm:text-lg">
            {{ t('resultExam.description') }}
          </p>
        </div>

        <!-- Total attempted -->
        <div class="flex shrink-0 items-center gap-3.5">
          <span class="text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">
            {{ attemptedTests.length }}
          </span>
          <span class="h-8 w-px bg-[#d8d3ca]"></span>
          <span class="font-mono-custom max-w-[5.5rem] text-[10px] font-medium uppercase leading-[1.55] tracking-[0.18em] text-[#8a857c]">
            {{ t('resultExam.totalLabel') }}
          </span>
        </div>
      </div>

      <div class="mb-8 flex flex-col gap-4 animate-[fadeInUp_1.1s_ease-out] sm:flex-row sm:items-center sm:justify-between">
        <!-- Sort pills -->
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            @click="selectedSort = option.value"
            :class="[
              'inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-300 active:scale-[0.98]',
              selectedSort === option.value
                ? 'border-[#1a1814] bg-[#1a1814] text-white shadow-[0_8px_22px_rgba(26,24,20,0.18)]'
                : 'border-[#d8d3ca] bg-white/70 text-[#6b6760] backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#1a1814] hover:text-[#1a1814]'
            ]"
          >
            {{ option.label }}
          </button>
        </div>

        <!-- Subject filter -->
        <div class="relative w-full sm:w-auto">
          <button
            type="button"
            @click="subjectOpen = !subjectOpen"
            class="flex w-full items-center justify-between gap-3 rounded-full border bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#1a1814] shadow-[0_4px_14px_rgba(26,24,20,0.05)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#1a1814] sm:min-w-[210px]"
            :class="subjectOpen ? 'border-[#1a1814]' : 'border-[#d8d3ca]'"
          >
            <span class="flex items-center gap-2">
              <svg class="h-4 w-4 text-[#8a857c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ currentSubjectLabel }}
            </span>
            <svg
              class="h-4 w-4 text-[#8a857c] transition-transform duration-300"
              :class="subjectOpen ? 'rotate-180' : ''"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            >
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <Transition name="drop">
            <div
              v-if="subjectOpen"
              class="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#e0ddd7] bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(26,24,20,0.14)] backdrop-blur-md sm:min-w-[210px]"
            >
              <button
                v-for="option in SUBJECT_OPTIONS"
                :key="option.value"
                type="button"
                @click="selectSubject(option.value)"
                class="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition"
                :class="selectedSubject === option.value
                  ? 'bg-[#1a1814] text-white'
                  : 'text-[#6b6760] hover:bg-[#1a1814]/[0.05] hover:text-[#1a1814]'"
              >
                <span>{{ option.label }}</span>
                <svg
                  v-if="selectedSubject === option.value"
                  class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
                >
                  <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </Transition>

          <!-- click-outside backdrop -->
          <div v-if="subjectOpen" class="fixed inset-0 z-20" @click="subjectOpen = false"></div>
        </div>
      </div>

      <!-- Skeleton loaders -->
      <div
        v-if="shouldShowLoading"
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
        v-else-if="attemptedTests.length > 0"
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="(test, index) in attemptedTests"
          :key="test.id"
          class="card-enter"
          :style="{ animationDelay: Math.min(index, 12) * 55 + 'ms' }"
        >
          <MathTestCard :test="test" is-attempted-card />
        </div>
      </div>

      <div
        v-else-if="shouldShowError"
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
        <p class="font-medium text-[#8a857c]">{{ t('resultExam.empty') }}</p>
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

/* Staggered card entrance */
.card-enter {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Skeleton shimmer */
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

/* Sort dropdown */
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
