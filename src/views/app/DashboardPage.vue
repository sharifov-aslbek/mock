<script setup>
// Bosh sahifa — the approved reference screen. Every other platform screen is
// built from the components this one establishes (docs/DESIGN.md).
//
// NOT YET WIRED TO THE API. The figures below are realistic placeholders that
// match the approved mockup; each block is marked with the endpoint it should
// read once the platform screens are signed off.
import { computed } from 'vue'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import AppIcon from '@/components/app/AppIcon.vue'
import CoinIcon from '@/components/app/CoinIcon.vue'
import StatusBadge from '@/components/app/StatusBadge.vue'
import LineChart from '@/components/app/LineChart.vue'
import { toneForScore } from '@/components/app/score.js'

const props = defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

// TODO(api): GET /api/user/stats
const stats = computed(() => [
  {
    key: 'solved',
    icon: 'tests',
    label: 'Testlar yechildi',
    value: '24',
    trend: { direction: 'up', amount: '12%', note: "o'tgan haftaga nisbatan" },
  },
  {
    key: 'average',
    icon: 'trend',
    label: "O'rtacha natija",
    value: '78%',
    trend: { direction: 'up', amount: '8%', note: "o'tgan haftaga nisbatan" },
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
    value: 'Bugun',
    note: '2 ta test yechildi',
  },
])

// TODO(api): GET /api/user/progress?range=week
const weekProgress = [
  { label: 'Dush', value: 25 },
  { label: 'Sesh', value: 50 },
  { label: 'Chor', value: 62 },
  { label: 'Pay', value: 40 },
  { label: 'Jum', value: 58 },
  { label: 'Shan', value: 75 },
  { label: 'Yak', value: 100 },
]

const goal = { percent: 75, done: 15, total: 20 }

// TODO(api): GET /api/user/activity?limit=4
const activities = [
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
]
</script>

<template>
  <AppTopbar
    :title="`Xush kelibsiz, ${user.name}! 👋`"
    subtitle="Bugun o‘qish uchun ajoyib kun!"
    :user="user"
    @open-menu="$emit('openMenu')"
  />

  <main class="flex flex-1 flex-col gap-4">
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
    <section class="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
      <AppCard class="flex flex-col">
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

        <!-- The card fills the viewport, but its contents stay composed: the
             chart holds a sane height and the pair is centred in the slack
             rather than stretched to a square. -->
        <div class="mt-5 flex min-h-0 flex-1 items-center">
          <div class="grid w-full grid-cols-1 gap-5 sm:grid-cols-[1.7fr_1fr] sm:items-stretch">
            <div class="h-[260px] sm:h-[min(420px,44vh)]">
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
        </div>
      </AppCard>

      <AppCard class="flex flex-col">
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

        <ul class="mt-3 flex min-h-0 flex-1 flex-col divide-y divide-app-border">
          <li v-for="item in activities" :key="item.id" class="flex max-h-[110px] flex-1 items-center gap-3 py-3">
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
  </main>
</template>
