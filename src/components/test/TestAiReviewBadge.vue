<script setup>
import { useI18n } from 'vue-i18n'

// "AI tekshiradi" pill. Shown on every question whose backend `aiReviewMode` is
// not null — the essay (MotherTongueEssay) and the image-only open responses
// (BiologyOpenResponse) alike. See utils/aiReview.js.
const { t } = useI18n()
</script>

<template>
  <span
    class="font-mono-custom inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-normal uppercase tracking-[0.16em] text-emerald-700 sm:text-[11px]"
  >
    <svg
      class="h-3 w-3 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
    </svg>
    {{ t('testPage.aiReview.badge') }}
  </span>
</template>
