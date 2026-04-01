<script setup>
import { computed } from 'vue'

const props = defineProps({
  remainingSeconds: {
    type: Number,
    default: 0,
  },
})

const formattedTime = computed(() => {
  const totalSeconds = Math.max(Math.floor(Number(props.remainingSeconds || 0)), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const normalizedMinutes = String(minutes).padStart(2, '0')
  const normalizedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${normalizedMinutes}:${normalizedSeconds}`
  }

  return `${normalizedMinutes}:${normalizedSeconds}`
})
</script>

<template>
  <div class="fixed right-3 top-3 z-30 sm:right-6 sm:top-6">
    <div
      class="floating-timer flex items-center gap-3 rounded-[20px] border border-white/10 bg-black/90 px-4 py-3 text-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md"
    >
      <div
        class="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          class="h-5 w-5"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 7v5l3 3"
          />
        </svg>
      </div>

      <span class="countdown-text">
        {{ formattedTime }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.countdown-text {
  font-size: 32px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.floating-timer {
  min-width: 170px;
}
</style>
