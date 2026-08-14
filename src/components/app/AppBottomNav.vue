<script setup>
// Mobile tab bar — the platform's navigation on a phone.
//
// The drawer was the only way to reach Testlar or Essay tekshirish below lg,
// which means a student had to know a menu existed before they could find the
// two things they came for. A tab bar states the destinations without being
// asked, and keeps them one thumb-reach away on every screen.
//
// Four tabs plus "Ko'proq", which opens the same drawer as before for the rest
// (Kurslar, Statistika, Narxlar, Community, Sozlamalar). Four, not seven: a tab
// each would leave ~55px per label on a 390px screen and every one would be
// truncated.
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

defineProps({
  // Highlighted while the drawer is open, so "Ko'proq" reads as the current
  // surface rather than an inert button.
  drawerOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['openMenu'])
const route = useRoute()

// Same paths as the sidebar — the platform's own, never one that redirects
// here, or the tab could never highlight as current.
const tabs = [
  { label: 'Bosh sahifa', icon: 'home', to: '/dashboard' },
  { label: 'Testlar', icon: 'tests', to: '/testlar' },
  { label: 'Essay', icon: 'essay', to: '/essay' },
  { label: 'Natijalar', icon: 'results', to: '/natijalarim' },
]

const isActive = (to) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-[100] border-t border-app-border bg-app-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    aria-label="Asosiy bo‘limlar"
  >
    <div class="mx-auto flex max-w-[520px] items-stretch">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-app-ink"
        :class="
          isActive(tab.to) && !drawerOpen
            ? 'font-semibold text-app-ink'
            : 'font-medium text-app-muted'
        "
        :aria-current="isActive(tab.to) ? 'page' : undefined"
      >
        <AppIcon :name="tab.icon" :size="21" />
        <span class="max-w-full truncate">{{ tab.label }}</span>
      </RouterLink>

      <button
        type="button"
        class="flex flex-1 flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-app-ink"
        :class="drawerOpen ? 'font-semibold text-app-ink' : 'font-medium text-app-muted'"
        :aria-expanded="drawerOpen"
        @click="emit('openMenu')"
      >
        <AppIcon name="menu" :size="21" />
        <span>Ko‘proq</span>
      </button>
    </div>
  </nav>
</template>
