<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useTestStore } from '@/stores/test'
import { getTestApiBaseUrl } from '@/utils/api'
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'

const route = useRoute()
const { locale } = useI18n()
const testStore = useTestStore()

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const LANGUAGE_BY_LOCALE = { uz: 'Uzbek', ru: 'Russian' }
const GROUP_SUBORDER_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

const reviewingQuestionId = ref(null)
const reportingQuestionId = ref(null)
const showAnswer = ref(false)
const activeTab = ref('question')
const reportComment = ref('')
const reportFileName = ref('')
const reportSubmitted = ref(false)
const reportFileInput = ref(null)
const isCertificateModalOpen = ref(false)

const isLoadingTest = ref(false)
const testLoadError = ref('')
const isLoadingExplanation = ref(false)
const explanationError = ref('')
const currentExplanation = ref(null)

let reportCloseTimeout = null
let previousBodyOverflow = ''

const apiBaseUrl = getTestApiBaseUrl()
const certificatePreviewUrl = 'https://extraordinary-lolly-890df5.netlify.app/'

const apiOrigin = (() => {
  try {
    return apiBaseUrl ? new URL(apiBaseUrl).origin : ''
  } catch {
    return ''
  }
})()

const buildAssetUrl = (imagePath) => {
  if (!imagePath) {
    return null
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }

  if (!apiOrigin) {
    return imagePath
  }

  return `${apiOrigin}/${String(imagePath).replace(/^\/+/, '')}`
}

const requestedTestId = computed(() => {
  const queryValue = route.query.testId
  const value = Array.isArray(queryValue) ? queryValue[0] : queryValue

  return value ? String(value) : ''
})

const getLocalizedTranslation = (entity) => {
  const translations = Array.isArray(entity?.translations) ? entity.translations : []

  if (!translations.length) {
    return null
  }

  const preferredLanguage = LANGUAGE_BY_LOCALE[locale.value] || LANGUAGE_BY_LOCALE.uz

  return (
    translations.find((item) => item?.language === preferredLanguage) ||
    translations.find((item) => item?.language === LANGUAGE_BY_LOCALE.uz) ||
    translations[0] ||
    null
  )
}

const getEntityText = (entity) => {
  const translation = getLocalizedTranslation(entity)
  return translation?.text || entity?.text || entity?.title || ''
}

const stripHtml = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  if (typeof document === 'undefined') {
    return value.replace(/<[^>]+>/g, '').trim()
  }

  const container = document.createElement('div')
  container.innerHTML = value
  return (container.textContent || '').replace(/\s+/g, ' ').trim()
}

const complexityFromScore = (score) => {
  const numericScore = Number(score) || 0

  if (numericScore < 1.5) {
    return 'Easy'
  }

  if (numericScore < 2) {
    return 'Medium'
  }

  return 'Hard'
}

const userAnswersByQuestionId = computed(() => {
  const map = new Map()
  const userAnswers = testStore.lastSubmission?.userAnswers

  if (!Array.isArray(userAnswers)) {
    return map
  }

  for (const userAnswer of userAnswers) {
    const questionId = Number(userAnswer?.questionId)

    if (questionId) {
      map.set(questionId, userAnswer)
    }
  }

  return map
})

