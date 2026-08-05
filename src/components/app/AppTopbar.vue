<script setup>
// Platform top bar: page title/greeting on the left; bell, tanga pill, buy
// button and avatar menu on the right. From the approved mockup.
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import CoinIcon from './CoinIcon.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  user: { type: Object, required: true },
  // Optional breadcrumb for screens one level down (a subject inside Testlar).
  // Sits above the title so it reads as "where this came from", not an action.
  backTo: { type: String, default: '' },
  backLabel: { type: String, default: '' },
})

const emit = defineEmits(['openMenu'])
const isUserMenuOpen = ref(false)
</script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-4 pb-5 pt-6">
    <div class="flex min-w-0 items-center gap-3">
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-app-border bg-app-surface text-app-ink lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        aria-label="Menyuni ochish"
        @click="emit('openMenu')"
      >
        <AppIcon name="menu" :size="20" />
      </button>
      <div class="min-w-0">
        <RouterLink
          v-if="backTo && backLabel"
          :to="backTo"
          class="mb-1.5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-app-muted transition-colors hover:text-app-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        >
          <AppIcon name="arrowLeft" :size="15" />
          {{ backLabel }}
        </RouterLink>
        <!-- Wraps rather than truncates: a greeting cut to "Xush kelibsiz, super ad…"
             is worse than two lines. -->
        <h1 class="text-[20px] font-bold leading-tight tracking-[-0.025em] text-app-ink sm:text-[23px] lg:text-[26px]">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-0.5 text-[14px] text-app-muted">{{ subtitle }}</p>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-3">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-app-border bg-app-surface text-app-ink transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        aria-label="Bildirishnomalar"
      >
        <AppIcon name="bell" :size="18" />
      </button>

      <!-- On phones the balance doubles as the way to top up, so tanga never
           disappears from the shell at small widths. -->
      <RouterLink
        to="/narxlar"
        class="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-surface px-3.5 py-2 text-[14px] font-semibold text-app-ink transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        :aria-label="`${user.tanga} tanga — tanga sotib olish`"
      >
        <CoinIcon :size="16" class="text-app-coin" />
        {{ user.tanga }} tanga
      </RouterLink>

      <RouterLink
        to="/narxlar"
        class="hidden items-center rounded-full bg-app-ink px-4 py-2 text-[14px] font-semibold text-app-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink sm:inline-flex"
      >
        Tanga sotib olish
      </RouterLink>

      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
          :aria-expanded="isUserMenuOpen"
          aria-haspopup="menu"
          @click="isUserMenuOpen = !isUserMenuOpen"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-full bg-app-ink text-[14px] font-semibold text-app-surface"
          >
            S
          </span>
          <span class="hidden text-[14px] font-medium text-app-ink sm:block">{{ user.name }}</span>
          <AppIcon name="chevronDown" :size="16" class="text-app-muted" />
        </button>

        <div v-if="isUserMenuOpen" class="fixed inset-0 z-40" @click="isUserMenuOpen = false"></div>
        <div
          v-if="isUserMenuOpen"
          class="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-app-border bg-app-surface p-1.5 shadow-app-card"
          role="menu"
        >
          <RouterLink
            to="/sozlamalar"
            class="block rounded-xl px-3 py-2.5 text-[15px] text-app-ink hover:bg-app-tile"
            role="menuitem"
            @click="isUserMenuOpen = false"
          >
            Sozlamalar
          </RouterLink>
          <RouterLink
            to="/profile"
            class="block rounded-xl px-3 py-2.5 text-[15px] text-app-ink hover:bg-app-tile"
            role="menuitem"
            @click="isUserMenuOpen = false"
          >
            Profil
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
