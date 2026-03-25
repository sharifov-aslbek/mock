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
        d="M21.944 4.666c.16-.714-.53-1.306-1.187-1.02L2.927 10.38c-.77.296-.73 1.401.058 1.64l4.55 1.377 1.76 5.51c.236.737 1.185.89 1.64.264l2.54-3.497 4.983 3.66c.611.448 1.488.11 1.647-.635l1.839-8.633ZM9.025 12.995l9.132-5.761-7.096 6.865a.75.75 0 0 0-.196.347l-.965 3.897-.875-3.53a.75.75 0 0 0-.45-.51l-2.886-1.108 3.336-1.2Z"
      />
    </svg>
    <span class="hidden sm:inline">{{ t('supportButton.label') }}</span>
  </a>
</template>
