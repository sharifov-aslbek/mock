<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const questions = [
  {
    id: 1,
    title: 'Reading Comprehension',
    correctAnswer: 'A',
    yourAnswer: 'A',
    attemptedAnswer: 'A',
    complexity: 'Easy',
    status: 'correct',
    answerOptions: [
      { letter: 'A', text: 'The passage suggests a positive outcome' },
      { letter: 'B', text: 'The author disagrees with the main point' },
      { letter: 'C', text: 'The evidence contradicts the conclusion' },
      { letter: 'D', text: 'The argument lacks sufficient support' }
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  {
    id: 2,
    title: 'Grammar Rules',
    correctAnswer: 'C',
    yourAnswer: 'B',
    attemptedAnswer: 'B',
    complexity: 'Medium',
    status: 'incorrect',
    answerOptions: [
      { letter: 'A', text: 'has been' },
      { letter: 'B', text: 'have been' },
      { letter: 'C', text: 'had been' },
      { letter: 'D', text: 'was' }
    ],
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },
  { id: 3, title: 'Vocabulary Context', correctAnswer: 'C', yourAnswer: '-', attemptedAnswer: '-', complexity: 'Hard', status: 'omitted', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 4, title: 'Sentence Structure', correctAnswer: 'A', yourAnswer: '-', attemptedAnswer: '-', complexity: 'Easy', status: 'omitted', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 5, title: 'Writing Analysis', correctAnswer: 'B', yourAnswer: 'B', attemptedAnswer: 'B', complexity: 'Medium', status: 'correct', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 6, title: 'Passage Interpretation', correctAnswer: 'D', yourAnswer: 'C', attemptedAnswer: 'C', complexity: 'Hard', status: 'incorrect', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 7, title: 'Algebra Basics', correctAnswer: 'B', yourAnswer: 'B', attemptedAnswer: 'B', complexity: 'Easy', status: 'correct', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 8, title: 'Geometry Problem', correctAnswer: 'A', yourAnswer: '-', attemptedAnswer: '-', complexity: 'Medium', status: 'omitted', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 9, title: 'Linear Equations', correctAnswer: 'C', yourAnswer: 'C', attemptedAnswer: 'C', complexity: 'Easy', status: 'correct', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 10, title: 'Word Problems', correctAnswer: 'D', yourAnswer: 'A', attemptedAnswer: 'A', complexity: 'Hard', status: 'incorrect', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 11, title: 'Fractions', correctAnswer: 'A', yourAnswer: 'A', attemptedAnswer: 'A', complexity: 'Easy', status: 'correct', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 12, title: 'Data Analysis', correctAnswer: 'B', yourAnswer: 'D', attemptedAnswer: 'D', complexity: 'Medium', status: 'incorrect', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 13, title: 'Critical Reading', correctAnswer: 'C', yourAnswer: 'C', attemptedAnswer: 'C', complexity: 'Medium', status: 'correct', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 14, title: 'Essay Analysis', correctAnswer: 'D', yourAnswer: '-', attemptedAnswer: '-', complexity: 'Hard', status: 'omitted', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 15, title: 'Statistics', correctAnswer: 'A', yourAnswer: 'B', attemptedAnswer: 'B', complexity: 'Hard', status: 'incorrect', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
]

const reviewingQuestionId = ref(null)
const reportingQuestionId = ref(null)
const showAnswer = ref(false)
const activeTab = ref('question')
const reportComment = ref('')
const reportFileName = ref('')
const reportSubmitted = ref(false)
const reportFileInput = ref(null)

let reportCloseTimeout = null
let previousBodyOverflow = ''

const filteredQuestions = computed(() => questions)
const totalQuestions = computed(() => filteredQuestions.value.length)
const correctCount = computed(() => filteredQuestions.value.filter((question) => question.status === 'correct').length)
const incorrectCount = computed(() => filteredQuestions.value.filter((question) => question.status === 'incorrect').length)
const omittedCount = computed(() => filteredQuestions.value.filter((question) => question.status === 'omitted').length)
const scorePercent = computed(() => Math.round((correctCount.value / totalQuestions.value) * 100))

const scoreRingRadius = 42
const scoreRingCircumference = 2 * Math.PI * scoreRingRadius
const scoreRingOffset = computed(() => scoreRingCircumference - (scorePercent.value / 100) * scoreRingCircumference)

const currentQuestion = computed(() =>
  filteredQuestions.value.find((question) => question.id === reviewingQuestionId.value) ?? null
)

const isAnyModalOpen = computed(() => reviewingQuestionId.value !== null || reportingQuestionId.value !== null)

const statCards = computed(() => [
  {
    label: "To'g'ri Javoblar",
    value: correctCount.value,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50',
    percentLabel: `${Math.round((correctCount.value / totalQuestions.value) * 100)}% to'g'ri`,
    icon: 'check'
  },
  {
    label: "Noto'g'ri Javoblar",
    value: incorrectCount.value,
    colorClass: 'text-red-600',
    bgClass: 'bg-rose-50',
    percentLabel: `${Math.round((incorrectCount.value / totalQuestions.value) * 100)}% noto'g'ri`,
    icon: 'cross'
  }
])

const progressLegend = computed(() => [
  { colorClass: 'bg-green-600', label: `${correctCount.value} to'g'ri` },
  { colorClass: 'bg-red-600', label: `${incorrectCount.value} xato` },
  { colorClass: 'bg-gray-300', label: `${omittedCount.value} o'tkazilgan` }
])

const answerExplanation = [
  "To'g'ri javob: 2 - ln(2)",
  "Bo'yalgan soha to'g'ri to'rtburchak va egri chiziq ostidagi soha orasidagi farqdir.",
  "To'g'ri to'rtburchakning yuzi: 2 x 2 = 4",
  'f(x) = 2/x funksiyasi ostidagi yuza: integral 1 dan 2 gacha (2/x)dx = 2ln(2)',
  "Bo'yalgan yuza = 4 - 2ln(2) ~= 1.61"
]

watch(isAnyModalOpen, (isOpen) => {
  if (typeof document === 'undefined') {
    return
  }

  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }

  document.body.style.overflow = previousBodyOverflow
})

onBeforeUnmount(() => {
  if (reportCloseTimeout !== null) {
    window.clearTimeout(reportCloseTimeout)
  }

  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow
  }
})

function openReview(questionId) {
  reviewingQuestionId.value = questionId
  showAnswer.value = false
  activeTab.value = 'question'
}

function closeReview() {
  reviewingQuestionId.value = null
  showAnswer.value = false
  activeTab.value = 'question'
}

function showPreviousQuestion() {
  if (reviewingQuestionId.value > 1) {
    reviewingQuestionId.value -= 1
  }
}

function showNextQuestion() {
  if (reviewingQuestionId.value < filteredQuestions.value.length) {
    reviewingQuestionId.value += 1
  }
}

function openReport(questionId) {
  clearReportTimeout()
  reportingQuestionId.value = questionId
  reportComment.value = ''
  reportFileName.value = ''
  reportSubmitted.value = false

  if (reportFileInput.value) {
    reportFileInput.value.value = ''
  }
}

function closeReport() {
  clearReportTimeout()
  reportingQuestionId.value = null
  reportComment.value = ''
  reportFileName.value = ''
  reportSubmitted.value = false

  if (reportFileInput.value) {
    reportFileInput.value.value = ''
  }
}

function clearReportTimeout() {
  if (reportCloseTimeout !== null) {
    window.clearTimeout(reportCloseTimeout)
    reportCloseTimeout = null
  }
}

function submitReport() {
  if (!reportComment.value.trim()) {
    return
  }

  reportSubmitted.value = true
  clearReportTimeout()
  reportCloseTimeout = window.setTimeout(() => {
    closeReport()
  }, 1800)
}

function handleReportFileChange(event) {
  const file = event.target.files?.[0]
  reportFileName.value = file ? file.name : ''
}

function handleShowAnswerChange(event) {
  showAnswer.value = event.target.checked

  if (showAnswer.value) {
    activeTab.value = 'answer'
  }
}

function answerBadgeClass(status) {
  if (status === 'correct') {
    return 'bg-green-50 text-green-600 font-semibold'
  }

  if (status === 'incorrect') {
    return 'bg-rose-50 text-red-600 font-semibold'
  }

  return 'bg-gray-100 text-gray-400 italic'
}

function answerBadgeLabel(status, answer) {
  return status === 'omitted' ? 'Omitted' : answer
}

function complexityBadgeClass(complexity) {
  if (complexity === 'Easy') {
    return 'bg-green-50 text-green-600'
  }

  if (complexity === 'Medium') {
    return 'bg-amber-50 text-amber-500'
  }

  return 'bg-rose-50 text-red-600'
}

function statusDotClass(status) {
  if (status === 'correct') {
    return 'bg-green-600'
  }

  if (status === 'incorrect') {
    return 'bg-red-600'
  }

  return 'bg-gray-300'
}

function answerOptionClass(option) {
  if (!currentQuestion.value || !showAnswer.value) {
    return 'border border-gray-200 bg-white'
  }

  const isCorrect = option.letter === currentQuestion.value.correctAnswer
  const isSelected = option.letter === currentQuestion.value.yourAnswer && currentQuestion.value.yourAnswer !== '-'

  if (isCorrect) {
    return 'border-2 border-green-600 bg-green-50'
  }

  if (isSelected) {
    return 'border-2 border-red-600 bg-rose-50'
  }

  return 'border border-gray-200 bg-white'
}

function answerFeedbackClass(status) {
  return status === 'correct' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-red-600'
}

function answerFeedbackText(question) {
  if (question.status === 'correct') {
    return `To'g'ri! Javob: ${question.correctAnswer}`
  }

  if (question.status === 'omitted') {
    return `Siz bu savolni o'tkazib yubordingiz. To'g'ri javob: ${question.correctAnswer}`
  }

  return `Noto'g'ri. To'g'ri javob: ${question.correctAnswer}`
}
</script>

<template>
  <main class="explanation-page min-h-screen w-full bg-[#f7f7f7] font-sans-custom">
    <div class="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div class="mb-4 flex items-center gap-1.5 text-xs text-gray-400 sm:mb-6">
        <span class="cursor-default transition-colors hover:text-gray-500">Result</span>
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-gray-600">Natijalar Tahlili</span>
      </div>

      <div class="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-[clamp(22px,5vw,30px)] font-extrabold leading-[1.15] tracking-[-0.05em] text-[#0a0a0a]">
            Natijalar Tahlili
          </h1>
          <p class="mt-1.5 text-sm text-gray-400">SAT Mock - 2024 - Modul 1 va 2</p>
        </div>

        <button
          type="button"
          class="inline-flex self-start rounded-full bg-[#0a0a0a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
        >
          <span class="mr-2 inline-flex h-4 w-4 items-center justify-center">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          Sertifikatni ko'rish
        </button>
      </div>

      <div class="mb-6 flex flex-col gap-4 sm:flex-row">
        <div class="flex min-w-0 flex-row items-center justify-center gap-4 rounded-2xl border border-[#ebebeb] bg-white px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:flex-col sm:gap-0">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" :r="scoreRingRadius" fill="none" stroke="#f0f0f0" stroke-width="7" />
            <circle
              cx="55"
              cy="55"
              :r="scoreRingRadius"
              fill="none"
              stroke="#0a0a0a"
              stroke-width="7"
              :stroke-dasharray="scoreRingCircumference"
              :stroke-dashoffset="scoreRingOffset"
              stroke-linecap="round"
              transform="rotate(-90 55 55)"
              style="transition: stroke-dashoffset 0.6s ease"
            />
            <text x="55" y="51" text-anchor="middle" fill="#0a0a0a" font-size="18" font-weight="800">
              {{ scorePercent }}%
            </text>
            <text x="55" y="67" text-anchor="middle" fill="#aaaaaa" font-size="9.5" font-weight="500">
              Ball
            </text>
          </svg>

          <div class="text-center sm:mt-2">
            <span class="text-[11px] font-medium uppercase tracking-[0.3px] text-gray-400">Umumiy Ball</span>
            <p class="mt-1 text-sm font-semibold text-[#0a0a0a] sm:hidden">
              {{ correctCount }}/{{ totalQuestions }} savol to'g'ri
            </p>
          </div>
        </div>

        <div class="flex min-w-0 flex-1 flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="card in statCards"
              :key="card.label"
              class="flex flex-col justify-between rounded-2xl border border-[#ebebeb] bg-white px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:px-5 sm:py-5"
            >
              <div class="mb-2 flex items-start justify-between sm:mb-3">
                <span class="text-[11px] font-medium leading-[1.3] text-gray-400">{{ card.label }}</span>
                <span
                  class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7"
                  :class="[card.bgClass, card.colorClass]"
                >
                  <svg
                    v-if="card.icon === 'check'"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <svg
                    v-else
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M18 6 6 18" stroke-linecap="round" />
                    <path d="m6 6 12 12" stroke-linecap="round" />
                  </svg>
                </span>
              </div>

              <div>
                <span class="text-[clamp(26px,6vw,36px)] font-extrabold leading-none tracking-[-0.08em] text-[#0a0a0a]">
                  {{ card.value }}
                </span>
                <p class="mt-1 text-[10px] text-gray-300">{{ card.percentLabel }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-[#ebebeb] bg-white px-4 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] sm:px-5">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-xs font-medium text-gray-400">Jami Savollar</span>
              <span class="text-sm font-bold text-[#0a0a0a]">{{ totalQuestions }} ta</span>
            </div>

            <div class="flex h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
              <div :style="{ width: `${(correctCount / totalQuestions) * 100}%` }" class="bg-green-600" />
              <div :style="{ width: `${(incorrectCount / totalQuestions) * 100}%` }" class="bg-red-600" />
              <div :style="{ width: `${(omittedCount / totalQuestions) * 100}%` }" class="bg-gray-200" />
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-3">
              <span v-for="item in progressLegend" :key="item.label" class="flex items-center gap-1.5">
                <span class="inline-block h-2 w-2 shrink-0 rounded-full" :class="item.colorClass" />
                <span class="text-[11px] text-gray-400">{{ item.label }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <section class="overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div class="border-b border-[#f3f3f3] px-4 py-4 sm:px-6 sm:py-5">
          <h2 class="text-base font-bold tracking-[-0.02em] text-[#0a0a0a]">Batafsil Ko'rib Chiqish</h2>
          <p class="mt-0.5 text-xs text-gray-300">{{ filteredQuestions.length }} ta savol ko'rsatilmoqda</p>
        </div>

        <div class="explanation-scrollbar hidden overflow-x-auto md:block">
          <table class="w-full">
            <thead>
              <tr class="border-b border-[#f0f0f0] bg-[#fafafa]">
                <th
                  v-for="header in ['Questions', 'Title', 'Correct Answer', 'Your Answer', 'Complexity', 'Actions']"
                  :key="header"
                  class="px-6 py-3.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.6px] text-gray-300"
                  :class="{ 'text-center': header === 'Actions' }"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in filteredQuestions"
                :key="row.id"
                class="transition-colors hover:bg-[#fafafa]"
                :class="{ 'border-b border-[#f5f5f5]': index < filteredQuestions.length - 1 }"
              >
                <td class="px-6 py-4">
                  <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-xs font-semibold text-gray-500">
                    {{ row.id }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ row.title }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-semibold text-[#0a0a0a]">
                    {{ row.correctAnswer }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex min-w-[72px] items-center justify-center rounded-full px-3 py-1 text-xs"
                    :class="answerBadgeClass(row.status)"
                  >
                    {{ answerBadgeLabel(row.status, row.yourAnswer) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" :class="complexityBadgeClass(row.complexity)">
                    {{ row.complexity }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-full border border-[#ebebeb] px-3 py-1.5 text-xs text-gray-300 transition hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
                      @click="openReview(row.id)"
                    >
                      <svg class="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path
                          d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Review</span>
                    </button>

                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ebebeb] text-gray-300 transition hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
                      @click="openReport(row.id)"
                    >
                      <svg class="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M4 4v16" stroke-linecap="round" />
                        <path d="M4 5h10l-1.5 3L14 11H4" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-3 p-4 md:hidden">
          <article
            v-for="row in filteredQuestions"
            :key="row.id"
            class="rounded-2xl border border-[#ebebeb] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          >
            <div class="mb-3 flex items-start gap-3">
              <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-xs font-semibold text-gray-500">
                {{ row.id }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-semibold leading-[1.4] text-[#222222]">{{ row.title }}</p>
              </div>
              <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="statusDotClass(row.status)" />
            </div>

            <div class="mb-3 flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-gray-300">To'g'ri:</span>
                <span class="inline-flex rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-bold text-[#0a0a0a]">
                  {{ row.correctAnswer }}
                </span>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-[11px] text-gray-300">Sizniki:</span>
                <span class="inline-flex min-w-[68px] items-center justify-center rounded-full px-2.5 py-0.5 text-[11px]" :class="answerBadgeClass(row.status)">
                  {{ answerBadgeLabel(row.status, row.yourAnswer) }}
                </span>
              </div>

              <span class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" :class="complexityBadgeClass(row.complexity)">
                {{ row.complexity }}
              </span>
            </div>

            <div class="flex items-center gap-2 border-t border-[#f5f5f5] pt-3">
              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0a0a0a] py-2 text-xs font-semibold text-white transition hover:bg-[#1a1a1a]"
                @click="openReview(row.id)"
              >
                <svg class="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Ko'rib chiqish
              </button>

              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ebebeb] bg-[#f5f5f5] text-gray-500 transition hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
                @click="openReport(row.id)"
              >
                <svg class="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4v16" stroke-linecap="round" />
                  <path d="M4 5h10l-1.5 3L14 11H4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </article>
        </div>

        <div v-if="filteredQuestions.length === 0" class="flex items-center justify-center py-16">
          <p class="text-sm text-gray-300">Ma'lumot topilmadi</p>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div
        v-if="currentQuestion"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center"
        @click.self="closeReview"
      >
        <div
          class="review-modal-inner relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-white sm:mx-4 sm:max-w-5xl"
        >
          <div class="shrink-0 border-b border-[#ebebeb] px-4 py-4 sm:px-8 sm:py-5">
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0 flex-1 pr-4">
                <p class="mb-0.5 text-[11px] font-medium uppercase tracking-[0.5px] text-gray-400">
                  SAT Amaliyot - 17 Aprel, 2026
                </p>
                <h2 class="truncate text-[clamp(14px,4vw,18px)] font-bold tracking-[-0.02em] text-[#0a0a0a]">
                  Savol {{ currentQuestion.id }} - {{ currentQuestion.title }}
                </h2>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <span class="hidden rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-gray-500 sm:inline-flex">
                  {{ currentQuestion.id }} / {{ totalQuestions }}
                </span>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] text-gray-500 transition hover:bg-[#0a0a0a] hover:text-white"
                  @click="closeReview"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18" stroke-linecap="round" />
                    <path d="m6 6 12 12" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="mt-3 flex gap-2 sm:hidden">
              <button
                type="button"
                class="flex-1 rounded-xl py-2 text-sm font-semibold transition"
                :class="activeTab === 'question' ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-gray-500'"
                @click="activeTab = 'question'"
              >
                Savol
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl py-2 text-sm font-semibold transition"
                :class="activeTab === 'answer' ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-gray-500'"
                @click="activeTab = 'answer'"
              >
                Javob
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-hidden">
            <div class="hidden h-full grid-cols-2 sm:grid" style="height: calc(92vh - 140px)">
              <div class="review-scrollbar overflow-y-auto border-r border-[#ebebeb] bg-white px-8 py-6">
                <div>
                  <h3 class="mb-3.5 text-[15px] font-bold text-[#0a0a0a]">Matematika: Savol {{ currentQuestion.id }}</h3>
                  <p class="mb-5 text-sm leading-[1.7] text-gray-600">
                    Rasmda f(x) = 2/x, y1 = 0, y2 = 2, x1 = 0 va x2 = 2 funksiyani grafiklari tasvirlangan.
                  </p>

                  <div class="flex items-center justify-center rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 sm:p-6">
                    <svg width="100%" viewBox="0 0 500 380" style="max-width: 460px">
                      <defs>
                        <pattern id="grid2-desktop" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" stroke-width="1" />
                        </pattern>
                      </defs>
                      <rect width="500" height="380" fill="url(#grid2-desktop)" />
                      <line x1="50" y1="190" x2="450" y2="190" stroke="#0a0a0a" stroke-width="2" />
                      <line x1="250" y1="40" x2="250" y2="340" stroke="#0a0a0a" stroke-width="2" />
                      <text x="458" y="195" font-size="18" font-style="italic" fill="#0a0a0a">x</text>
                      <text x="255" y="36" font-size="18" font-style="italic" fill="#0a0a0a">y</text>
                      <path
                        d="M 250 95 L 350 95 L 350 145 Q 340 150 330 155 Q 320 160 310 167 Q 300 173 290 179 Q 270 186 260 190 L 250 190 Z"
                        fill="#d1d5db"
                        opacity="0.5"
                      />
                      <path
                        d="M 260 184 Q 270 175 280 166 Q 290 157 300 150 Q 310 143 320 137 Q 330 132 340 128 Q 350 124 360 121 Q 380 116 410 112"
                        stroke="#0a0a0a"
                        stroke-width="2.5"
                        fill="none"
                      />
                      <line x1="100" y1="95" x2="450" y2="95" stroke="#0a0a0a" stroke-width="2" />
                      <text x="78" y="90" font-size="16" fill="#0a0a0a">y2=2</text>
                      <line x1="350" y1="70" x2="350" y2="290" stroke="#0a0a0a" stroke-width="2" />
                      <text x="356" y="308" font-size="16" fill="#0a0a0a">x2=2</text>
                      <text x="370" y="138" font-size="15" fill="#0a0a0a">f(x)=2/x</text>
                    </svg>
                  </div>

                  <p class="mt-5 text-sm leading-[1.7] text-gray-600">Bo'yalgan sohaning yuzini toping.</p>
                </div>
              </div>

              <div class="review-scrollbar overflow-y-auto bg-[#fafafa] px-8 py-6">
                <div>
                  <h3 class="mb-4 text-[15px] font-bold text-[#0a0a0a]">Javob variantlari</h3>

                  <div v-if="currentQuestion.answerOptions?.length" class="mb-5">
                    <div
                      v-for="option in currentQuestion.answerOptions"
                      :key="option.letter"
                      class="mb-2 rounded-xl px-4 py-3 text-[13px] leading-[1.6] text-[#0a0a0a]"
                      :class="answerOptionClass(option)"
                    >
                      <span class="font-bold">{{ option.letter }}.</span>
                      {{ option.text }}
                      <span
                        v-if="showAnswer && option.letter === currentQuestion.correctAnswer"
                        class="ml-2 text-xs font-semibold text-green-600"
                      >
                        To'g'ri
                      </span>
                    </div>
                  </div>

                  <div v-else class="mb-5">
                    <span class="text-[13px] text-gray-500">Sizning javobingiz:</span>
                    <div class="mt-2">
                      <span v-if="currentQuestion.status === 'omitted'" class="text-sm italic text-gray-400">
                        - (O'tkazilgan)
                      </span>
                      <span v-else class="text-lg font-bold text-[#0a0a0a]">
                        {{ currentQuestion.yourAnswer }}
                      </span>
                    </div>
                  </div>

                  <template v-if="showAnswer">
                    <div
                      class="mb-5 rounded-xl px-4 py-3 text-[13px] font-semibold"
                      :class="answerFeedbackClass(currentQuestion.status)"
                    >
                      {{ answerFeedbackText(currentQuestion) }}
                    </div>

                    <div>
                      <h4 class="mb-2.5 text-sm font-bold text-[#0a0a0a]">Tushuntirish</h4>
                      <p
                        v-for="line in answerExplanation"
                        :key="line"
                        class="mb-2 text-[13px] leading-[1.7] text-gray-600"
                      >
                        {{ line }}
                      </p>

                      <div v-if="currentQuestion.videoUrl" class="mt-5">
                        <h4 class="mb-2.5 text-sm font-bold text-[#0a0a0a]">Video Tushuntirish</h4>
                        <div class="overflow-hidden rounded-xl border border-gray-200 bg-black">
                          <video controls class="block h-auto w-full">
                            <source :src="currentQuestion.videoUrl" type="video/mp4" />
                          </video>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="review-scrollbar overflow-y-auto sm:hidden" style="height: calc(92vh - 175px)">
              <div v-if="activeTab === 'question'" class="px-4 py-5">
                <div>
                  <h3 class="mb-3.5 text-[15px] font-bold text-[#0a0a0a]">Matematika: Savol {{ currentQuestion.id }}</h3>
                  <p class="mb-5 text-sm leading-[1.7] text-gray-600">
                    Rasmda f(x) = 2/x, y1 = 0, y2 = 2, x1 = 0 va x2 = 2 funksiyani grafiklari tasvirlangan.
                  </p>

                  <div class="flex items-center justify-center rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4">
                    <svg width="100%" viewBox="0 0 500 380" style="max-width: 460px">
                      <defs>
                        <pattern id="grid2-mobile" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" stroke-width="1" />
                        </pattern>
                      </defs>
                      <rect width="500" height="380" fill="url(#grid2-mobile)" />
                      <line x1="50" y1="190" x2="450" y2="190" stroke="#0a0a0a" stroke-width="2" />
                      <line x1="250" y1="40" x2="250" y2="340" stroke="#0a0a0a" stroke-width="2" />
                      <text x="458" y="195" font-size="18" font-style="italic" fill="#0a0a0a">x</text>
                      <text x="255" y="36" font-size="18" font-style="italic" fill="#0a0a0a">y</text>
                      <path
                        d="M 250 95 L 350 95 L 350 145 Q 340 150 330 155 Q 320 160 310 167 Q 300 173 290 179 Q 270 186 260 190 L 250 190 Z"
                        fill="#d1d5db"
                        opacity="0.5"
                      />
                      <path
                        d="M 260 184 Q 270 175 280 166 Q 290 157 300 150 Q 310 143 320 137 Q 330 132 340 128 Q 350 124 360 121 Q 380 116 410 112"
                        stroke="#0a0a0a"
                        stroke-width="2.5"
                        fill="none"
                      />
                      <line x1="100" y1="95" x2="450" y2="95" stroke="#0a0a0a" stroke-width="2" />
                      <text x="78" y="90" font-size="16" fill="#0a0a0a">y2=2</text>
                      <line x1="350" y1="70" x2="350" y2="290" stroke="#0a0a0a" stroke-width="2" />
                      <text x="356" y="308" font-size="16" fill="#0a0a0a">x2=2</text>
                      <text x="370" y="138" font-size="15" fill="#0a0a0a">f(x)=2/x</text>
                    </svg>
                  </div>

                  <p class="mt-5 text-sm leading-[1.7] text-gray-600">Bo'yalgan sohaning yuzini toping.</p>
                </div>
              </div>

              <div v-else class="bg-[#fafafa] px-4 py-5">
                <div>
                  <h3 class="mb-4 text-[15px] font-bold text-[#0a0a0a]">Javob variantlari</h3>

                  <div v-if="currentQuestion.answerOptions?.length" class="mb-5">
                    <div
                      v-for="option in currentQuestion.answerOptions"
                      :key="option.letter"
                      class="mb-2 rounded-xl px-4 py-3 text-[13px] leading-[1.6] text-[#0a0a0a]"
                      :class="answerOptionClass(option)"
                    >
                      <span class="font-bold">{{ option.letter }}.</span>
                      {{ option.text }}
                      <span
                        v-if="showAnswer && option.letter === currentQuestion.correctAnswer"
                        class="ml-2 text-xs font-semibold text-green-600"
                      >
                        To'g'ri
                      </span>
                    </div>
                  </div>

                  <div v-else class="mb-5">
                    <span class="text-[13px] text-gray-500">Sizning javobingiz:</span>
                    <div class="mt-2">
                      <span v-if="currentQuestion.status === 'omitted'" class="text-sm italic text-gray-400">
                        - (O'tkazilgan)
                      </span>
                      <span v-else class="text-lg font-bold text-[#0a0a0a]">
                        {{ currentQuestion.yourAnswer }}
                      </span>
                    </div>
                  </div>

                  <template v-if="showAnswer">
                    <div
                      class="mb-5 rounded-xl px-4 py-3 text-[13px] font-semibold"
                      :class="answerFeedbackClass(currentQuestion.status)"
                    >
                      {{ answerFeedbackText(currentQuestion) }}
                    </div>

                    <div>
                      <h4 class="mb-2.5 text-sm font-bold text-[#0a0a0a]">Tushuntirish</h4>
                      <p
                        v-for="line in answerExplanation"
                        :key="line"
                        class="mb-2 text-[13px] leading-[1.7] text-gray-600"
                      >
                        {{ line }}
                      </p>

                      <div v-if="currentQuestion.videoUrl" class="mt-5">
                        <h4 class="mb-2.5 text-sm font-bold text-[#0a0a0a]">Video Tushuntirish</h4>
                        <div class="overflow-hidden rounded-xl border border-gray-200 bg-black">
                          <video controls class="block h-auto w-full">
                            <source :src="currentQuestion.videoUrl" type="video/mp4" />
                          </video>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div class="shrink-0 border-t border-[#ebebeb] bg-white px-4 py-4 sm:px-8">
            <div class="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <label class="flex cursor-pointer items-center gap-3">
                <div class="relative h-5 w-5 shrink-0">
                  <input
                    type="checkbox"
                    class="review-checkbox h-5 w-5 cursor-pointer"
                    :checked="showAnswer"
                    @change="handleShowAnswerChange"
                  />
                  <svg
                    v-if="showAnswer"
                    class="pointer-events-none absolute inset-0 h-5 w-5 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M5 10L8 13L15 6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <span class="text-sm text-gray-600">To'g'ri javobni ko'rsatish</span>
              </label>

              <div class="flex items-center gap-2">
                <span class="mr-auto text-xs font-medium text-gray-400 sm:hidden">
                  {{ currentQuestion.id }}/{{ totalQuestions }}
                </span>

                <button
                  type="button"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition"
                  :class="currentQuestion.id === 1 ? 'cursor-not-allowed bg-[#f0f0f0] text-gray-300' : 'bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]'"
                  :disabled="currentQuestion.id === 1"
                  @click="showPreviousQuestion"
                >
                  <svg class="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span>Oldingi</span>
                </button>

                <button
                  type="button"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition"
                  :class="currentQuestion.id === totalQuestions ? 'cursor-not-allowed bg-[#f0f0f0] text-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                  :disabled="currentQuestion.id === totalQuestions"
                  @click="showNextQuestion"
                >
                  <span>Keyingi</span>
                  <svg class="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="reportingQuestionId !== null"
        class="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center"
        @click.self="closeReport"
      >
        <div class="report-modal-inner relative max-h-[90vh] w-full overflow-y-auto bg-white px-5 pb-8 pt-7 sm:mx-4 sm:max-w-lg">
          <div class="mb-5 flex justify-center sm:hidden">
            <div class="h-1 w-9 rounded-full bg-gray-200" />
          </div>

          <button
            type="button"
            class="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] text-gray-500 transition hover:bg-[#0a0a0a] hover:text-white"
            @click="closeReport"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18" stroke-linecap="round" />
              <path d="m6 6 12 12" stroke-linecap="round" />
            </svg>
          </button>

          <div v-if="reportSubmitted" class="flex flex-col items-center justify-center py-10 text-center">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25">
                <path d="M9 12.75 11.25 15 15 9.75" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M21 12a9 9 0 1 1-4.393-7.72"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h2 class="mb-2 text-lg font-bold text-[#0a0a0a]">Xabar yuborildi!</h2>
            <p class="text-sm text-gray-400">Muammoingiz ko'rib chiqiladi.</p>
          </div>

          <template v-else>
            <h2 class="mb-1 text-xl font-bold text-[#0a0a0a]">Muammo haqida xabar bering</h2>
            <p class="mb-6 text-sm text-gray-400">Modul 1 - Savol {{ reportingQuestionId }}</p>

            <div class="mb-4">
              <label class="mb-2 block text-sm font-semibold text-gray-600">Izoh</label>
              <textarea
                v-model="reportComment"
                rows="4"
                placeholder="Muammoni tasvirlab bering..."
                class="w-full resize-none rounded-xl border-[1.5px] border-gray-200 bg-white px-3.5 py-3 text-sm leading-[1.6] text-[#0a0a0a] outline-none transition focus:border-[#0a0a0a]"
              />
            </div>

            <div class="mb-6">
              <label
                for="report-file"
                class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-[#fafafa] px-5 py-6 text-center transition hover:bg-[#f5f5f5]"
                :class="reportFileName ? 'border-[#0a0a0a]' : 'border-gray-300 hover:border-gray-400'"
              >
                <svg
                  class="mb-1.5 h-[18px] w-[18px]"
                  :class="reportFileName ? 'text-[#0a0a0a]' : 'text-gray-400'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 16V4" stroke-linecap="round" />
                  <path d="m7 9 5-5 5 5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M4 16.5A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 0-7H16" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="text-sm" :class="reportFileName ? 'font-semibold text-[#0a0a0a]' : 'text-gray-400'">
                  {{ reportFileName || 'Fayl yuklash uchun bosing' }}
                </span>
                <span v-if="!reportFileName" class="mt-1 text-[11px] text-gray-300">PNG, JPG, PDF</span>
              </label>
              <input
                id="report-file"
                ref="reportFileInput"
                type="file"
                class="hidden"
                @change="handleReportFileChange"
              />
            </div>

            <button
              type="button"
              class="w-full rounded-full py-3 text-sm font-bold transition"
              :class="reportComment.trim() ? 'bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]' : 'cursor-not-allowed bg-[#f0f0f0] text-gray-300'"
              :disabled="!reportComment.trim()"
              @click="submitReport"
            >
              Yuborish
            </button>
          </template>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.explanation-page {
  background-image: radial-gradient(circle, #d8d8d8 1px, transparent 1px);
  background-size: 24px 24px;
}

.explanation-scrollbar::-webkit-scrollbar,
.review-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.explanation-scrollbar::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.review-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.explanation-scrollbar::-webkit-scrollbar-thumb,
.review-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: #d1d5db;
}

.explanation-scrollbar::-webkit-scrollbar-thumb:hover,
.review-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.review-checkbox {
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  outline: none;
}

.review-checkbox:checked {
  border-color: #4f46e5;
  background: #eef2ff;
}

.review-modal-inner,
.report-modal-inner {
  border-radius: 20px 20px 0 0;
}

@media (min-width: 640px) {
  .review-modal-inner,
  .report-modal-inner {
    border-radius: 20px;
  }
}
</style>
