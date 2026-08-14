<script setup>
// /kurslar — an honest "not yet" page.
//
// The nav has always carried a Kurslar item, and until now it pointed at a
// four-word feature column on the landing page that promised courses without
// saying when or what. A visitor who clicks a nav item deserves a page; a page
// that has nothing to show should say so plainly rather than pad itself with
// invented curricula, screenshots of things that do not exist, or a launch date
// nobody has committed to.
//
// So: what is coming (only what is actually planned), what to do meanwhile
// (testlar and insho tekshirish — both live today), and the standard CTA.
import LandingCta from '@/components/marketing/LandingCta.vue'
import { usePlatformEntry } from '@/composables/usePlatformEntry'

const { enter } = usePlatformEntry()

const plans = [
  {
    title: 'Video darslar',
    body: 'Har bir fan bo‘yicha mavzular ketma-ketligi — imtihonda uchraydigan qismlarni boshidan oxirigacha yopadi.',
  },
  {
    title: 'Mavzu bo‘yicha mashq',
    body: 'Dars ortidan o‘sha mavzuning savollari. Zaif joyingiz qayerdaligi darsdan keyin darrov ko‘rinadi.',
  },
  {
    title: 'Kurs ichida natija kuzatuvi',
    body: 'Qaysi mavzuni tugatdingiz, qaysi biri qoldi — testlar natijalari bilan bitta joyda.',
  },
]
</script>

<template>
  <main>
    <section
      class="mx-auto box-content max-w-[1280px] px-[20px] pb-[56px] pt-[56px] sm:px-[32px] lg:px-[48px] lg:pb-[80px] lg:pt-[88px]"
    >
      <div class="mx-auto max-w-[720px] text-center">
        <span
          class="mb-[20px] inline-flex items-center gap-[8px] rounded-full border border-hairline bg-white px-[16px] py-[7px] text-[13px] font-medium uppercase tracking-[0.08em] text-muted"
        >
          <span class="h-[7px] w-[7px] rounded-full bg-accent" aria-hidden="true"></span>
          Tez orada
        </span>

        <h1
          class="mb-[16px] text-[34px] font-bold leading-[1.1] tracking-[-0.025em] sm:text-[44px] lg:text-[52px]"
        >
          Kurslar ustida ishlanmoqda
        </h1>

        <p class="mx-auto max-w-[560px] text-[17px] leading-[1.65] text-muted">
          Milliy sertifikatga to‘liq tayyorlaydigan kurslarni tayyorlayapmiz. Tayyor
          bo‘lgach, shu sahifada ochiladi — sana e’lon qilinganda birinchi bo‘lib
          platformada bilasiz.
        </p>
      </div>
    </section>

    <!-- Nima bo'ladi -->
    <section
      class="mx-auto box-content max-w-[1280px] px-[20px] pb-[64px] sm:px-[32px] lg:px-[48px] lg:pb-[96px]"
    >
      <div class="mx-auto max-w-[1120px]">
        <h2
          class="mb-[36px] font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.015em] sm:text-[32px] lg:text-[38px]"
        >
          Kurslarda nima bo‘ladi?
        </h2>

        <dl class="grid grid-cols-1 gap-x-[32px] gap-y-[32px] sm:grid-cols-3">
          <div
            v-for="plan in plans"
            :key="plan.title"
            class="border-t border-hairline-strong pt-[20px]"
          >
            <dt class="mb-[8px] text-[18px] font-bold">{{ plan.title }}</dt>
            <dd class="text-[15px] leading-[1.6] text-muted">{{ plan.body }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Hozircha -->
    <section
      class="mx-auto box-content max-w-[1280px] px-[20px] pb-[64px] sm:px-[32px] lg:px-[48px] lg:pb-[80px]"
    >
      <div
        class="mx-auto flex max-w-[1120px] flex-col items-start gap-[24px] rounded-[24px] bg-panel px-[24px] py-[40px] sm:px-[44px] lg:flex-row lg:items-center lg:justify-between lg:px-[64px] lg:py-[48px]"
      >
        <div class="max-w-[560px]">
          <h2 class="mb-[10px] text-[22px] font-bold leading-[1.2] sm:text-[26px]">
            Kutib turmang — tayyorgarlikni bugun boshlang
          </h2>
          <p class="text-[16px] leading-[1.65] text-muted">
            Real imtihon formatidagi testlar va insho tekshirish allaqachon ishlaydi.
            Kurslar chiqqanda natijalaringiz joyida turadi.
          </p>
        </div>

        <RouterLink
          :to="enter"
          class="inline-flex shrink-0 items-center gap-[10px] rounded-[12px] bg-ink px-[26px] py-[14px] text-[16px] font-medium text-white transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink motion-reduce:hover:scale-100"
        >
          Testlarni ko‘rish <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>

    <LandingCta />
  </main>
</template>
