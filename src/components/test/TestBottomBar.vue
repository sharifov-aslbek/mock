<script setup>
defineProps({
  answeredCount: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  answeredLabel: {
    type: String,
    default: '',
  },
  submitLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['submit'])
</script>

<template>
  <div class="fixed bottom-0 left-1/2 z-30 w-full max-w-[920px] -translate-x-1/2 border-t border-[#e0ddd7] bg-white">
    <div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
      <div class="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Savollar ro'yxati"
          class="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#e0ddd7] bg-white text-[#1a1814] transition hover:bg-[#1a1814] hover:text-white"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="7" x2="20" y2="7" stroke-linecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round" />
            <line x1="4" y1="17" x2="20" y2="17" stroke-linecap="round" />
          </svg>
        </button>

        <p class="font-mono-custom text-[11px] font-normal uppercase tracking-[0.18em] text-[#8a857c] sm:text-sm">
          {{ answeredCount }} / {{ totalQuestions }} {{ answeredLabel }}
        </p>
      </div>

      <button
        type="button"
        @click="$emit('submit')"
        class="font-mono-custom w-full rounded-[18px] bg-[#1a1814] px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-black sm:w-auto sm:rounded-[10px] sm:px-8 sm:py-3 sm:text-sm sm:tracking-[0.18em]"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>
