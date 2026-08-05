<script setup>
// Platform sidebar, from the approved Bosh sahifa mockup: logo at the top, nav
// items as icon + label, a solid black pill for the active item, and the user
// card pinned to the bottom.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import CoinIcon from './CoinIcon.vue'
// The brand mark, white on transparent — sits inside the black circle.
import logoMark from '@/assets/logo-removed.png'

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
  { label: 'Community', icon: 'community', to: '/community' },
]

const isActive = (to) => route.path === to || route.path.startsWith(`${to}/`)
const initial = computed(() => 'S')
</script>

<template>
  <div class="flex h-full flex-col bg-app-surface">
    <div class="flex items-center gap-2.5 px-6 pb-6 pt-7">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-app-ink">
        <img :src="logoMark" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5 object-contain" />
      </span>
      <span class="text-[17px] font-bold tracking-[-0.02em] text-app-ink">MilliyMock</span>
    </div>

    <nav class="flex-1 space-y-1.5 overflow-y-auto px-3" aria-label="Platforma menyusi">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-2xl px-4 py-4 text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        :class="
          isActive(item.to)
            ? 'bg-app-ink font-semibold text-app-surface'
            : 'font-medium text-app-ink hover:bg-app-tile'
        "
        :aria-current="isActive(item.to) ? 'page' : undefined"
        @click="emit('navigate')"
      >
        <AppIcon :name="item.icon" :size="20" class="shrink-0" />
        <span class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="p-3">
      <RouterLink
        to="/sozlamalar"
        class="block rounded-2xl border border-app-border bg-app-surface p-4 transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        @click="emit('navigate')"
      >
        <div class="flex items-center justify-between">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-full bg-app-ink text-[15px] font-semibold text-app-surface"
          >
            {{ initial }}
          </span>
          <AppIcon name="arrowRight" :size="18" class="text-app-muted" />
        </div>
        <p class="mt-3 truncate text-[15px] font-semibold text-app-ink">{{ user.name }}</p>
        <p class="truncate text-[13px] text-app-muted">{{ user.email }}</p>
        <span
          class="mt-3 inline-flex items-center gap-2 rounded-full bg-app-tile px-3 py-1.5 text-[13px] font-semibold text-app-ink"
        >
          <CoinIcon :size="16" class="text-app-coin" />
          {{ user.tanga }} tanga
        </span>
      </RouterLink>
    </div>
  </div>
</template>
