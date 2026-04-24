<script setup>
import MathAnswerInput from '@/components/MathAnswerInput.vue'
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'
import TestOptionButtons from '@/components/test/TestOptionButtons.vue'
import { toPlainTestText } from '@/utils/testText'

defineProps({
  title: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  optionBank: {
    type: Array,
    default: () => [],
  },
  questions: {
    type: Array,
    default: () => [],
  },
  selectedAnswers: {
    type: Object,
    default: () => ({}),
  },
  resolveFreeAnswer: {
    type: Function,
    default: () => '',
  },
  imageAlt: {
    type: String,
    default: '',
  },
  optionBankLabel: {
    type: String,
    default: '',
  },
  selectOptionLabel: {
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

defineEmits(['update-matching-answer', 'update-option', 'update-free-answer'])
</script>

<template>
  <div class="rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6">
    <div class="border-l-[3px] border-[#5b5750] pl-3.5 sm:pl-4">
      <TestInlineMathText
        tag="p"
        :text="title"
        wrapper-class="text-[14px] font-normal leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]"
      />
    </div>

    <div
      v-if="imageUrl"
      class="mt-4 rounded-[18px] border border-black/10 bg-[#faf8f4] p-2.5 sm:mt-5 sm:rounded-[22px] sm:p-3"
    >
      <img
        :src="imageUrl"
        :alt="imageAlt"
        class="max-h-[420px] w-full object-contain"
      />
    </div>

    <div v-if="optionBank.length" class="mt-4 space-y-2 sm:mt-5">
      <p class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.18em] text-[#8a857c] sm:text-[11px]">
        {{ optionBankLabel }}
      </p>

      <div class="space-y-2">
        <div
          v-for="option in optionBank"
          :key="option.id"
          class="flex items-center gap-3 rounded-[14px] bg-[#f5f3ef] px-3 py-2.5 sm:gap-4 sm:rounded-[4px] sm:px-4"
        >
          <span class="font-serif-custom min-w-[20px] shrink-0 text-[13px] font-normal text-[#1a1814] sm:min-w-[24px] sm:text-[15px]">
            {{ option.letter }}.
          </span>
          <TestInlineMathText
            tag="p"
            :text="option.text"
            wrapper-class="min-w-0 flex-1 text-[13px] font-normal leading-[1.55] text-[#1a1814] sm:text-[15px] sm:leading-[1.7]"
          />
        </div>
      </div>
    </div>

    <div class="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
      <div
        v-for="question in questions"
        :key="question.id"
        class="space-y-3"
        :class="question.shouldSeparate ? 'pt-5 sm:pt-6' : ''"
      >
        <div
          v-if="question.type === 'Matching'"
          class="flex items-start gap-2.5 sm:gap-3"
        >
          <span class="font-mono-custom mr-1 min-w-[22px] shrink-0 pt-2 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:pt-2.5 sm:text-[17px]">
            {{ question.displayIndex }}.
          </span>

          <div class="relative shrink-0">
            <select
              :value="selectedAnswers[question.id] || ''"
              @change="$emit('update-matching-answer', question.id, $event.target.value)"
              class="font-mono-custom h-[38px] min-w-[72px] appearance-none rounded-[14px] border border-[#d1cec7] bg-white px-3.5 pr-8 text-[13px] font-normal text-[#1a1814] outline-none transition hover:border-[#b8b4ad] focus:border-[#1a1814] sm:h-[40px] sm:min-w-[78px] sm:rounded-[4px] sm:px-4 sm:pr-9 sm:text-[14px]"
            >
              <option value="">
                {{ selectOptionLabel }}
              </option>
              <option
                v-for="option in question.matchingOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.letter }}. {{ toPlainTestText(option.text) }}
              </option>
            </select>
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8a857c] sm:text-base">
              ⌄
            </span>
          </div>

          <div class="min-w-0 flex-1 space-y-2 pt-1 sm:pt-1.5">
            <TestInlineMathText
              tag="p"
              :text="question.text"
              wrapper-class="max-w-full text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]"
            />

            <div
              v-if="question.imageUrl"
              class="rounded-[18px] border border-black/10 bg-[#faf8f4] p-2.5 sm:rounded-[22px] sm:p-3"
            >
              <img
                :src="question.imageUrl"
                :alt="imageAlt"
                class="max-h-[420px] w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div v-else class="flex items-start gap-3 sm:gap-4">
          <span class="font-mono-custom mr-1 min-w-[22px] shrink-0 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
            {{ question.displayIndex }}.
          </span>

          <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
            <TestInlineMathText
              tag="h2"
              :text="question.text"
              wrapper-class="max-w-full text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]"
            />

            <div
              v-if="question.imageUrl"
              class="rounded-[18px] border border-black/10 bg-[#faf8f4] p-2.5 sm:rounded-[22px] sm:p-3"
            >
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
                :model-value="resolveFreeAnswer(question.id)"
                :placeholder="freeAnswerPlaceholder"
                :open-label="openMathLabel"
                :close-label="closeMathLabel"
                @update:model-value="$emit('update-free-answer', question.id, $event)"
              />
            </div>

            <TestOptionButtons
              v-else
              :options="question.options"
              :model-value="selectedAnswers[question.id]"
              @update:model-value="$emit('update-option', question.id, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
