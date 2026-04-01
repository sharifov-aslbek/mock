<script setup>
import { NCountdown } from 'naive-ui'

defineProps({
  timerDurationMs: {
    type: Number,
    default: 0,
  },
  timerKey: {
    type: Number,
    default: 0,
  },
})

const renderCountdown = ({ hours, minutes, seconds }) => {
  const normalizedHours = Number(hours || 0)
  const normalizedMinutes = String(minutes || 0).padStart(2, '0')
  const normalizedSeconds = String(seconds || 0).padStart(2, '0')

  if (normalizedHours > 0) {
    return `${String(normalizedHours).padStart(2, '0')}:${normalizedMinutes}:${normalizedSeconds}`
  }

  return `${normalizedMinutes}:${normalizedSeconds}`
}
</script>

<template>
  <div class="fixed right-3 top-3 z-30 sm:right-6 sm:top-6">
    <div class="min-w-[108px] rounded-[22px] bg-black px-4 py-2.5 text-center text-white shadow-[0_14px_36px_rgba(15,23,42,0.2)] sm:min-w-[124px]">
      <n-countdown
        :key="timerKey"
        :duration="Math.max(timerDurationMs, 0)"
        :active="true"
      >
        <template #default="{ hours, minutes, seconds }">
          <span class="font-mono-custom text-[17px] font-bold tracking-[0.12em] text-white tabular-nums sm:text-[21px]">
            {{ renderCountdown({ hours, minutes, seconds }) }}
          </span>
        </template>
      </n-countdown>
    </div>
  </div>
</template>
