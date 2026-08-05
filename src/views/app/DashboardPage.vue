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
import staircase from '@/assets/landing/staircase.png'

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

  <main class="space-y-4">
    <!-- Stat row -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Umumiy ko‘rsatkichlar">
      <AppCard v-for="stat in stats" :key="stat.key">
        <span
          class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-app-tile"
          :class="stat.coin ? 'text-app-coin' : 'text-app-ink'"
        >
          <CoinIcon v-if="stat.coin" :size="26" />
          <AppIcon v-else :name="stat.icon" :size="24" />
        </span>

        <p class="mt-5 text-[15px] font-medium text-app-ink">{{ stat.label }}</p>
        <p class="mt-1 text-[40px] font-bold leading-[1.1] tracking-[-0.025em] text-app-ink">
          {{ stat.value }}
        </p>

        <p v-if="stat.trend" class="mt-4 flex items-center gap-2 text-[13px]">
          <span class="inline-flex items-center gap-1 font-semibold text-app-good">
            <AppIcon name="arrowUp" :size="14" />
            {{ stat.trend.amount }}
          </span>
          <span class="text-app-muted">{{ stat.trend.note }}</span>
        </p>

        <RouterLink
          v-else-if="stat.link"
          :to="stat.link.to"
          class="mt-4 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-app-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        >
          {{ stat.link.label }}
          <AppIcon name="arrowRight" :size="14" />
        </RouterLink>

        <p v-else class="mt-4 text-[13px] text-app-muted">{{ stat.note }}</p>
      </AppCard>
    </section>

    <!-- Progress + activity -->
    <section class="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
      <AppCard>
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-[20px] font-bold tracking-[-0.01em] text-app-ink">O‘qish progressi</h2>
          <RouterLink
            to="/result-exam"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md text-[14px] font-medium text-app-muted transition-colors hover:text-app-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            aria-label="Barchasini ko‘rish"
          >
            <span class="hidden sm:inline">Barchasini ko‘rish</span>
            <AppIcon name="arrowRight" :size="15" />
          </RouterLink>
        </div>

        <div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-[1.7fr_1fr] sm:items-stretch">
          <div class="flex items-center">
            <LineChart :points="weekProgress" />
          </div>

          <div class="flex flex-col rounded-2xl bg-app-sunken p-5">
            <p class="text-[14px] text-app-muted">Haftalik maqsad</p>
            <p class="mt-2 text-[34px] font-bold leading-none tracking-[-0.02em] text-app-ink">
              {{ goal.percent }}%
            </p>
            <div class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-app-border">
              <div class="h-full rounded-full bg-app-ink" :style="{ width: `${goal.percent}%` }"></div>
            </div>
            <p class="mt-3 text-[13px] text-app-muted">{{ goal.done }} / {{ goal.total }} soat</p>
            <button
              type="button"
              class="mt-auto w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-[14px] font-semibold text-app-ink transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            >
              Maqsadni tahrirlash
            </button>
          </div>
        </div>
      </AppCard>

      <AppCard>
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-[20px] font-bold tracking-[-0.01em] text-app-ink">So‘nggi faoliyatlar</h2>
          <RouterLink
            to="/result-exam"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md text-[14px] font-medium text-app-muted transition-colors hover:text-app-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            aria-label="Barchasini ko‘rish"
          >
            <span class="hidden sm:inline">Barchasini ko‘rish</span>
            <AppIcon name="arrowRight" :size="15" />
          </RouterLink>
        </div>

        <ul class="mt-3 divide-y divide-app-border">
          <li v-for="item in activities" :key="item.id" class="flex items-center gap-4 py-4">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-app-tile text-app-ink"
            >
              <AppIcon :name="item.icon" :size="20" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[15px] font-semibold leading-snug text-app-ink">{{ item.title }}</p>
              <p class="mt-0.5 text-[13px] text-app-muted">{{ item.meta }}</p>
            </div>
            <StatusBadge :tone="item.badge.tone">{{ item.badge.text }}</StatusBadge>
          </li>
        </ul>
      </AppCard>
    </section>

    <!-- Motivation band -->
    <section
      class="relative flex min-h-[190px] items-center overflow-hidden rounded-[20px] bg-app-warm"
    >
      <img
        :src="staircase"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 right-0 h-full w-[46%] object-cover object-right mix-blend-multiply [-webkit-mask-image:linear-gradient(to_right,transparent,black_45%)] [mask-image:linear-gradient(to_right,transparent,black_45%)]"
      />
      <div class="relative max-w-[560px] p-7 sm:p-9">
        <p class="text-[26px] leading-none text-app-muted" aria-hidden="true">“</p>
        <p class="mt-1 text-[17px] leading-[1.5] text-app-muted">
          Har kuni o‘zingga yaxshilanish –
        </p>
        <p class="text-[19px] font-bold leading-[1.5] tracking-[-0.01em] text-app-ink">
          katta yutuqlarga olib keladi.
        </p>
      </div>
    </section>
  </main>
</template>
