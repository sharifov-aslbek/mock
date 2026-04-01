<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  message: {
    type: String,
    default: '',
  },
  showLogin: {
    type: Boolean,
    default: false,
  },
  loginRoute: {
    type: [String, Object],
    default: '',
  },
  loginLabel: {
    type: String,
    default: '',
  },
  retryLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['retry'])
</script>

<template>
  <div class="mx-auto max-w-3xl rounded-[22px] border border-black/10 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm font-normal text-black">
        {{ message }}
      </p>

      <div class="flex gap-3">
        <RouterLink
          v-if="showLogin"
          :to="loginRoute"
          class="font-sans-custom inline-flex items-center justify-center border-2 border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
        >
          {{ loginLabel }}
        </RouterLink>

        <button
          v-else
          type="button"
          @click="$emit('retry')"
          class="font-sans-custom border-2 border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
        >
          {{ retryLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
