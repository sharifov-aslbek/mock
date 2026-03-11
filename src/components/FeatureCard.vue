<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="border-2 border-gray-300 rounded-3xl p-8 flex items-start space-x-6 hover:shadow-lg transition">
    <div class="text-4xl flex-shrink-0 w-16 h-16 flex items-center justify-center">
      {{ icon }}
    </div>
    <div class="flex-1">
      <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-gray-700 text-lg">{{ description }}</p>
    </div>
  </div>
</template>