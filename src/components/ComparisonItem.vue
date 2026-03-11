<script setup lang="ts">
defineProps<{
  status: 'before' | 'after'
  text: string
}>()
</script>

<template>
  <li class="flex items-center space-x-4">
    <span
      :class="[
        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white',
        status === 'before' ? 'bg-red-500' : 'bg-green-500'
      ]"
    >
      {{ status === 'before' ? '✕' : '✓' }}
    </span>
    <span class="text-gray-700 text-lg">{{ text }}</span>
  </li>
</template>