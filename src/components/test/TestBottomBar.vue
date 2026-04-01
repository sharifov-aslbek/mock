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
    <div class="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-4 sm:px-12">
      <p class="font-mono-custom text-sm font-normal uppercase tracking-[0.18em] text-[#8a857c]">
        {{ answeredCount }} / {{ totalQuestions }} {{ answeredLabel }}
      </p>

      <button
        type="button"
        @click="$emit('submit')"
        class="font-mono-custom rounded-[4px] bg-[#1a1814] px-8 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-black"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>
