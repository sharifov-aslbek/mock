<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NCard, NModal } from 'naive-ui'
import { biologyDemoTest } from '@/data/biologyDemoTest'
import TestFloatingTools from '@/components/test/TestFloatingTools.vue'
import TestBottomBar from '@/components/test/TestBottomBar.vue'
import TestQuestionBlock from '@/components/test/TestQuestionBlock.vue'
import TestQuestionGroup from '@/components/test/TestQuestionGroup.vue'
import BiologyAiQuestion from '@/components/test/BiologyAiQuestion.vue'

// Biology renders through the SAME components every other subject uses
// (TestQuestionBlock / TestQuestionGroup / MathAnswerInput) so the exam-taking
// UI is identical to math and ona tili. The local sample is adapted into the
// canonical question shapes those components expect. See the
// `milliymock-test-page` skill for the pattern.
const test = biologyDemoTest
const { t } = useI18n()
const router = useRouter()

// Full-screen test mode has no navbar, so provide an explicit exit (like /test)
// back to the Biology tests listing.
const closeTest = () => router.push('/biologiya')

// ——— Answer state (frontend-only) ———————————————————————————————————
const answers = reactive({}) // MCQ:  question id → chosen option id
const matchingAnswers = reactive({}) // 33–35: question id → chosen A–F bank id
const freeAnswers = reactive({}) // free answers: 36–40 (by order) + 41–43 parts
const aiUploads = reactive({}) // 41–43: order → [{ id, name, dataUrl }] drawings

const sectionMeta = computed(() => new Map(test.sections.map((s) => [s.id, s])))

// ——— Canonical shapes for the shared components ————————————————————
const mcqOptions = (question) =>
  (question.options || []).map((option) => ({
    id: `${question.order}-${option.letter}`,
    letter: option.letter,
    text: option.text,
  }))

// A–F answer bank shared by 33–35. Numeric ids so TestQuestionGroup (which
// coerces option ids via Number()) matches selections.
const dataBank = test.dataGroup.bank.map((option, index) => ({
  id: index + 1,
  letter: option.letter,
  text: option.text,
}))

const dataGroupQuestions = test.questions
  .filter((question) => question.type === 'variant')
  .map((question) => ({
    id: question.order,
    type: 'Matching',
    text: question.text,
    matchingOptions: dataBank,
  }))

const dataOrderLabel = String(test.questions.find((q) => q.type === 'variant')?.order || '')

// Walk the questions and emit render rows, injecting a section header the first
// time each section appears and collapsing 33–35 into one grouped block.
const renderRows = computed(() => {
  const rows = []
  const seenSections = new Set()
  let matchingEmitted = false
  for (const question of test.questions) {
    if (!seenSections.has(question.section)) {
      seenSections.add(question.section)
      rows.push({ kind: 'section', id: `sec-${question.section}`, meta: sectionMeta.value.get(question.section) })
    }
    if (question.type === 'mcq') {
      rows.push({
        kind: 'block',
        id: `q-${question.order}`,
        block: {
          id: question.order,
          type: 'MultipleChoice',
          text: question.text,
          displayOrder: question.order,
          showOrder: true,
          options: mcqOptions(question),
        },
      })
    } else if (question.type === 'variant') {
      if (!matchingEmitted) {
        matchingEmitted = true
        rows.push({ kind: 'matching-group', id: 'data-group' })
      }
    } else if (question.type === 'numeric') {
      rows.push({
        kind: 'block',
        id: `q-${question.order}`,
        block: {
          id: question.order,
          type: 'FreeAnswer',
          text: question.text,
          displayOrder: question.order,
          showOrder: true,
        },
      })
    } else if (question.type === 'ai') {
      rows.push({ kind: 'ai-group', id: `q-${question.order}`, question })
    }
  }
  return rows
})

const totalQuestions = test.questions.length

const isAnswered = (question) => {
  if (question.type === 'mcq') return Boolean(answers[question.order])
  if (question.type === 'variant') return Boolean(matchingAnswers[question.order])
  if (question.type === 'numeric') return Boolean((freeAnswers[question.order] || '').trim())
  // ai (41–43) — answered only by uploading at least one image.
  return aiUploads[question.order]?.length > 0
}

const answeredCount = computed(() => test.questions.filter(isAnswered).length)

// ——— Update handlers (match the shared components' emit signatures) ——
const updateOption = (questionId, optionId) => {
  answers[questionId] = optionId
}
const updateMatchingAnswer = (questionId, optionId) => {
  matchingAnswers[questionId] = optionId ? Number(optionId) : ''
}
const updateFreeAnswer = (questionId, value) => {
  freeAnswers[questionId] = value
}
const resolveFreeAnswer = (questionId) =>
  typeof freeAnswers[questionId] === 'string' ? freeAnswers[questionId] : ''
const updateAiUploads = (order, uploads) => {
  aiUploads[order] = uploads
}

// ——— Timer ————————————————————————————————————————————————————————
const remainingSeconds = ref(test.durationMinutes * 60)
let timerId = null
onMounted(() => {
  const startedAt = Date.now()
  const total = test.durationMinutes * 60 * 1000
  timerId = window.setInterval(() => {
    const left = Math.max(total - (Date.now() - startedAt), 0)
    remainingSeconds.value = Math.ceil(left / 1000)
    if (left <= 0) {
      window.clearInterval(timerId)
      timerId = null
    }
  }, 1000)
})
onBeforeUnmount(() => {
  if (timerId) window.clearInterval(timerId)
})

