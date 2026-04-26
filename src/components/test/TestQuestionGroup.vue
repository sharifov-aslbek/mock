<script setup>
import { ref } from 'vue'
import { NPopover } from 'naive-ui'
import MathAnswerInput from '@/components/MathAnswerInput.vue'
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'
import TestOptionButtons from '@/components/test/TestOptionButtons.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  orderLabel: {
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

const emit = defineEmits(['update-matching-answer', 'update-option', 'update-free-answer'])
const openMatchingQuestionId = ref(null)

const isMatchingMenuOpen = (questionId) => openMatchingQuestionId.value === Number(questionId)

const setMatchingMenuOpen = (questionId, show) => {
  const normalizedQuestionId = Number(questionId)

  if (show) {
    openMatchingQuestionId.value = normalizedQuestionId
    return
  }

  if (openMatchingQuestionId.value === normalizedQuestionId) {
    openMatchingQuestionId.value = null
  }
}

const getSelectedMatchingOption = (question) => {
  const selectedOptionId = Number(props.selectedAnswers?.[question.id] || 0)

  if (!selectedOptionId) {
    return null
  }

  return (
    (Array.isArray(question?.matchingOptions) ? question.matchingOptions : []).find(
      (option) => Number(option.id) === selectedOptionId,
    ) || null
  )
}

const selectMatchingOption = (questionId, optionId) => {
  emit('update-matching-answer', questionId, optionId)
  openMatchingQuestionId.value = null
}

const clearMatchingOption = (questionId) => {
  emit('update-matching-answer', questionId, '')
  openMatchingQuestionId.value = null
}
</script>

<template>
  <div class="rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6">
    <div class="border-l-[3px] border-[#5b5750] pl-3.5 sm:pl-4">
      <div class="flex items-start gap-3 sm:gap-4">
        <span
          v-if="orderLabel"
          class="font-mono-custom min-w-[40px] shrink-0 pt-0.5 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[46px] sm:text-[17px]"
        >
          {{ orderLabel }}.
        </span>
        <TestInlineMathText
          tag="p"
          :text="title"
          wrapper-class="min-w-0 flex-1 text-[14px] font-normal leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]"
        />
      </div>
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
            {{ question.groupSubLabel ? `${question.groupSubLabel}.` : '' }}
          </span>

          <NPopover
            trigger="click"
            placement="bottom-start"
            :show="isMatchingMenuOpen(question.id)"
            @update:show="setMatchingMenuOpen(question.id, $event)"
          >
            <template #trigger>
              <button
                type="button"
                class="flex min-h-[38px] min-w-[180px] max-w-[260px] items-center gap-3 rounded-[14px] border border-[#d1cec7] bg-white px-3.5 py-2 text-left text-[13px] text-[#1a1814] shadow-[0_4px_14px_rgba(15,23,42,0.04)] transition hover:border-[#b8b4ad] focus:border-[#1a1814] focus:outline-none sm:min-h-[40px] sm:min-w-[220px] sm:rounded-[4px] sm:px-4 sm:text-[14px]"
              >
                <span
                  v-if="getSelectedMatchingOption(question)"
                  class="font-serif-custom shrink-0 text-[13px] text-[#1a1814] sm:text-[15px]"
                >
                  {{ getSelectedMatchingOption(question).letter }}.
                </span>
                <TestInlineMathText
                  v-if="getSelectedMatchingOption(question)"
                  tag="span"
                  :text="getSelectedMatchingOption(question).text"
                  wrapper-class="min-w-0 flex-1 text-[13px] font-normal leading-[1.45] text-[#1a1814] sm:text-[14px] sm:leading-[1.55]"
                />
                <span
                  v-else
                  class="font-mono-custom flex-1 text-[13px] font-normal text-[#8a857c] sm:text-[14px]"
                >
                  {{ selectOptionLabel }}
                </span>
                <span class="pointer-events-none ml-auto shrink-0 text-sm text-[#8a857c] sm:text-base">
                  ⌄
                </span>
              </button>
            </template>

            <div class="w-[min(82vw,320px)] rounded-[18px] bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
              <button
                type="button"
                class="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition hover:bg-[#f5f3ef]"
                @click="clearMatchingOption(question.id)"
              >
                <span class="font-mono-custom text-[12px] uppercase tracking-[0.08em] text-[#8a857c]">
                  {{ selectOptionLabel }}
                </span>
              </button>

              <button
                v-for="option in question.matchingOptions"
                :key="option.id"
                type="button"
                class="mt-1 flex w-full items-start gap-3 rounded-[12px] px-3 py-2.5 text-left transition hover:bg-[#f5f3ef]"
                :class="
                  Number(selectedAnswers[question.id]) === Number(option.id)
                    ? 'bg-[#f5f3ef]'
                    : ''
                "
                @click="selectMatchingOption(question.id, option.id)"
              >
                <span class="font-serif-custom shrink-0 text-[13px] text-[#1a1814] sm:text-[15px]">
                  {{ option.letter }}.
                </span>
                <TestInlineMathText
                  tag="span"
                  :text="option.text"
                  wrapper-class="min-w-0 flex-1 text-[13px] font-normal leading-[1.45] text-[#1a1814] sm:text-[14px] sm:leading-[1.55]"
                />
              </button>
            </div>
          </NPopover>

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
            {{ question.groupSubLabel ? `${question.groupSubLabel}.` : '' }}
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
                @update:model-value="emit('update-free-answer', question.id, $event)"
              />
            </div>

            <TestOptionButtons
              v-else
              :options="question.options"
              :model-value="selectedAnswers[question.id]"
              @update:model-value="emit('update-option', question.id, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
