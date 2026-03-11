<script setup lang="ts">
defineProps<{
  number: string
  label: string
}>()
</script>

<template>
  <div class="text-center">
    <div class="text-5xl font-bold text-blue-400 mb-4">{{ number }}</div>
    <p class="text-gray-300 text-lg">{{ label }}</p>
  </div>
</template>