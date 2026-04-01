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
  <div class="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e0ddd7] bg-[#f5f3ef]/95 backdrop-blur">
    <div class="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-12 sm:py-4">
      <p class="font-mono-custom text-[11px] font-normal uppercase tracking-[0.18em] text-[#8a857c] sm:text-sm">
        {{ answeredCount }} / {{ totalQuestions }} {{ answeredLabel }}
      </p>

      <button
        type="button"
        @click="$emit('submit')"
        class="font-mono-custom w-full rounded-[18px] bg-[#1a1814] px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-black sm:w-auto sm:rounded-[4px] sm:px-8 sm:py-3 sm:text-sm sm:tracking-[0.18em]"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>
