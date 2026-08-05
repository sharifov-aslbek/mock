<script setup>
// One subject's mock list — where a card in the Fanlar grid leads.
//
// Built entirely from parts the dashboard already established (TestRow,
// StatusBadge, EmptyState) so a test looks identical wherever it appears.
//
// NOT YET WIRED TO THE API. The rows below are placeholders in the real shape.
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import TestRow from '@/components/app/TestRow.vue'
import SkeletonBlock from '@/components/app/SkeletonBlock.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import { SUBJECTS } from '@/components/app/subjects.js'

defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

const route = useRoute()
const router = useRouter()

const subjectKey = computed(() => String(route.params.subject || ''))
const subject = computed(() => SUBJECTS[subjectKey.value] ?? null)

// TODO(api): request state. ?loading=1 and ?empty=1 preview the two states.
const isLoading = computed(() => route.query.loading === '1')
const isEmpty = computed(() => route.query.empty === '1')

// A test in progress is neither "ishlanmagan" nor "yakunlangan", so it gets its
// own filter rather than being folded into one of them.
const FILTERS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'new', label: 'Ishlanmagan' },
  { key: 'progress', label: 'Yechilmoqda' },
  { key: 'done', label: 'Yakunlangan' },
]

const activeFilter = computed(() => {
  const wanted = String(route.query.holat || 'all')
  return FILTERS.some((f) => f.key === wanted) ? wanted : 'all'
})

const setFilter = (key) => {
  const query = { ...route.query }
  if (key === 'all') delete query.holat
  else query.holat = key
  router.replace({ query })
}

// TODO(api): GET /api/tests?subject=<key>
const ALL_TESTS = computed(() => {
  if (isEmpty.value || !subject.value) return []
  const key = subjectKey.value
  return [
    { id: `${key}-1`, subject: key, date: '30.12.2025', shift: 1, questions: 45, takers: 1284, state: 'done', score: 85 },
    { id: `${key}-2`, subject: key, date: '28.12.2025', shift: 2, questions: 45, takers: 962, state: 'new' },
    { id: `${key}-3`, subject: key, date: '26.12.2025', shift: 1, questions: 35, takers: 741, state: 'progress' },
    { id: `${key}-4`, subject: key, date: '24.12.2025', shift: 2, questions: 50, takers: 1105, premium: true, state: 'done', score: 65 },
    { id: `${key}-5`, subject: key, date: '21.12.2025', shift: 1, questions: 45, takers: 838, premium: true, state: 'new' },
  ]
})

const tests = computed(() =>
  activeFilter.value === 'all'
    ? ALL_TESTS.value
    : ALL_TESTS.value.filter((test) => test.state === activeFilter.value),
)

const emptyCopy = computed(() => {
  // Three different facts, three different sentences.
  if (!ALL_TESTS.value.length) {
    return {
      title: 'Hozircha test qo‘shilmagan',
      description: 'Bu fandan testlar qo‘shilgach, ular shu yerda ochiladi.',
    }
  }
  return {
    all: { title: '', description: '' },
    new: {
      title: 'Ishlanmagan test qolmadi',
      description: 'Bu fandagi barcha testlarni ochib bo‘lgansiz.',
    },
    progress: {
      title: 'Yarim yechilgan test yo‘q',
      description: 'Tugatilmagan testlar shu yerda kutib turadi.',
    },
    done: {
      title: 'Hali test yakunlamagansiz',
      description: 'Yechib bo‘lgan testlaringiz natijasi bilan shu yerda to‘planadi.',
    },
  }[activeFilter.value]
})
</script>

<template>
  <AppTopbar
    :title="subject ? subject.fullLabel || subject.label : 'Fan topilmadi'"
    :subtitle="subject ? subject.description : ''"
    back-to="/testlar"
    back-label="Fanlar"
    :user="user"
    @open-menu="$emit('openMenu')"
  />

  <main>
    <AppCard v-if="!subject">
      <EmptyState
        icon="tests"
        title="Bunday fan yo‘q"
        description="Havola eskirgan bo‘lishi mumkin. Fanlar ro‘yxatidan tanlang."
        action-label="Fanlarga qaytish"
        action-to="/testlar"
      />
    </AppCard>

    <AppCard v-else>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="filter in FILTERS"
          :key="filter.key"
          type="button"
          class="rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
          :class="
            activeFilter === filter.key
              ? 'border-app-ink bg-app-ink text-app-surface'
              : 'border-app-border bg-app-surface text-app-ink hover:bg-app-tile'
          "
          :aria-pressed="activeFilter === filter.key"
          @click="setFilter(filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Loading: rows in the shape of TestRow so nothing shifts on arrival -->
      <div v-if="isLoading" class="mt-2 divide-y divide-app-border" aria-hidden="true">
        <div v-for="n in 4" :key="n" class="flex items-center gap-4 py-4">
          <SkeletonBlock class="h-11 w-11 shrink-0 !rounded-xl" />
          <div class="flex-1">
            <SkeletonBlock class="h-4 w-[min(260px,70%)]" />
            <SkeletonBlock class="mt-2 h-3 w-[min(160px,50%)]" />
          </div>
          <SkeletonBlock class="h-9 w-32 shrink-0 !rounded-lg" />
        </div>
      </div>
      <p v-if="isLoading" class="sr-only" role="status">Testlar yuklanmoqda</p>

      <div v-else-if="tests.length" class="mt-1 divide-y divide-app-border">
        <TestRow v-for="test in tests" :key="test.id" :test="test" />
      </div>

      <EmptyState
        v-else
        icon="tests"
        :title="emptyCopy.title"
        :description="emptyCopy.description"
      />
    </AppCard>
  </main>
</template>
