<script setup>
// Stats band, from `MilliyMock Landing.dc.html`.
// The `fikrlar` id is the design's own anchor target for the nav.
//
// Every figure here is checked against GET /api/test (18/08/2026): 29 published
// tests, 1,303 questions across them, 5 subjects, and 28 of the 29 built to the
// 45-question / 180-minute exam format.
//
// What was here before could not be defended. "10,000+ Yaratilgan testlar" was
// wrong by two orders of magnitude; "13,543+ Faol foydalanuvchi" next to the
// hero's 18,8xx attempts published a ratio of 1.4 tests per user — a retention
// problem dressed as a trust signal; "98% Mamnun foydalanuvchi" had no source;
// and "24/7 qo'llab-quvvatlash" is a promise, not a statistic. Total attempts
// are deliberately absent: the hero already shows that number live.
const stats = [
  { value: '29', label: 'Tayyor mock test' },
  { value: '1,303', label: 'Test savollari' },
  { value: '5', label: 'Fan' },
  { value: '45', label: 'Har testda savol' },
]
</script>

<template>
  <section
    id="fikrlar"
    class="mx-auto box-content max-w-[1280px] px-[20px] pb-[48px] sm:px-[32px] lg:px-[48px] lg:pb-[72px]"
  >
    <div
      class="grid grid-cols-2 rounded-[20px] bg-panel px-[24px] py-[32px] gap-y-[28px] sm:py-[44px] lg:grid-cols-4 lg:gap-y-0"
    >
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="flex flex-col items-center gap-[10px] border-hairline-strong"
        :class="[
          index % 2 === 0 ? 'border-r' : '',
          index < 3 ? 'lg:border-r' : 'lg:border-r-0',
        ]"
      >
        <div class="text-[26px] font-bold tracking-[-0.02em] sm:text-[32px]">{{ stat.value }}</div>
        <div class="text-center text-[15px] text-muted">{{ stat.label }}</div>
      </div>
    </div>
  </section>
</template>