// ——— Submit (demo summary) ————————————————————————————————————————
const showSubmitModal = ref(false)
const aiOrders = test.questions.filter((q) => q.type === 'ai').map((q) => q.order)
const drawingCount = computed(() =>
  aiOrders.reduce((total, order) => total + (aiUploads[order]?.length || 0), 0),
)
</script>

<template>
  <main class="font-sans-custom min-h-screen touch-manipulation bg-[#f5f3ef] pb-[190px] pt-2 text-black selection:bg-black selection:text-white sm:pb-[220px] sm:pt-6">
    <TestFloatingTools :remaining-seconds="remainingSeconds" />

    <!-- Exit the full-screen test (mirrors the real /test close button) -->
    <button
      type="button"
      @click="closeTest"
      aria-label="Testni yopish"
      class="fixed left-1/2 top-3 z-30 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-[#6b6760] text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition hover:bg-[#514d47] active:scale-95 sm:top-4 sm:h-12 sm:w-12"
    >
      <svg class="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>

    <div class="mx-auto max-w-[1280px] px-3 py-2 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
      <div class="mx-auto max-w-[1040px]">
        <div
          class="mx-auto min-h-[calc(100vh-11rem)] max-w-[920px] overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white px-4 pb-14 pt-5 shadow-[0_14px_40px_rgba(26,24,20,0.06)] ring-1 ring-[#ebe7e0] sm:min-h-[1056px] sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-16 lg:pb-20 lg:pt-12"
        >
          <!-- Header -->
          <div class="border-b border-[#e0ddd7] pb-5 sm:pb-8">
            <h1 class="font-serif-custom text-[2rem] font-normal leading-[0.96] tracking-[0.01em] text-[#1a1814] sm:text-[2.55rem] lg:text-4xl">
              {{ test.title }}
            </h1>
            <p class="font-mono-custom mt-3 text-[11px] font-normal uppercase tracking-[0.18em] text-[#8a857c] sm:text-sm">
              {{ test.durationMinutes }} {{ t('testPage.minutes') }} &bull; {{ totalQuestions }} {{ t('testPage.questionsLabel') }}
            </p>
          </div>

          <!-- Body -->
          <div class="space-y-8 pt-6 sm:space-y-10 sm:pt-8">
            <template v-for="row in renderRows" :key="row.id">
              <!-- Section divider — centered label with rules, like the exam's "A QISM" -->
              <div v-if="row.kind === 'section'" class="flex items-center gap-3 sm:gap-4">
                <div class="h-px flex-1 bg-[#e0ddd7]"></div>
                <p class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.22em] text-[#8a857c] sm:text-xs">
                  {{ row.meta.label }}
                </p>
                <div class="h-px flex-1 bg-[#e0ddd7]"></div>
              </div>

              <!-- Single question (MCQ 1–32, free answer 36–40) -->
              <TestQuestionBlock
                v-else-if="row.kind === 'block'"
                :question="row.block"
                :selected-answer="answers[row.block.id]"
                :free-answer-value="resolveFreeAnswer(row.block.id)"
                :image-alt="t('testPage.imageAlt')"
                :free-answer-label="t('testPage.freeAnswerLabel')"
                :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
                :open-math-label="t('testPage.openMathInput')"
                :close-math-label="t('testPage.closeMathInput')"
                @update-option="updateOption"
                @update-free-answer="updateFreeAnswer"
              />

              <!-- 33–35: shared A–F bank + "Tanlang" dropdown per question -->
              <TestQuestionGroup
                v-else-if="row.kind === 'matching-group'"
                :title="test.dataGroup.passage"
                :order-label="dataOrderLabel"
                :option-bank="dataBank"
                :questions="dataGroupQuestions"
                :selected-answers="matchingAnswers"
                image-alt=""
                :option-bank-label="t('testPage.optionBank')"
                :select-option-label="t('testPage.selectOption')"
                @update-matching-answer="updateMatchingAnswer"
              />

              <!-- 41–43: read-only stem + a/b/c prompts, answered ONLY by image upload -->
              <BiologyAiQuestion
                v-else-if="row.kind === 'ai-group'"
                :question="row.question"
                :uploads="aiUploads[row.question.order] || []"
                @update-uploads="updateAiUploads"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <TestBottomBar
      :answered-count="answeredCount"
      :total-questions="totalQuestions"
      :answered-label="t('testPage.answered')"
      :submit-label="t('testPage.finish')"
      @submit="showSubmitModal = true"
    />

    <NModal v-model:show="showSubmitModal">
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-5 text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f2f6ee] text-emerald-700">
              <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div class="space-y-1.5">
              <h4 class="text-xl font-bold tracking-tight text-black">Test yakunlandi</h4>
              <p class="text-sm text-[#6b6760]">
                {{ answeredCount }} / {{ totalQuestions }} topshiriqqa javob berdingiz.
              </p>
            </div>
            <div class="rounded-2xl border border-[#e6ede0] bg-[#f7faf4] p-4 text-left text-[13px] leading-relaxed text-[#4a5540]">
              <p class="flex items-center gap-2 font-semibold text-emerald-800">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
                </svg>
                41–43-topshiriqlar AI tomonidan tekshiriladi
              </p>
              <p class="mt-1.5">
                Jami {{ drawingCount }} ta chizma yuklandi. Tavsif matni va chizmalar sun'iy intellektga
                baholash uchun yuboriladi.
              </p>
            </div>
            <button
              type="button"
              @click="showSubmitModal = false"
              class="inline-flex h-11 w-full items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
            >
              Yopish
            </button>
          </div>
        </NCard>
      </div>
    </NModal>
  </main>
</template>
