<script setup>
// Landing navigation, from `MilliyMock Landing.dc.html`.
//
// Below lg the links collapse into a menu button. They used to wrap onto a
// second row under the logo, which pushed the hero down and read as two
// separate bars rather than one navigation.
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePlatformEntry } from '@/composables/usePlatformEntry'
import logoLockup from '@/assets/landing/logo-lockup.png'

// Four links, each a real public route. Narxlar is the important one: /narxlar
// has always existed but was unreachable from the landing page, so a visitor
// could not find pricing without registering first. Platforma and Fikrlar moved
// to the footer — they are reference pages, not the paths a visitor is deciding
// between here. There is no Testlar item because /testlar is behind the auth
// wall; linking it would bounce logged-out visitors into /register.
const navItems = [
  // Courses do not exist yet, so this leads to the page that says so — an
  // anchor to a four-word feature column implied they were already there.
  { label: 'Kurslar', to: '/kurslar' },
  // The essay analysis screen has its own page — better than an anchor to a
  // four-word feature column, and it keeps /platforma about the platform.
  { label: 'Essay tekshirish', to: '/essay-tekshirish' },
  // Public success stories. A signed-in student is redirected to /natijalarim
  // by the router guard, so one item serves both states.
  { label: 'Natijalar', to: '/natijalar' },
  { label: 'Narxlar', to: '/narxlar' },
]

const { enter } = usePlatformEntry()

const open = ref(false)
const route = useRoute()

// Two of the links point at the same route, so navigating does not always
// change the path — close on every click as well as on a real navigation.
watch(() => route.fullPath, () => {
  open.value = false
})
</script>

<template>
  <div class="relative">
    <nav
      class="mx-auto box-content flex max-w-[1280px] items-center justify-between px-[20px] py-[18px] sm:px-[32px] lg:h-[92px] lg:px-[48px] lg:py-0"
      aria-label="Asosiy menyu"
    >
      <!-- Logo and links are one group, 48px apart: the link row used to float
           between the logo and the centre of the container, which read as a
           failed centring rather than a decision. Left-aligned off the logo it
           has an edge to belong to. -->
      <div class="flex items-center lg:gap-[48px]">
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

        <div class="hidden items-center text-[15px] font-medium lg:flex lg:gap-[32px]">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            class="rounded-sm text-navlink transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </div>

      <RouterLink
        :to="enter"
        class="hidden items-center gap-[9px] whitespace-nowrap rounded-full bg-ink px-[24px] py-[12px] text-[15px] font-medium text-white transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:hover:scale-100 lg:inline-flex"
      >
        Platformaga kirish <span class="text-[15px]" aria-hidden="true">→</span>
      </RouterLink>

      <button
        type="button"
        class="-mr-[8px] inline-flex h-[40px] w-[40px] items-center justify-center rounded-full text-navlink transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
        :aria-expanded="open"
        aria-controls="menyu"
        :aria-label="open ? 'Menyuni yopish' : 'Menyuni ochish'"
        @click="open = !open"
      >
        <!-- Bare lines in the nav-link grey, no chrome around them: at this size
             a filled ink tile carried more weight than the logo opposite it. -->
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <template v-if="!open">
            <path d="M3 6h16M3 11h16M3 16h16" />
          </template>
          <template v-else>
            <path d="M5.5 5.5l11 11M16.5 5.5l-11 11" />
          </template>
        </svg>
      </button>
    </nav>

    <!-- The panel overlays the page rather than pushing it down, so opening the
         menu never scrolls the hero out from under the reader. -->
    <div
      v-show="open"
      id="menyu"
      class="absolute inset-x-0 top-full z-40 px-[20px] pb-[16px] sm:px-[32px] lg:hidden"
    >
      <div
        class="flex flex-col rounded-[16px] border border-hairline bg-white p-[8px] shadow-[0_10px_28px_rgba(17,17,17,0.06)]"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="rounded-[12px] px-[14px] py-[13px] text-[16px] font-medium text-navlink transition-colors hover:bg-tile hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          @click="open = false"
        >
          {{ item.label }}
        </RouterLink>

        <RouterLink
          :to="enter"
          class="mt-[6px] inline-flex items-center justify-center gap-[9px] rounded-full bg-ink px-[24px] py-[14px] text-[16px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          @click="open = false"
        >
          Platformaga kirish <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
