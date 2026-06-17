<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <a
    href="https://t.me/AzimRkhmv"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full border border-black bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-neutral-900"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      class="h-5 w-5 shrink-0"
      fill="currentColor"
    >
      <path
        d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.27 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
      />
    </svg>
    <span class="hidden sm:inline">{{ t('supportButton.label') }}</span>
  </a>
</template>
