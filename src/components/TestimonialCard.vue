<script setup lang="ts">
defineProps<{
  name: string
  role: string
  text: string
}>()
</script>

<template>
  <div class="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition bg-white">
    <div class="flex items-center space-x-4 mb-4">
      <div class="w-12 h-12 rounded-full bg-gray-400 flex-shrink-0"></div>
      <div>
        <h4 class="font-bold text-gray-900">{{ name }}</h4>
        <p class="text-sm text-gray-600">{{ role }}</p>
      </div>
    </div>
    <p class="text-gray-700 text-sm leading-relaxed">{{ text }}</p>
  </div>
</template>