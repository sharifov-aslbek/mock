<script setup>
// TEMPORARY marketing navbar.
//
// Step 2 of the landing/platform split only needs a working public shell with
// the four real marketing routes in it. The exact designed navbar comes from
// `MilliyMock Landing.dc.html` in step 3 and replaces the markup below —
// the auth-free contract (no auth store, no session request) stays.
import { onMounted, ref } from 'vue'
import { hasStoredSession } from '@/utils/authToken'
import logoMark from '@/assets/logo-removed.png'

const navItems = [
  { label: 'Natijalar', to: '/natijalar' },
  { label: 'Platforma', to: '/platforma' },
  { label: 'AI tekshiruv', to: '/ai-tekshiruv' },
  { label: 'Narxlar', to: '/narxlar' },
]

// Read once on mount rather than during setup so SSR/prerender-safe and so a
// login in another tab is picked up on the next navigation.
const isLoggedIn = ref(false)
onMounted(() => {
  isLoggedIn.value = hasStoredSession()
})
</script>

<template>
  <header class="sticky top-0 z-[100] w-full border-b border-[#1a1a1a] bg-[#0a0a0a] text-white">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <RouterLink
        to="/"
        class="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <img :src="logoMark" alt="MilliyMock" width="32" height="32" class="h-8 w-auto object-contain" />
        <span class="text-[17px] font-bold tracking-[-0.025em]">MilliyMock</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Asosiy menyu">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-4 py-2 text-[14px] text-[#888] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          active-class="font-medium text-white"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <RouterLink
        :to="isLoggedIn ? '/math' : '/login'"
        class="rounded-full border border-[#333] bg-[#1e1e1e] px-5 py-2 text-[14px] font-medium text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {{ isLoggedIn ? 'Platformaga o‘tish' : 'Boshlash' }}
      </RouterLink>
    </div>
  </header>
</template>
