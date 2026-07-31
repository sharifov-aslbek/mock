<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MathTestCard from '@/components/MathTestCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useTestProgressStore } from '@/stores/testProgress'
import { apiFetch, getTestApiBaseUrl, isNetworkError } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const selectedSort = ref('newest')
const isLoading = ref(true)
const errorKey = ref('')
const rawTests = ref([])
const { t } = useI18n()
const authStore = useAuthStore()
const testProgressStore = useTestProgressStore()
const apiBaseUrl = getTestApiBaseUrl()
const VALID_TAB_IDS = ['all', 'started', 'notStarted']

const normalizeTab = (tab) =>
  VALID_TAB_IDS.includes(tab) ? tab : 'all'

const activeTab = ref(
  normalizeTab(typeof route.query.tab === 'string' ? route.query.tab : 'all'),
)

const formatRemainingTime = (seconds) => {
  const safeSeconds = Math.max(Number(seconds || 0), 0)

  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const secs = safeSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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
    const response = await apiFetch(`${apiBaseUrl}/test`, {
      headers: {
        accept: '*/*'
      }
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
  testProgressStore.hydrate()
  if (authStore.isAuthenticated) {
    void authStore.getUserInfo().catch((error) => {
      console.error(error)
    })
  }
  fetchTests()
})

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = normalizeTab(typeof tab === 'string' ? tab : 'all')
  },
)

watch(activeTab, (tab) => {
  const normalizedTab = normalizeTab(tab)
  const currentRouteTab = typeof route.query.tab === 'string' ? route.query.tab : 'all'

  if (currentRouteTab === normalizedTab) {
    return
  }

  router.replace({
    query: {
      ...route.query,
      tab: normalizedTab,
    },
  })
})

const tests = computed(() =>
  rawTests.value.map((test) => ({
    ...test,
    subject: t('math.subjectValue')
  }))
)

const startedTests = computed(() =>
  testProgressStore.inProgressTests.map((progress) => ({
    id: progress.testId,
    // The attempt to resume when "continue" is pressed (saved alongside progress).
    attemptId: progress.attemptId,
    title: progress.title,
    subject: progress.subject || t('math.subjectValue'),
    questionCount: progress.questionCount,
    answeredCount: progress.answeredCount,
    remainingQuestions: Math.max(Number(progress.questionCount) - Number(progress.answeredCount), 0),
    remainingSeconds: progress.remainingSeconds,
    remainingTimeLabel: formatRemainingTime(progress.remainingSeconds),
    updatedAt: progress.updatedAt,
    isInProgressCard: true,
  })),
)

const tabs = computed(() => [
  { id: 'all', name: t('math.tabs.all'), count: tests.value.length },
  {
    id: 'started',
    name: t('math.tabs.started'),
    count: startedTests.value.length
  },
  {
    id: 'notStarted',
    name: t('math.tabs.notStarted'),
    count: tests.value.filter((test) => Number(test.attemptCount) === 0).length
  },
])

const filteredTests = computed(() => {
  if (activeTab.value === 'started') {
    return [...startedTests.value].sort(
      (firstTest, secondTest) => Number(secondTest.updatedAt) - Number(firstTest.updatedAt),
    )
  }

  let result = [...tests.value]

  if (activeTab.value === 'notStarted') {
    result = result.filter((test) => Number(test.attemptCount) === 0)
  }

  if (selectedSort.value === 'popular') {

    // b ning attempt counti 12 for example
    // a ning attempt counti 3 for example
    result.sort((a, b) => Number(b.attemptCount) - Number(a.attemptCount))
  } else if (selectedSort.value === 'score') {
    // agar b 85 va a 90 bolsa shunda a birinci item boladi b keyingisi musbat chiqsa oldinga
    result.sort((a, b) => Number(b.questionCount) - Number(a.questionCount))
  } else {
    // id bo'yicha kamayish tartibida saralash (eng yangi testlar birinchi bo'ladi)
    result.sort((a, b) => Number(b.id) - Number(a.id))
  }

  return result
})

const shouldShowLoading = computed(() => activeTab.value !== 'started' && isLoading.value)
const shouldShowError = computed(() => activeTab.value !== 'started' && Boolean(errorKey.value))
const emptyMessageKey = computed(() =>
  activeTab.value === 'started' ? 'math.emptyStarted' : 'math.empty',
)

const SKELETON_COUNT = 6

const sortOpen = ref(false)
const sortOptions = computed(() => [
  { value: 'newest', label: t('math.sort.newest') },
  { value: 'popular', label: t('math.sort.popular') },
  { value: 'score', label: t('math.sort.score') },
])
const currentSortLabel = computed(
  () => sortOptions.value.find((option) => option.value === selectedSort.value)?.label || '',
)
const activeTabName = computed(
  () => tabs.value.find((tab) => tab.id === activeTab.value)?.name || '',
)
const selectSort = (value) => {
  selectedSort.value = value
  sortOpen.value = false
}
</script>

