<script setup>
import MathAnswerInput from '@/components/MathAnswerInput.vue'
import TestOptionButtons from '@/components/test/TestOptionButtons.vue'

defineProps({
  question: {
    type: Object,
    required: true,
  },
  selectedAnswer: {
    type: [String, Number],
    default: '',
  },
  freeAnswerValue: {
    type: String,
    default: '',
  },
  imageAlt: {
    type: String,
    default: '',
  },
  freeAnswerLabel: {
    type: String,
    default: '',
  },
  freeAnswerPlaceholder: {
    type: String,
    default: '',
  },
  openMathLabel: {
    type: String,
    default: '',
  },
  closeMathLabel: {
    type: String,
    default: '',
  },
})

defineEmits(['update-option', 'update-free-answer'])
</script>

<template>
  <div class="flex items-start gap-3 sm:gap-4">
    <span class="font-mono-custom mr-1 min-w-[24px] shrink-0 text-[17px] font-semibold leading-none text-[#1a1814]">
      {{ question.displayIndex }}.
    </span>

    <div class="min-w-0 flex-1 space-y-4">
      <h2 class="text-[15px] font-normal leading-[1.8] text-[#1a1814] sm:text-[16px]">
        {{ question.text }}
      </h2>

      <div v-if="question.imageUrl" class="rounded-[22px] border border-black/10 bg-[#faf8f4] p-3">
        <img
          :src="question.imageUrl"
          :alt="imageAlt"
          class="max-h-[420px] w-full object-contain"
        />
      </div>

      <div v-if="question.type === 'FreeAnswer'" class="max-w-[620px] space-y-3">
        <label class="font-mono-custom block text-[11px] font-normal uppercase tracking-[0.16em] text-[#8a857c]">
          {{ freeAnswerLabel }}
        </label>

        <MathAnswerInput
          :model-value="freeAnswerValue"
          :placeholder="freeAnswerPlaceholder"
          :open-label="openMathLabel"
          :close-label="closeMathLabel"
          @update:model-value="$emit('update-free-answer', question.id, $event)"
        />
      </div>

      <TestOptionButtons
        v-else
        :options="question.options"
        :model-value="selectedAnswer"
        @update:model-value="$emit('update-option', question.id, $event)"
      />
    </div>
  </div>
</template>
