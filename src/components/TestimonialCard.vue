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
      <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <svg
          class="w-6 h-6 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div>
        <h4 class="font-bold text-gray-900">{{ name }}</h4>
        <p class="text-sm text-gray-600">{{ role }}</p>
      </div>
    </div>
    <p class="text-gray-700 text-sm leading-relaxed">{{ text }}</p>
  </div>
</template>