const filteredQuestions = computed(() => {
  const apiQuestions = testStore.currentTest?.questions

  if (!Array.isArray(apiQuestions)) {
    return []
  }

  const questionGroupsById = new Map(
    (testStore.currentTest?.questionGroups || []).map((group) => [Number(group.id), group]),
  )
  const groupedQuestionCounts = apiQuestions.reduce((counts, question) => {
    const groupId = Number(question?.questionGroupId || 0)

    if (!groupId) {
      return counts
    }

    counts.set(groupId, Number(counts.get(groupId) || 0) + 1)
    return counts
  }, new Map())
  const groupBaseLabels = new Map()
  const groupQuestionIndexes = new Map()
  const shownGroupHeaders = new Set()
  let displayCounter = 0

  return apiQuestions.map((apiQuestion) => {
    const groupId = Number(apiQuestion?.questionGroupId || 0)
    const group = groupId ? questionGroupsById.get(groupId) : null
    const isGroupedQuestion = Boolean(group && Number(groupedQuestionCounts.get(groupId) || 0) > 1)

    if (isGroupedQuestion && !groupBaseLabels.has(groupId)) {
      displayCounter += 1
      groupBaseLabels.set(groupId, String(displayCounter))
    } else if (!isGroupedQuestion) {
      displayCounter += 1
    }

    const groupQuestionIndex = Number(groupQuestionIndexes.get(groupId) || 0)
    const groupSubLabel = GROUP_SUBORDER_LETTERS[groupQuestionIndex] || String(groupQuestionIndex + 1)
    const baseDisplayLabel = isGroupedQuestion
      ? groupBaseLabels.get(groupId)
      : String(displayCounter)
    const displayLabel = isGroupedQuestion ? `${baseDisplayLabel}.${groupSubLabel}` : baseDisplayLabel
    const showGroupHeader = isGroupedQuestion && !shownGroupHeaders.has(groupId)

    if (isGroupedQuestion) {
      groupQuestionIndexes.set(groupId, groupQuestionIndex + 1)
      shownGroupHeaders.add(groupId)
    }

    const options = Array.isArray(apiQuestion.options)
      ? apiQuestion.options.map((option, optionIndex) => ({
          ...option,
          letter: option.letter || OPTION_LETTERS[optionIndex] || String(optionIndex + 1),
        }))
      : []
    const correctOption = options.find((option) => option.isCorrect)
    const userAnswer = userAnswersByQuestionId.value.get(Number(apiQuestion.id))
    const selectedOptionId = userAnswer?.selectedOptionId || 0
    const selectedOption = selectedOptionId
      ? options.find((option) => Number(option.id) === Number(selectedOptionId))
      : null
    const textAnswer = typeof userAnswer?.textAnswer === 'string' ? userAnswer.textAnswer.trim() : ''

    let status = 'omitted'
    let yourAnswer = '-'

    if (selectedOption) {
      yourAnswer = selectedOption.letter
      status = selectedOption.isCorrect ? 'correct' : 'incorrect'
    } else if (textAnswer) {
      yourAnswer = textAnswer
      status = 'incorrect'
    }

    const groupTitle = isGroupedQuestion ? stripHtml(getEntityText(group)) : ''
    const titleSource = stripHtml(getEntityText(apiQuestion)) || `Savol ${displayLabel}`

    return {
      id: Number(apiQuestion.id),
      displayIndex: displayLabel,
      title: titleSource,
      groupId: isGroupedQuestion ? groupId : null,
      groupTitle,
      groupDisplayLabel: baseDisplayLabel,
      showGroupHeader,
      questionText: getEntityText(apiQuestion),
      imageUrl: apiQuestion.imageUrl || buildAssetUrl(apiQuestion.imagePath),
      correctAnswer: correctOption?.letter || '-',
      yourAnswer,
      attemptedAnswer: yourAnswer,
      complexity: complexityFromScore(apiQuestion.score),
      status,
      answerOptions: options.map((option) => ({
        ...option,
        text: option.text || '',
      })),
      type: apiQuestion.type,
    }
  })
})

const totalQuestions = computed(() => filteredQuestions.value.length)
const correctCount = computed(() =>
  testStore.lastSubmission?.correctCount ??
  filteredQuestions.value.filter((question) => question.status === 'correct').length,
)
const incorrectCount = computed(() =>
  testStore.lastSubmission?.incorrectCount ??
  filteredQuestions.value.filter((question) => question.status === 'incorrect').length,
)
const omittedCount = computed(() =>
  filteredQuestions.value.filter((question) => question.status === 'omitted').length,
)
const scorePercent = computed(() => {
  if (!totalQuestions.value) {
    return 0
  }

  return Math.round((correctCount.value / totalQuestions.value) * 100)
})

const scoreRingRadius = 42
const scoreRingCircumference = 2 * Math.PI * scoreRingRadius
const scoreRingOffset = computed(() => scoreRingCircumference - (scorePercent.value / 100) * scoreRingCircumference)

const currentQuestion = computed(() =>
  filteredQuestions.value.find((question) => question.id === reviewingQuestionId.value) ?? null
)

const currentQuestionIndex = computed(() => {
  if (!currentQuestion.value) {
    return -1
  }

  return filteredQuestions.value.findIndex((question) => question.id === currentQuestion.value.id)
})

const explanationImageUrl = computed(() => buildAssetUrl(currentExplanation.value?.imagePath))

const explanationDisplayText = computed(() => {
  const text = currentExplanation.value?.text

  if (typeof text !== 'string') {
    return ''
  }

  return text.trim()
})

const hasExplanationContent = computed(() =>
  Boolean(explanationDisplayText.value || explanationImageUrl.value),
)

const reportingQuestion = computed(() => {
  if (!reportingQuestionId.value) {
    return null
  }

  return (
    filteredQuestions.value.find((question) => question.id === reportingQuestionId.value) || null
  )
})

