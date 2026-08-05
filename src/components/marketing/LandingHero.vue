<script setup>
// Hero, from `MilliyMock Landing.dc.html`.
//
// The design exposes two authoring props: `dashboardTilt` (default 0deg) and
// `showPlayButton` (default true). Both are built at their defaults — a 0deg
// rotation is a no-op, so no transform wrapper is emitted.
import dashboardFigure from '@/assets/landing/dashboard-figure.png'
</script>

<template>
  <header
    class="mx-auto box-content grid max-w-[1280px] grid-cols-1 items-center gap-[40px] px-[20px] pb-[64px] pt-[48px] sm:px-[32px] lg:grid-cols-[0.82fr_1.18fr] lg:gap-[56px] lg:px-[48px] lg:pb-[96px] lg:pt-[72px]"
  >
    <div class="flex animate-fade-up flex-col items-start">
      <h1
        class="mb-[32px] font-display text-[40px] font-semibold leading-[1.08] tracking-[-0.015em] sm:text-[56px] lg:text-[72px]"
      >
        Bilimingizni sinang. <span class="text-accent">Natijangizni oshiring.</span>
      </h1>

      <p class="mb-[40px] max-w-[400px] text-[19px] leading-[1.65] text-muted">
        <span class="text-ink">Milliy Mock</span> — testlar, essay tekshirish va kurslar orqali
        o'qish jarayoningizni samarali va qiziqarli qiling.
      </p>

      <div class="flex flex-wrap items-center gap-[24px]">
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-[10px] whitespace-nowrap rounded-full bg-ink px-[30px] py-[16px] text-[16px] font-medium text-white transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:hover:scale-100"
        >
          Bepul boshlash <span aria-hidden="true">→</span>
        </RouterLink>

        <RouterLink
          to="/login"
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

      <div
        class="mt-[36px] inline-flex items-center gap-[12px] rounded-full border border-hairline bg-white py-[9px] pl-[12px] pr-[20px] shadow-[0_2px_10px_rgba(17,17,17,0.04)]"
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

    <div class="animate-fade-up-late">
      <img
        :src="dashboardFigure"
        alt="Milliy Mock platformasining boshqaruv paneli"
        width="1536"
        height="1024"
        loading="lazy"
        class="ml-auto block w-full max-w-[720px] drop-shadow-[0_34px_48px_rgba(17,17,17,0.10)]"
      />
    </div>
  </header>
</template>
