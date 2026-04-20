<script setup>
import MathAnswerInput from '@/components/MathAnswerInput.vue'
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'
import TestOptionButtons from '@/components/test/TestOptionButtons.vue'

const currentlyLocale =
  typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : 'uz'

const getTranslation = (question) => {
  const map = {
    uz: 'Uzbek',
    ru: 'Russian'
  }

  return (
    question?.translations?.find((item) => item.language === map[currentlyLocale])?.text ||
    question?.text ||
    ''
  )
}

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
    <span class="font-mono-custom mr-1 min-w-[22px] shrink-0 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
      {{ question.order }}.
    </span>

    <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
      <TestInlineMathText
        tag="h2"
        :text="getTranslation(question)"
        wrapper-class="max-w-full text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]"
      />


      <div v-if="question.imageUrl" class="rounded-[18px] border border-black/10 bg-[#faf8f4] p-2.5 sm:rounded-[22px] sm:p-3">
        <img
          :src="question.imageUrl"
          :alt="imageAlt"
          class="max-h-[420px] w-full object-contain"
        />
      </div>

      <div v-if="question.type === 'FreeAnswer'" class="max-w-[620px] space-y-2.5 sm:space-y-3">
        <label class="font-mono-custom block text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
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
