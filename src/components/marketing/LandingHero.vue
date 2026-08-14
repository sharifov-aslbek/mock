<script setup>
// Hero, from `MilliyMock Landing.dc.html`.
//
// The design exposes two authoring props: `dashboardTilt` (default 0deg) and
// `showPlayButton` (default true). Both are built at their defaults — a 0deg
// rotation is a no-op, so no transform wrapper is emitted. The figure's lean is
// baked into the render itself, not applied here.
import { usePlatformEntry } from '@/composables/usePlatformEntry'
import dashboardFigure from '@/assets/landing/dashboard-figure.png'

const { start } = usePlatformEntry()
</script>

<template>
  <header
    class="mx-auto box-content grid max-w-[1280px] grid-cols-1 items-center gap-[32px] px-[20px] pb-[64px] pt-[48px] sm:px-[32px] lg:grid-cols-[0.82fr_1.18fr] lg:gap-x-[56px] lg:gap-y-[36px] lg:px-[48px] lg:pb-[96px] lg:pt-[72px]"
  >
    <div
      class="flex animate-fade-up flex-col items-start lg:col-start-1 lg:row-start-1"
    >
      <!-- DM Sans, not the Playfair `font-display`: the serif set the headline
           apart from every other heading on the site, including the one on
           /platforma directly under it in the nav. -->
      <h1
        class="mb-[28px] text-[40px] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[56px] lg:text-[72px]"
      >
        Bilimingizni sinang. <span class="text-accent">Natijangizni oshiring.</span>
      </h1>

      <!-- One line at this measure. The old three-line version listed the
           product's parts, which the feature columns below already do. -->
      <p class="mb-[40px] max-w-[400px] text-[19px] leading-[1.65] text-muted">
        <span class="text-ink">Milliy Mock</span> — testlar va essay tekshirish bitta joyda.
      </p>

      <div class="flex flex-wrap items-center gap-[24px]">
        <RouterLink
          :to="start"
          class="inline-flex items-center gap-[10px] whitespace-nowrap rounded-full bg-ink px-[30px] py-[16px] text-[16px] font-medium text-white transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:hover:scale-100"
        >
          Bepul boshlash <span aria-hidden="true">→</span>
        </RouterLink>

        <!-- HIDDEN FOR NOW (by request) — the "Qanday ishlaydi?" play button.
             It still works: it points at /platforma, whose screen tour and
             four-step walkthrough are the real answer. Delete the v-if to
             bring it back; nothing else about it changed. -->
        <RouterLink
          v-if="false"
          to="/platforma"
          class="inline-flex items-center gap-[14px] whitespace-nowrap rounded-full text-[16px] font-medium text-ink transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:hover:scale-100"
        >
          <span
            class="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(17,17,17,0.08)]"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3.8 2.4 L11.4 7 L3.8 11.6 Z" fill="#111111" />
            </svg>
          </span>
          Qanday ishlaydi?
        </RouterLink>
      </div>

    </div>

    <div class="animate-fade-up-late lg:col-start-2 lg:row-span-2 lg:row-start-1">
      <img
        :src="dashboardFigure"
        alt="Milliy Mock platformasining boshqaruv paneli"
        width="1532"
        height="925"
        loading="lazy"
        class="ml-auto block w-full max-w-[720px] drop-shadow-[0_34px_48px_rgba(17,17,17,0.10)]"
      />
    </div>

    <!-- Social proof is the last thing read, not the first: on a phone it sits
         under the screenshot, after the reader has seen what the product is.
         On lg it returns to its place beneath the buttons. -->
    <div class="animate-fade-up-late lg:col-start-1 lg:row-start-2">
      <div
        class="inline-flex items-center gap-[12px] rounded-full border border-hairline bg-white py-[9px] pl-[12px] pr-[20px] shadow-[0_2px_10px_rgba(17,17,17,0.04)]"
      >
        <div class="flex" aria-hidden="true">
          <span
            class="inline-block h-[32px] w-[32px] overflow-hidden rounded-full border-2 border-white bg-avatar"
          ></span>
          <span
            class="-ml-[10px] inline-block h-[32px] w-[32px] overflow-hidden rounded-full border-2 border-white bg-avatar"
          ></span>
          <span
            class="-ml-[10px] inline-block h-[32px] w-[32px] overflow-hidden rounded-full border-2 border-white bg-avatar"
          ></span>
        </div>
        <span class="text-[15px] font-bold">13K+</span>
        <span class="text-[14px] text-muted">foydalanuvchi bizga ishonadi</span>
      </div>
    </div>
  </header>
</template>
