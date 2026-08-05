<script setup>
// Platform sidebar: the brand lockup at the top, nav items as icon + label, and
// the user card pinned to the bottom.
//
// Weight discipline — the active item is a quiet light-grey rounded rectangle
// with dark text. Exactly one element in this sidebar carries solid black, and
// it is Community, the promoted destination. If the active state also went
// black, two things would shout at once and neither would read as current.
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import CoinIcon from './CoinIcon.vue'
import logoLockup from '@/assets/landing/logo-lockup.png'

defineProps({
  user: { type: Object, required: true },
})

const emit = defineEmits(['navigate'])
const route = useRoute()

const navItems = [
  { label: 'Bosh sahifa', icon: 'home', to: '/dashboard' },
  { label: 'Testlar', icon: 'tests', to: '/testlar' },
  { label: 'Essay tekshirish', icon: 'essay', to: '/essay' },
  { label: 'Natijalar', icon: 'results', to: '/result-exam' },
  { label: 'Narxlar', icon: 'coins', to: '/narxlar' },
  { label: 'Yordam', icon: 'help', to: '/yordam' },
  { label: 'Sozlamalar', icon: 'settings', to: '/sozlamalar' },
  { label: 'Community', icon: 'community', to: '/community', promoted: true },
]

const isActive = (to) => route.path === to || route.path.startsWith(`${to}/`)

const itemClass = (item) => {
  if (item.promoted) return 'bg-app-ink font-semibold text-app-surface hover:opacity-90'
  if (isActive(item.to)) return 'bg-app-tile font-semibold text-app-ink'
  return 'font-medium text-app-ink hover:bg-app-tile'
}
</script>

<template>
  <div class="flex h-full flex-col bg-app-surface">
    <div class="px-5 pb-5 pt-6">
      <RouterLink
        to="/dashboard"
        class="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-app-ink"
        @click="emit('navigate')"
      >
        <img :src="logoLockup" alt="MilliyMock" width="99" height="25" class="h-[25px] w-auto" />
      </RouterLink>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Platforma menyusi">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        :class="itemClass(item)"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        @click="emit('navigate')"
      >
        <AppIcon :name="item.icon" :size="19" class="shrink-0" />
        <span class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="p-3">
      <RouterLink
        to="/sozlamalar"
        class="block rounded-xl border border-app-border bg-app-surface p-3.5 transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        @click="emit('navigate')"
      >
        <div class="flex items-center gap-3">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-ink text-[14px] font-semibold text-app-surface"
          >
            {{ (user.name || 'S').charAt(0).toUpperCase() }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[14px] font-semibold text-app-ink">{{ user.name }}</p>
            <p class="truncate text-[12px] text-app-muted">{{ user.email }}</p>
          </div>
          <AppIcon name="arrowRight" :size="16" class="shrink-0 text-app-muted" />
        </div>
        <span
          class="mt-3 inline-flex items-center gap-2 rounded-full bg-app-tile px-2.5 py-1 text-[12px] font-semibold text-app-ink"
        >
          <CoinIcon :size="14" class="text-app-coin" />
          {{ user.tanga }} tanga
        </span>
      </RouterLink>
    </div>
  </div>
</template>
