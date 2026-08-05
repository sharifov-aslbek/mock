<script setup>
// Landing navigation, from `MilliyMock Landing.dc.html`.
//
// The design's four links are in-page anchors. They are written as `/#id` so
// they also work from the other marketing routes: the router's scrollBehavior
// (see src/router/index.js) navigates home and scrolls to the target.
import { onMounted, ref } from 'vue'
import { hasStoredSession } from '@/utils/authToken'
import logoLockup from '@/assets/landing/logo-lockup.png'

const navItems = [
  { label: 'Platforma', to: '/#platforma' },
  { label: 'Fikrlar', to: '/#fikrlar' },
  { label: 'Essay tekshirish', to: '/#essay' },
  { label: 'Kurslar', to: '/#kurslar' },
]

// localStorage peek only — the marketing shell never calls the session API.
const isLoggedIn = ref(false)
onMounted(() => {
  isLoggedIn.value = hasStoredSession()
})
</script>

<template>
  <nav
    class="mx-auto box-content flex max-w-[1280px] flex-wrap items-center justify-between gap-y-[14px] px-[20px] py-[18px] sm:px-[32px] lg:h-[92px] lg:flex-nowrap lg:px-[48px] lg:py-0"
    aria-label="Asosiy menyu"
  >
    <RouterLink
      to="/"
      class="flex items-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      <img
        :src="logoLockup"
        alt="Milliy Mock"
        width="107"
        height="27"
        class="block h-[27px] w-auto"
      />
    </RouterLink>

    <div
      class="order-3 flex w-full flex-wrap items-center justify-center gap-x-[24px] gap-y-[8px] text-[15px] font-medium lg:order-none lg:w-auto lg:gap-[40px]"
    >
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="rounded-sm text-navlink transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        {{ item.label }}
      </RouterLink>
    </div>

    <RouterLink
      :to="isLoggedIn ? '/math' : '/login'"
      class="inline-flex items-center gap-[9px] whitespace-nowrap rounded-full bg-ink px-[24px] py-[12px] text-[15px] font-medium text-white transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:hover:scale-100"
    >
      Platformaga kirish <span class="text-[15px]" aria-hidden="true">→</span>
    </RouterLink>
  </nav>
</template>
