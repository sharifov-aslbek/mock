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
    class="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-black bg-black text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-neutral-900 sm:h-auto sm:w-auto sm:gap-3 sm:px-5 sm:py-3"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      class="h-6 w-6 shrink-0 sm:h-5 sm:w-5"
      fill="currentColor"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
    <span class="hidden sm:inline">{{ t('supportButton.label') }}</span>
  </a>
</template>
