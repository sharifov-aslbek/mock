<script setup>
// /essay-tekshirish — the AI essay check, shown rather than described.
//
// This screen used to be the second tab of /platforma's showcase, which made
// both pages half about something else. The nav item now has its own page and
// /platforma is back to being about the platform.
import PlatformPreview from '@/components/marketing/PlatformPreview.vue'
import LandingCta from '@/components/marketing/LandingCta.vue'

// Only what the analysis screen actually does — each of these is visible in the
// capture above.
const points = [
  {
    title: 'Har bir xato matn ustida',
    body: 'Xato joyi inshoning o‘zida belgilanadi — bosganingizda o‘ng tomondagi izoh ochiladi.',
  },
  {
    title: 'Turlarga ajratilgan izoh',
    body: 'Gap qurilishi, imlo, tinish belgilari, qo‘shimchalar va so‘z qo‘llash — qaysi biri ko‘pligi darrov ko‘rinadi.',
  },
  {
    title: 'Yakuniy ball',
    body: 'Insho balli va shkala bo‘yicha natija, so‘z soni va xatolar soni bilan birga.',
  },
]
</script>

<template>
  <main>
    <PlatformPreview screen="essay" />

    <section
      class="mx-auto box-content max-w-[1280px] px-[20px] pb-[64px] sm:px-[32px] lg:px-[48px] lg:pb-[96px]"
    >
      <div class="mx-auto max-w-[1120px]">
        <dl class="grid grid-cols-1 gap-x-[32px] gap-y-[32px] sm:grid-cols-3">
          <div
            v-for="point in points"
            :key="point.title"
            class="border-t border-hairline-strong pt-[20px]"
          >
            <dt class="mb-[8px] text-[18px] font-bold">{{ point.title }}</dt>
            <dd class="text-[15px] leading-[1.6] text-muted">{{ point.body }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <LandingCta />
  </main>
</template>