const isAnyModalOpen = computed(
  () =>
    reviewingQuestionId.value !== null ||
    reportingQuestionId.value !== null ||
    isCertificateModalOpen.value,
)

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

async function loadTest() {
  const testId = requestedTestId.value

  if (!testId) {
    testLoadError.value = 'Test ID topilmadi.'
    return
  }

  isLoadingTest.value = true
  testLoadError.value = ''

  try {
    await testStore.fetchTestById(testId)

    try {
      const latestProgress = await testStore.fetchTestProgress(testId)

      if (latestProgress) {
        testStore.lastSubmission = latestProgress
      }
    } catch (progressError) {
      console.error(progressError)
    }
  } catch (error) {
    testLoadError.value =
      error instanceof Error ? error.message : "Testni yuklashda xatolik yuz berdi."
  } finally {
    isLoadingTest.value = false
  }
}

async function loadExplanation(questionId) {
  if (!questionId) {
    return
  }

  isLoadingExplanation.value = true
  explanationError.value = ''
  currentExplanation.value = null

  try {
    currentExplanation.value = await testStore.fetchQuestionExplanation(questionId)
  } catch (error) {
    explanationError.value =
      error instanceof Error ? error.message : 'Tushuntirishni yuklashda xatolik yuz berdi.'
  } finally {
    isLoadingExplanation.value = false
  }
}

watch(reviewingQuestionId, (newQuestionId) => {
  if (!newQuestionId) {
    currentExplanation.value = null
    explanationError.value = ''
    return
  }

  void loadExplanation(newQuestionId)
})

onMounted(() => {
  void loadTest()
})

watch(requestedTestId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    void loadTest()
  }
})

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
  currentExplanation.value = null
  explanationError.value = ''
}

function showPreviousQuestion() {
  const previousIndex = currentQuestionIndex.value - 1

  if (previousIndex < 0) {
    return
  }

  const previousQuestion = filteredQuestions.value[previousIndex]

  if (previousQuestion) {
    reviewingQuestionId.value = previousQuestion.id
    showAnswer.value = false
    activeTab.value = 'question'
  }
}

