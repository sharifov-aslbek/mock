<script setup>
// Bosh sahifa — the approved reference screen. Every other platform screen is
// built from the components this one establishes (docs/DESIGN.md).
//
// NOT YET WIRED TO THE API. The figures below are realistic placeholders that
// match the approved mockup; each block is marked with the endpoint it should
// read once the platform screens are signed off.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import AppIcon from '@/components/app/AppIcon.vue'
import CoinIcon from '@/components/app/CoinIcon.vue'
import StatusBadge from '@/components/app/StatusBadge.vue'
import LineChart from '@/components/app/LineChart.vue'
import TestRow from '@/components/app/TestRow.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import { toneForScore } from '@/components/app/score.js'

const props = defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

const route = useRoute()

// TODO(api): drive this from the real payload — `hasHistory` becomes
// `stats.value.solved > 0`. Until then ?empty=1 previews the first-run screen.
const hasHistory = computed(() => route.query.empty !== '1')

// TODO(api): GET /api/user/stats
const stats = computed(() => [
  {
    key: 'solved',
    icon: 'tests',
    label: 'Testlar yechildi',
    value: hasHistory.value ? '24' : '0',
    trend: hasHistory.value ? { amount: '12%', note: "o'tgan haftaga nisbatan" } : null,
    note: 'Hali test yechilmagan',
  },
  {
    key: 'average',
    icon: 'trend',
    label: "O'rtacha natija",
    value: hasHistory.value ? '78%' : '—',
    trend: hasHistory.value ? { amount: '8%', note: "o'tgan haftaga nisbatan" } : null,
    note: 'Birinchi testdan keyin',
  },
  {
    key: 'tanga',
    coin: true,
    label: 'Tanga balansi',
    value: String(props.user.tanga),
    link: { to: '/narxlar', label: 'Tanga sotib olish' },
  },
  {
    key: 'activity',
    icon: 'clock',
    label: 'Oxirgi faoliyat',
    value: hasHistory.value ? 'Bugun' : '—',
    note: hasHistory.value ? '2 ta test yechildi' : 'Faoliyat yo‘q',
  },
])

// TODO(api): GET /api/user/progress?range=week
const weekProgress = computed(() => (!hasHistory.value ? [] : [
  { label: 'Dush', value: 25 },
  { label: 'Sesh', value: 50 },
  { label: 'Chor', value: 62 },
  { label: 'Pay', value: 40 },
  { label: 'Jum', value: 58 },
  { label: 'Shan', value: 75 },
  { label: 'Yak', value: 100 },
]))

const goal = { percent: 75, done: 15, total: 20 }

// TODO(api): GET /api/test?limit=4&sort=newest
// `state` and `score` are per-user, so a student with no history sees every
// mock as not-started rather than a score they never earned.
const latestTests = computed(() =>
  [
  { id: 1, subject: 'math', date: '30.12.2025', shift: 1, questions: 45, takers: 1284, state: 'done', score: 85 },
  { id: 2, subject: 'motherTongue', date: '28.12.2025', shift: 2, questions: 40, takers: 962, premium: true, state: 'new' },
  { id: 3, subject: 'physics', date: '26.12.2025', shift: 1, questions: 35, takers: 741, state: 'progress' },
  { id: 4, subject: 'history', date: '24.12.2025', shift: 2, questions: 50, takers: 1105, premium: true, state: 'done', score: 65 },
  ].map((test) => (hasHistory.value ? test : { ...test, state: 'new', score: undefined })),
)

// TODO(api): GET /api/user/activity?limit=4
const activities = computed(() => (!hasHistory.value ? [] : [
  {
    id: 1,
    icon: 'tests',
    title: 'Matematika testini yechdingiz',
    meta: '30.12.2025 • 45 savol',
    badge: { text: '85%', tone: toneForScore(85) },
  },
  {
    id: 2,
    icon: 'book',
    title: 'Fizika kursini davom ettirdingiz',
    meta: 'Mexanika • 3-dars',
    badge: { text: 'Davom etish', tone: 'neutral' },
  },
  {
    id: 3,
    icon: 'essay',
    title: 'Essay topshirdingiz',
    meta: "Mavzu: Internetning ijtimoiy ta'siri",
    badge: { text: 'Tekshirilmoqda', tone: 'info' },
  },
  {
    id: 4,
    icon: 'tests',
    title: 'Tarix testini yechdingiz',
    meta: '28.12.2025 • 50 savol',
    badge: { text: '65%', tone: toneForScore(65) },
  },
]))
</script>

