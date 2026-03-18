<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div
    class="flex items-start space-x-4 rounded-2xl border border-gray-300 p-4 transition hover:shadow-lg sm:space-x-5 sm:rounded-3xl sm:p-6 lg:space-x-6 lg:p-8"
  >
    <div
      class="flex h-12 w-12 flex-shrink-0 items-center justify-center text-2xl sm:h-14 sm:w-14 sm:text-3xl lg:h-16 lg:w-16 lg:text-4xl"
    >
      {{ icon }}
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="mb-2 text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
        {{ title }}
      </h3>
      <p class="text-sm leading-6 text-gray-700 sm:text-base sm:leading-7 lg:text-lg">
        {{ description }}
      </p>
    </div>
  </div>
</template>