function showNextQuestion() {
  const nextIndex = currentQuestionIndex.value + 1

  if (nextIndex >= filteredQuestions.value.length) {
    return
  }

  const nextQuestion = filteredQuestions.value[nextIndex]

  if (nextQuestion) {
    reviewingQuestionId.value = nextQuestion.id
    showAnswer.value = false
    activeTab.value = 'question'
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

function openCertificateModal() {
  isCertificateModalOpen.value = true
}

function closeCertificateModal() {
  isCertificateModalOpen.value = false
}

function downloadCertificate() {
  window.open(certificatePreviewUrl, '_blank', 'noopener,noreferrer')
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
        <RouterLink to="/" class="cursor-default transition-colors hover:text-gray-500 cursor-pointer">Bosh sahifa</RouterLink>
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
          <p class="mt-1.5 text-sm text-gray-400">
            {{ testStore.currentTest?.title || "Test natijasi" }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex self-start rounded-full bg-[#0a0a0a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
          @click="openCertificateModal"
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
              <template
                v-for="(row, index) in filteredQuestions"
                :key="row.id"
              >
                <tr v-if="row.showGroupHeader" class="border-y border-[#eeeeee] bg-[#fafafa]">
                  <td colspan="6" class="px-6 py-3">
                    <div class="flex items-center gap-3">
                      <!-- <span class="inline-flex min-w-8 items-center justify-center rounded-full bg-[#0a0a0a] px-2.5 py-1 text-xs font-bold text-white">
                        {{ row.groupDisplayLabel }}
                      </span> -->
                      <div class="min-w-0">
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          Question group
                        </p>
                        <TestInlineMathText
                          :text="row.groupTitle || `Savol ${row.groupDisplayLabel} guruhi`"
                          wrapper-class="mt-0.5 line-clamp-2 text-sm font-semibold text-[#0a0a0a]"
                        />
                      </div>
                    </div>
                  </td>
                </tr>

                <tr
                  class="transition-colors hover:bg-[#fafafa]"
                  :class="{ 'border-b border-[#f5f5f5]': index < filteredQuestions.length - 1 }"
                >
                  <td class="px-6 py-4">
                    <span class="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#f5f5f5] px-2 text-xs font-semibold text-gray-500">
                      {{ row.displayIndex }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    <TestInlineMathText :text="row.title" wrapper-class="line-clamp-2 break-words" />
                  </td>
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
              </template>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-3 p-4 md:hidden">
          <template
            v-for="row in filteredQuestions"
            :key="row.id"
          >
            <div
              v-if="row.showGroupHeader"
              class="rounded-2xl border border-[#ebebeb] bg-[#fafafa] p-4"
            >
              <div class="flex items-center gap-3">
                <span class="inline-flex min-w-8 items-center justify-center rounded-full bg-[#0a0a0a] px-2.5 py-1 text-xs font-bold text-white">
                  {{ row.groupDisplayLabel }}
                </span>
                <div class="min-w-0">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Question group
                  </p>
                  <TestInlineMathText
                    :text="row.groupTitle || `Savol ${row.groupDisplayLabel} guruhi`"
                    wrapper-class="mt-0.5 line-clamp-3 text-sm font-semibold text-[#0a0a0a]"
                  />
                </div>
              </div>
            </div>

            <article
              class="rounded-2xl border border-[#ebebeb] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              :class="row.groupId ? 'ml-4 border-l-4 border-l-[#0a0a0a]/10' : ''"
            >
              <div class="mb-3 flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] px-2 text-xs font-semibold text-gray-500">
                  {{ row.displayIndex }}
                </span>
                <div class="min-w-0 flex-1">
                  <TestInlineMathText
                    tag="p"
                    :text="row.title"
                    wrapper-class="text-[13px] font-semibold leading-[1.4] text-[#222222] line-clamp-3 break-words"
                  />
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
          </template>
        </div>

        <div v-if="isLoadingTest" class="flex items-center justify-center py-16">
          <span class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
        </div>

        <div v-else-if="testLoadError" class="flex flex-col items-center justify-center gap-3 py-16">
          <p class="text-sm text-red-600">{{ testLoadError }}</p>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
            @click="loadTest"
          >
            Qaytadan urinish
          </button>
        </div>

        <div v-else-if="filteredQuestions.length === 0" class="flex items-center justify-center py-16">
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
                  {{ currentQuestion.groupTitle || testStore.currentTest?.title || "Test natijasi" }}
                </p>
                <h2 class="flex items-center gap-1.5 text-[clamp(14px,4vw,18px)] font-bold tracking-[-0.02em] text-[#0a0a0a]">
                  <span class="shrink-0">Savol {{ currentQuestion.displayIndex }} -</span>
                  <TestInlineMathText
                    :text="currentQuestion.title"
                    wrapper-class="truncate"
                  />
                </h2>
              </div>

              <div class="flex shrink-0 items-center gap-2">
                <span class="hidden rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-gray-500 sm:inline-flex">
                  Savol {{ currentQuestion.displayIndex }}
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
                  <p v-if="currentQuestion.groupTitle" class="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {{ currentQuestion.groupTitle }}
                  </p>
                  <h3 class="mb-3.5 text-[15px] font-bold text-[#0a0a0a]">Savol {{ currentQuestion.displayIndex }}</h3>
                  <div
                    v-if="currentQuestion.questionText"
                    class="mb-5 text-sm leading-[1.7] text-gray-600"
                    v-html="currentQuestion.questionText"
                  />
                  <p v-else class="mb-5 text-sm italic text-gray-400">
                    Savol matni mavjud emas.
                  </p>

                  <div
                    v-if="currentQuestion.imageUrl"
                    class="flex items-center justify-center rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 sm:p-6"
                  >
                    <img
                      :src="currentQuestion.imageUrl"
                      :alt="`Savol ${currentQuestion.displayIndex}`"
                      class="max-h-[420px] w-auto max-w-full"
                    />
                  </div>
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

                      <div v-if="isLoadingExplanation" class="flex items-center gap-2 py-2 text-[13px] text-gray-400">
                        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                        <span>Yuklanmoqda...</span>
                      </div>

                      <p v-else-if="explanationError" class="text-[13px] text-red-600">
                        {{ explanationError }}
                      </p>

                      <template v-else-if="hasExplanationContent">
                        <div
                          v-if="explanationDisplayText"
                          class="mb-3 text-[13px] leading-[1.7] text-gray-600"
                          v-html="explanationDisplayText"
                        />
                        <div
                          v-if="explanationImageUrl"
                          class="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white"
                        >
                          <img
                            :src="explanationImageUrl"
                            alt="Tushuntirish rasmi"
                            class="block h-auto w-full"
                          />
                        </div>
                      </template>

                      <p v-else class="text-[13px] italic text-gray-400">
                        Tushuntirish mavjud emas.
                      </p>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="review-scrollbar overflow-y-auto sm:hidden" style="height: calc(92vh - 175px)">
              <div v-if="activeTab === 'question'" class="px-4 py-5">
                <div>
                  <p v-if="currentQuestion.groupTitle" class="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {{ currentQuestion.groupTitle }}
                  </p>
                  <h3 class="mb-3.5 text-[15px] font-bold text-[#0a0a0a]">Savol {{ currentQuestion.displayIndex }}</h3>
                  <div
                    v-if="currentQuestion.questionText"
                    class="mb-5 text-sm leading-[1.7] text-gray-600"
                    v-html="currentQuestion.questionText"
                  />
                  <p v-else class="mb-5 text-sm italic text-gray-400">
                    Savol matni mavjud emas.
                  </p>

                  <div
                    v-if="currentQuestion.imageUrl"
                    class="flex items-center justify-center rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4"
                  >
                    <img
                      :src="currentQuestion.imageUrl"
                      :alt="`Savol ${currentQuestion.displayIndex}`"
                      class="max-h-[360px] w-auto max-w-full"
                    />
                  </div>
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

                      <div v-if="isLoadingExplanation" class="flex items-center gap-2 py-2 text-[13px] text-gray-400">
                        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                        <span>Yuklanmoqda...</span>
                      </div>

                      <p v-else-if="explanationError" class="text-[13px] text-red-600">
                        {{ explanationError }}
                      </p>

                      <template v-else-if="hasExplanationContent">
                        <div
                          v-if="explanationDisplayText"
                          class="mb-3 text-[13px] leading-[1.7] text-gray-600"
                          v-html="explanationDisplayText"
                        />
                        <div
                          v-if="explanationImageUrl"
                          class="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white"
                        >
                          <img
                            :src="explanationImageUrl"
                            alt="Tushuntirish rasmi"
                            class="block h-auto w-full"
                          />
                        </div>
                      </template>

                      <p v-else class="text-[13px] italic text-gray-400">
                        Tushuntirish mavjud emas.
                      </p>
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
                  Savol {{ currentQuestion.displayIndex }}
                </span>

                <button
                  type="button"
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition"
                  :class="currentQuestionIndex <= 0 ? 'cursor-not-allowed bg-[#f0f0f0] text-gray-300' : 'bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]'"
                  :disabled="currentQuestionIndex <= 0"
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
                  :class="currentQuestionIndex >= totalQuestions - 1 ? 'cursor-not-allowed bg-[#f0f0f0] text-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                  :disabled="currentQuestionIndex >= totalQuestions - 1"
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
            <p class="mb-6 text-sm text-gray-400">
              {{ reportingQuestion ? `Savol ${reportingQuestion.displayIndex}` : `Savol #${reportingQuestionId}` }}
            </p>

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

    <Teleport to="body">
      <div
        v-if="isCertificateModalOpen"
        class="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-[2px] sm:items-center"
        @click.self="closeCertificateModal"
      >
        <div class="certificate-modal-inner flex h-[92vh] w-full flex-col overflow-hidden bg-white shadow-[0_28px_90px_rgba(0,0,0,0.25)] sm:mx-4 sm:max-w-5xl">
          <div class="flex shrink-0 items-center justify-between gap-4 border-b border-[#ebebeb] px-4 py-4 sm:px-6">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                Sertifikat
              </p>
              <h2 class="mt-1 text-xl font-extrabold tracking-[-0.04em] text-[#0a0a0a]">
                Sertifikatni ko'rish
              </h2>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <button
                type="button"
                class="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-4 text-xs font-semibold text-white transition hover:bg-[#1a1a1a]"
                @click="downloadCertificate"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3v12" stroke-linecap="round" />
                  <path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M5 21h14" stroke-linecap="round" />
                </svg>
                <span class="hidden sm:inline">Yuklab olish</span>
              </button>

              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] text-gray-500 transition hover:bg-[#0a0a0a] hover:text-white"
                @click="closeCertificateModal"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 6 6 18" stroke-linecap="round" />
                  <path d="m6 6 12 12" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <iframe
            :src="certificatePreviewUrl"
            title="Sertifikat"
            class="min-h-0 w-full flex-1 border-0 bg-white"
            loading="lazy"
          ></iframe>
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
.report-modal-inner,
.certificate-modal-inner {
  border-radius: 20px 20px 0 0;
}

@media (min-width: 640px) {
  .review-modal-inner,
  .report-modal-inner,
  .certificate-modal-inner {
    border-radius: 20px;
  }
}
</style>
