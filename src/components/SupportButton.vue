<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <a
    href="https://t.me/Milliymocksupport"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="t('supportButton.label')"
    class="fixed bottom-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black bg-black text-[13px] font-semibold text-white shadow-md shadow-black/10 transition hover:-translate-y-0.5 hover:bg-neutral-900 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      class="h-[18px] w-[18px] shrink-0 sm:h-4 sm:w-4"
      fill="currentColor"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
    <span class="hidden sm:inline">{{ t('supportButton.label') }}</span>
  </a>
</template>
