<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="bg-[#222222] text-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row items-center justify-between gap-8">
        <h2 class="text-4xl font-bold">{{ t('finalCta.title') }}</h2>
        <button class="border-2 border-gray-400 text-white px-8 py-3 rounded-lg font-medium hover:border-white transition whitespace-nowrap">
          {{ t('finalCta.button') }}
        </button>
      </div>
    </div>
  </section>
</template>