<template>
  <section
    class="relative min-h-screen overflow-hidden bg-[#f5f3ef] px-4 py-14 selection:bg-black selection:text-white sm:px-6 sm:py-16 lg:px-8"
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
      <div class="mb-10 max-w-3xl animate-[fadeInUp_.7s_ease-out]">
        <div class="mb-5 flex items-center gap-3">
          <span class="font-mono-custom text-[11px] font-semibold tracking-[0.22em] text-[#bcb6a9]">01</span>
          <span class="h-px w-8 bg-[#d8d3ca]"></span>
          <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a857c]">
            {{ t('math.eyebrow') }}
          </span>
        </div>

        <h1 class="text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1814] sm:text-5xl md:text-6xl">
          {{ t('math.title') }}
        </h1>
        <p class="mt-5 max-w-2xl text-base leading-relaxed text-[#6b6760] sm:text-lg">
          {{ t('math.description') }}
        </p>
      </div>

      <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-3 animate-[fadeInUp_1s_ease-out]">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-300 active:scale-[0.98]',
              activeTab === tab.id
                ? 'border-[#1a1814] bg-[#1a1814] text-white shadow-[0_8px_22px_rgba(26,24,20,0.18)]'
                : 'border-[#d8d3ca] bg-white/70 text-[#6b6760] backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#1a1814] hover:text-[#1a1814]'
            ]"
          >
            <span>{{ tab.name }}</span>
            <span
              :class="[
                'rounded-full px-2 py-0.5 font-mono-custom text-[11px] font-medium',
                activeTab === tab.id ? 'bg-white/15 text-white' : 'bg-[#1a1814]/5 text-[#8a857c]'
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Subject card -->
        <div class="group relative shrink-0 animate-[fadeInUp_.9s_ease-out] overflow-hidden rounded-[26px] border border-[#e0ddd7] bg-gradient-to-br from-white/90 via-white/70 to-[#f1ede5]/60 px-7 py-6 shadow-[0_12px_36px_rgba(26,24,20,0.08)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(26,24,20,0.12)] lg:min-w-[240px]">
          <!-- faint dot grid -->
          <div class="absolute inset-0 bg-[radial-gradient(circle,#d8d3ca_1px,transparent_1px)] bg-[size:18px_18px] opacity-40 [mask-image:radial-gradient(ellipse_70%_80%_at_85%_15%,#000,transparent_75%)]"></div>
          <!-- top sheen -->
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

          <div class="relative flex items-center gap-4">
            <!-- math icon: left part -->
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1a1814] text-white shadow-[0_8px_20px_rgba(26,24,20,0.2)] transition-transform duration-500 group-hover:scale-105">
              <span class="select-none font-serif text-[26px] italic leading-none">π</span>
            </div>
            <!-- texts: right part, beside the icon -->
            <div>
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-[#1a1814]"></span>
                <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a857c]">{{ t('math.subjectLabel') }}</p>
              </div>
              <p class="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ t('math.subjectValue') }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-[fadeInUp_1.1s_ease-out]">
        <p class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">
          {{ activeTabName }} · {{ filteredTests.length }}
        </p>

        <div class="relative w-full sm:w-auto">
          <button
            type="button"
            @click="sortOpen = !sortOpen"
            class="flex w-full items-center justify-between gap-3 rounded-full border border-[#d8d3ca] bg-white/70 px-5 py-3 text-sm font-semibold text-[#1a1814] shadow-[0_4px_14px_rgba(26,24,20,0.05)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#1a1814] sm:min-w-[240px]"
            :class="sortOpen ? 'border-[#1a1814]' : ''"
          >
            <span>{{ currentSortLabel }}</span>
            <svg
              class="h-4 w-4 text-[#8a857c] transition-transform duration-300"
              :class="sortOpen ? 'rotate-180' : ''"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            >
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <Transition name="drop">
            <div
              v-if="sortOpen"
              class="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#e0ddd7] bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(26,24,20,0.14)] backdrop-blur-md sm:min-w-[240px]"
            >
              <button
                v-for="option in sortOptions"
                :key="option.value"
                type="button"
                @click="selectSort(option.value)"
                class="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition"
                :class="selectedSort === option.value
                  ? 'bg-[#1a1814] text-white'
                  : 'text-[#6b6760] hover:bg-[#1a1814]/[0.05] hover:text-[#1a1814]'"
              >
                <span>{{ option.label }}</span>
                <svg
                  v-if="selectedSort === option.value"
                  class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
                >
                  <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </Transition>

          <!-- click-outside backdrop -->
          <div v-if="sortOpen" class="fixed inset-0 z-20" @click="sortOpen = false"></div>
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
        v-else-if="filteredTests.length > 0"
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="(test, index) in filteredTests"
          :key="test.id"
          class="card-enter"
          :style="{ animationDelay: Math.min(index, 12) * 55 + 'ms' }"
        >
          <MathTestCard :test="test" :attempt-id="test.attemptId" />
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
        v-else-if="filteredTests.length === 0"
        class="rounded-[28px] border border-dashed border-[#d8d3ca] bg-white/70 px-6 py-16 text-center shadow-[0_10px_30px_rgba(26,24,20,0.05)] backdrop-blur-sm"
      >
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] text-[#8a857c]">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 12h6m-6 4h6M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="font-medium text-[#8a857c]">{{ t(emptyMessageKey) }}</p>
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
