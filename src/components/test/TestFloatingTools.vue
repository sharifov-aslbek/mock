<script setup>
import { NCountdown } from 'naive-ui'

defineProps({
  referenceLabel: {
    type: String,
    default: '',
  },
  timerDurationMs: {
    type: Number,
    default: 0,
  },
  timerKey: {
    type: Number,
    default: 0,
  },
})

defineEmits(['toggle-reference'])

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
  <div class="mx-auto mb-6 flex max-w-[1280px] items-start justify-end gap-3 px-3 sm:mb-8 sm:px-5 lg:px-6">
    <button
      type="button"
      @click="$emit('toggle-reference')"
      class="group flex h-[68px] w-[210px] shrink-0 items-center justify-between rounded-[24px] border border-black/10 bg-white/95 px-6 text-left shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_16px_36px_rgba(15,23,42,0.14)] sm:h-[76px] sm:w-[250px]"
    >
      <div class="flex items-center gap-4">
        <div class="flex h-11 w-11 items-center justify-center rounded-[16px] bg-black text-white shadow-inner sm:h-12 sm:w-12">
          <span class="font-serif-custom text-[22px] leading-none sm:text-[24px]">x²</span>
        </div>

        <div class="flex flex-col">
          <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">
            Reference
          </span>
          <span class="font-mono-custom mt-1 text-[12px] font-bold uppercase tracking-[0.14em] text-black/85 sm:text-[13px]">
            {{ referenceLabel }}
          </span>
        </div>
      </div>

      <svg
        class="h-5 w-5 text-black/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-black/60"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.5 4.16663L13.3333 9.99996L7.5 15.8333"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div
      class="flex h-[68px] w-[210px] shrink-0 items-center justify-between rounded-[24px] border border-black/10 bg-white px-6 text-black shadow-[0_14px_38px_rgba(15,23,42,0.18)] sm:h-[76px] sm:w-[250px]"
    >
      <div class="flex flex-col">
        <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50">
          Time left
        </span>
        <n-countdown
          :key="timerKey"
          :duration="Math.max(timerDurationMs, 0)"
          :active="true"
        >
          <template #default="{ hours, minutes, seconds }">
            <span class="mt-1 block font-mono-custom text-[22px] font-bold tracking-[0.08em] text-white tabular-nums sm:text-[28px]">
              {{ renderCountdown({ hours, minutes, seconds }) }}
            </span>
          </template>
        </n-countdown>
      </div>

      <div class="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black/10">
        <svg
          class="h-5 w-5 text-black/80"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="6.5" stroke="currentColor" stroke-width="1.6" />
          <path
            d="M10 6.5V10L12.5 11.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>