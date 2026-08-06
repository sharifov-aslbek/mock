<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'
import TestAiReviewBadge from '@/components/test/TestAiReviewBadge.vue'
import TestAnswerImageUpload from '@/components/test/TestAnswerImageUpload.vue'

// A standalone AI-reviewed open-response question (Biology 41–43). Same
// canonical card and number gutter as TestQuestionBlock — only the answer area
// differs: there is no typed input, the uploaded photo(s) of the handwritten
// solution and drawings ARE the answer, graded from the images at get-results.
defineProps({
  question: { type: Object, required: true },
  uploads: { type: Array, default: () => [] },
  remoteImageUrls: { type: Array, default: () => [] },
  imageAlt: { type: String, default: '' },
})

defineEmits(['update-uploads'])

const { t } = useI18n()

const isQuestionChecked = ref(false)
</script>

<template>
  <div class="rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6">
    <div class="flex items-start gap-3 sm:gap-4">
      <span class="font-mono-custom pt-[3.9px] mr-1 min-w-[22px] shrink-0 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
        {{ question.showOrder ? `${question.displayOrder}.` : '' }}
      </span>

      <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
        <TestInlineMathText
          tag="h2"
          :text="question.text || ''"
          wrapper-class="max-w-full whitespace-pre-line text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]"
        />

        <div
          v-if="question.imageUrl"
          class="rounded-[18px] border border-black/10 bg-[#faf8f4] p-2.5 sm:rounded-[22px] sm:p-3"
        >
          <img
            :src="question.imageUrl"
            :alt="imageAlt || t('testPage.imageAlt')"
            class="max-h-[420px] w-full object-contain"
          />
        </div>

        <TestAiReviewBadge />

        <TestAnswerImageUpload
          :question-id="question.id"
          :uploads="uploads"
          :remote-image-urls="remoteImageUrls"
          @update-uploads="(questionId, next) => $emit('update-uploads', questionId, next)"
        />
      </div>

      <button
        type="button"
        class="mt-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1e5dc] bg-white shadow-[0_3px_10px_rgba(26,24,20,0.06)] transition hover:border-[#bcc7b5] hover:bg-[#fbfdf8] sm:mt-0.5"
        :class="isQuestionChecked ? 'text-[#1a1814]' : 'text-[#7f8a78]'"
        aria-label="Save question"
        @click.stop="isQuestionChecked = !isQuestionChecked"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z"
            :fill="isQuestionChecked ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