<template>
  <AppTopbar
    :title="`Xush kelibsiz, ${user.name}! 👋`"
    subtitle="Bugun o‘qish uchun ajoyib kun!"
    :user="user"
    @open-menu="$emit('openMenu')"
  />

  <main class="space-y-4">
    <!-- Stat row -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Umumiy ko‘rsatkichlar">
      <AppCard v-for="stat in stats" :key="stat.key">
        <!-- Icon left, label and figure to its right. Stacking these vertically
             wastes a whole card's worth of height for no gain. -->
        <div class="flex items-center gap-3.5">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-app-tile"
            :class="stat.coin ? 'text-app-coin' : 'text-app-ink'"
          >
            <CoinIcon v-if="stat.coin" :size="22" />
            <AppIcon v-else :name="stat.icon" :size="20" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-[13px] text-app-muted">{{ stat.label }}</p>
            <p class="text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-app-ink">
              {{ stat.value }}
            </p>
          </div>
        </div>

        <p v-if="stat.trend" class="mt-3 flex items-center gap-2 text-[12px]">
          <span class="inline-flex items-center gap-1 font-semibold text-app-good">
            <AppIcon name="arrowUp" :size="13" />
            {{ stat.trend.amount }}
          </span>
          <span class="text-app-muted">{{ stat.trend.note }}</span>
        </p>

        <RouterLink
          v-else-if="stat.link"
          :to="stat.link.to"
          class="mt-3 inline-flex items-center gap-1.5 rounded-md text-[12px] font-semibold text-app-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        >
          {{ stat.link.label }}
          <AppIcon name="arrowRight" :size="14" />
        </RouterLink>

        <p v-else class="mt-3 text-[12px] text-app-muted">{{ stat.note }}</p>
      </AppCard>
    </section>

    <!-- Progress + activity -->
    <section class="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
      <AppCard>
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-[18px] font-bold tracking-[-0.015em] text-app-ink">O‘qish progressi</h2>
          <RouterLink
            to="/result-exam"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md text-[13px] font-medium text-app-muted transition-colors hover:text-app-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            aria-label="Barchasini ko‘rish"
          >
            <span class="hidden sm:inline">Barchasini ko‘rish</span>
            <AppIcon name="arrowRight" :size="15" />
          </RouterLink>
        </div>

        <EmptyState
          v-if="!weekProgress.length"
          icon="trend"
          title="Progress hali chizilmagan"
          description="Testlarni yecha boshlaganingizda haftalik o‘sishingiz shu yerda ko‘rinadi."
        />

        <div v-else class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[1.7fr_1fr] sm:items-stretch">
          <div class="flex items-center">
            <LineChart :points="weekProgress" />
          </div>

          <div class="flex flex-col rounded-xl bg-app-sunken p-4">
            <p class="text-[13px] text-app-muted">Haftalik maqsad</p>
            <p class="mt-1.5 text-[32px] font-bold leading-none tracking-[-0.03em] text-app-ink">
              {{ goal.percent }}%
            </p>
            <div class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-app-border">
              <div class="h-full rounded-full bg-app-ink" :style="{ width: `${goal.percent}%` }"></div>
            </div>
            <p class="mt-2.5 text-[12px] text-app-muted">{{ goal.done }} / {{ goal.total }} soat</p>
            <button
              type="button"
              class="mt-auto w-full rounded-lg border border-app-border bg-app-surface px-4 py-2 text-[13px] font-semibold text-app-ink transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            >
              Maqsadni tahrirlash
            </button>
          </div>
        </div>
      </AppCard>

      <AppCard>
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-[18px] font-bold tracking-[-0.015em] text-app-ink">So‘nggi faoliyatlar</h2>
          <RouterLink
            to="/result-exam"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md text-[13px] font-medium text-app-muted transition-colors hover:text-app-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            aria-label="Barchasini ko‘rish"
          >
            <span class="hidden sm:inline">Barchasini ko‘rish</span>
            <AppIcon name="arrowRight" :size="15" />
          </RouterLink>
        </div>

        <EmptyState
          v-if="!activities.length"
          icon="tests"
          title="Siz hali test yechmagansiz"
          description="Birinchi mock testni yeching — natijangiz va tahlilingiz shu yerda paydo bo‘ladi."
          action-label="Testni boshlash"
          action-to="/testlar"
        />

        <ul v-else class="mt-3 divide-y divide-app-border">
          <li v-for="item in activities" :key="item.id" class="flex items-center gap-3 py-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-tile text-app-ink"
            >
              <AppIcon :name="item.icon" :size="18" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[14px] font-semibold leading-snug text-app-ink">{{ item.title }}</p>
              <p class="mt-0.5 text-[12px] text-app-muted">{{ item.meta }}</p>
            </div>
            <StatusBadge :tone="item.badge.tone">{{ item.badge.text }}</StatusBadge>
          </li>
        </ul>
      </AppCard>
    </section>

    <!-- Latest mocks, full width — the entry point into Testlar -->
    <section aria-labelledby="latest-tests-heading">
      <AppCard>
        <div class="flex items-center justify-between gap-4">
          <h2 id="latest-tests-heading" class="text-[18px] font-bold tracking-[-0.015em] text-app-ink">
            So‘nggi testlar
          </h2>
          <RouterLink
            to="/testlar"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md text-[13px] font-medium text-app-muted transition-colors hover:text-app-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            aria-label="Barcha testlar"
          >
            <span class="hidden sm:inline">Barcha testlar</span>
            <AppIcon name="arrowRight" :size="15" />
          </RouterLink>
        </div>

        <EmptyState
          v-if="!latestTests.length"
          icon="tests"
          title="Hozircha test qo‘shilmagan"
          description="Yangi mock testlar joylangach, shu yerda birinchi bo‘lib ko‘rasiz."
          compact
        />

        <div v-else class="mt-1 divide-y divide-app-border">
          <TestRow v-for="test in latestTests" :key="test.id" :test="test" />
        </div>
      </AppCard>
    </section>
  </main>
</template>
