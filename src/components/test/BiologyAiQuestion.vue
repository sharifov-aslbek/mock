<script setup>
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'
import BiologyDrawingUpload from '@/components/test/BiologyDrawingUpload.vue'

// Biology's AI-checked questions (41–43). These are answered ONLY by uploading a
// photo of the hand-written solution + drawings — there are no typed answer
// boxes. The stem and a/b/c parts are shown read-only (canonical group card with
// the left-bar number), and the single image upload is the whole answer.
defineProps({
  question: { type: Object, required: true },
  uploads: { type: Array, default: () => [] },
})

defineEmits(['update-uploads'])
</script>

<template>
  <div class="rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6">
    <!-- Stem: left-bar + number, exactly like TestQuestionGroup -->
    <div class="border-l-[3px] border-[#5b5750] pl-3.5 sm:pl-4">
      <div class="flex items-start gap-3 sm:gap-4">
        <span class="font-mono-custom min-w-[40px] shrink-0 pt-0.5 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[46px] sm:text-[17px]">
          {{ question.order }}
        </span>
        <TestInlineMathText
          tag="p"
          :text="question.text"
          wrapper-class="min-w-0 flex-1 text-[14px] font-normal leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]"
        />
      </div>
    </div>

    <!-- Sub-parts a/b/c — read-only prompts (no answer boxes) -->
    <div v-if="question.parts?.length" class="mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">
      <div
        v-for="part in question.parts"
        :key="part.key"
        class="flex items-start gap-3 sm:gap-4"
      >
        <span class="font-mono-custom mr-1 min-w-[22px] shrink-0 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
          {{ part.key }}.
        </span>
        <TestInlineMathText
          tag="p"
          :text="part.text"
          wrapper-class="min-w-0 flex-1 text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]"
        />
      </div>
    </div>

    <!-- The only answer: upload photo(s) of the solution + drawings -->
    <BiologyDrawingUpload
      :order="question.order"
      :uploads="uploads"
      @update-uploads="(order, next) => $emit('update-uploads', order, next)"
    />
  </div>
</template>
