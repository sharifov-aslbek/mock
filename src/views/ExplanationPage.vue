<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { NPopover } from 'naive-ui'
import TestCertificate from '@/components/certificate/TestCertificate.vue'
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'
import { useAuthStore } from '@/stores/auth'
import { useTestStore } from '@/stores/test'
import { useTestProgressStore } from '@/stores/testProgress'
import { getTestApiBaseUrl } from '@/utils/api'
import { buildCertificateViewModel } from '@/utils/certificateData'
import {
  loadTestSubmission,
  saveTestSubmission,
} from '@/utils/testSubmissionStorage'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const testProgressStore = useTestProgressStore()

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const LANGUAGE_BY_LOCALE = { uz: 'Uzbek', ru: 'Russian' }

const reviewingQuestionId = ref(null)
const reportingQuestionId = ref(null)
const showAnswer = ref(false)
const activeTab = ref('question')
const reportComment = ref('')
const reportFileName = ref('')
const reportSubmitted = ref(false)
const reportFileInput = ref(null)
const isCertificateModalOpen = ref(false)
const showResultModal = ref(false)

const isLoadingTest = ref(false)
const testLoadError = ref('')
const isLoadingExplanation = ref(false)
const explanationError = ref('')
const currentExplanation = ref(null)
const activeAttemptId = ref(null)
const hasSubmittedResult = ref(false)
const isFinalizingSubmission = ref(false)

let reportCloseTimeout = null
let previousBodyOverflow = ''

const apiBaseUrl = getTestApiBaseUrl()

const CERT_FRAME_WIDTH = 794
const CERT_FRAME_HEIGHT = 1123

const certScale = ref(1)
let certResizeObserver = null

const certFrameStyle = computed(() => ({
  width: `${CERT_FRAME_WIDTH}px`,
  height: `${CERT_FRAME_HEIGHT}px`,
  transform: `translate(-50%, -50%) scale(${certScale.value})`,
}))

function measureCertViewport(el) {
  if (!el || !el.clientWidth || !el.clientHeight) {
    return
  }

  // Fit the whole certificate within the viewport on both axes.
  certScale.value = Math.min(
    el.clientWidth / CERT_FRAME_WIDTH,
    el.clientHeight / CERT_FRAME_HEIGHT,
  )
}

// Template ref callback — runs when a certificate viewport mounts/unmounts as
// the modals open and close. Keeps the scale in sync with the container size.
function bindCertViewport(el) {
  if (certResizeObserver) {
    certResizeObserver.disconnect()
    certResizeObserver = null
  }

  measureCertViewport(el)

  if (el && typeof ResizeObserver !== 'undefined') {
    certResizeObserver = new ResizeObserver(() => measureCertViewport(el))
    certResizeObserver.observe(el)
  }
}

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

const requestedAttemptId = computed(() => {
  const queryValue = route.query.attemptId
  const value = Array.isArray(queryValue) ? queryValue[0] : queryValue

  return value ? Number(value) : null
})

const certificateViewModel = computed(() =>
  buildCertificateViewModel({
    submission: testStore.lastSubmission,
    user: authStore.userInfo,
    test: testStore.currentTest,
    attemptId: activeAttemptId.value || requestedAttemptId.value,
  }),
)

const submittedQuestions = computed(() => {
  const submissionQuestions = testStore.lastSubmission?.questions

  return Array.isArray(submissionQuestions) ? submissionQuestions : null
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

// Some API responses bleed the question text into an option's text field — a
// backend join concatenates the question column onto the option, so the last
// option ends up showing the entire question (sometimes duplicated). Detect
// the corruption by checking whether the option's plain text contains the
// full question, and if so keep only the prefix preceding the question — that
// is the real option value (e.g. "12").
const sanitizeOptionText = (optionText, questionPlain) => {
  if (!optionText || !questionPlain || questionPlain.length < 10) {
    return optionText
  }

  const optionPlain = stripHtml(optionText)
  const questionIndex = optionPlain.indexOf(questionPlain)

  if (questionIndex < 0) {
    return optionText
  }

  const cleanedPrefix = optionPlain.slice(0, questionIndex).trim()
  return cleanedPrefix || optionPlain.replace(questionPlain, '').trim()
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
  const apiQuestions = submittedQuestions.value || testStore.currentTest?.questions

  if (!Array.isArray(apiQuestions)) {
    return []
  }

  // SORT QUESTIONS BY ORDER
  const sortedQuestions = [...apiQuestions].sort((a, b) => {
    return Number(a?.order || 0) - Number(b?.order || 0)
  })

  const questionGroupsById = new Map(
    (testStore.currentTest?.questionGroups || []).map((group) => [Number(group.id), group]),
  )

  const groupedQuestionCounts = sortedQuestions.reduce((counts, question) => {
    const groupId = Number(question?.questionGroupId || 0)

    if (!groupId) {
      return counts
    }

    counts.set(groupId, Number(counts.get(groupId) || 0) + 1)

    return counts
  }, new Map())

  // For each group: collect the distinct `order` values its sub-questions
  // carry, the lowest order (its starting number), and the count.
  // Backend sometimes ships ALL sub-questions of one group with the same
  // `order` — frontend distributes sequential numbers from the start.
  const groupOrderInfo = new Map()
  for (const question of sortedQuestions) {
    const groupId = Number(question?.questionGroupId || 0)
    if (!groupId) {
      continue
    }
    const order = Number(question?.order)
    const existing = groupOrderInfo.get(groupId) || {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      distinctOrders: new Set(),
      count: 0,
    }
    existing.count += 1
    if (Number.isFinite(order)) {
      existing.distinctOrders.add(order)
      if (order < existing.min) existing.min = order
      if (order > existing.max) existing.max = order
    }
    groupOrderInfo.set(groupId, existing)
  }

  const shownGroupHeaders = new Set()
  const groupSubIndexes = new Map()
  let fallbackCounter = 0

  return sortedQuestions.map((apiQuestion) => {
    const groupId = Number(apiQuestion?.questionGroupId || 0)

    const group = groupId
      ? questionGroupsById.get(groupId)
      : null

    const isGroupedQuestion = Boolean(
      group && Number(groupedQuestionCounts.get(groupId) || 0) > 1,
    )

    fallbackCounter += 1
    const order = Number(apiQuestion?.order)

    let displayLabel
    if (isGroupedQuestion) {
      const info = groupOrderInfo.get(groupId)
      const subIndex = groupSubIndexes.get(groupId) || 0
      // If every sub-question carries the SAME order (backend quirk),
      // distribute sequentially: start, start+1, start+2…
      // If they already differ, honour each question's actual order.
      if (info && info.distinctOrders.size <= 1 && Number.isFinite(info.min)) {
        displayLabel = String(info.min + subIndex)
      } else {
        displayLabel = Number.isFinite(order) && order > 0
          ? String(order)
          : String(fallbackCounter)
      }
      groupSubIndexes.set(groupId, subIndex + 1)
    } else {
      displayLabel = Number.isFinite(order) && order > 0
        ? String(order)
        : String(fallbackCounter)
    }

    // Group header label = the sequential range (start..start+count-1) when
    // sub-questions all share one order, otherwise the actual min-max range.
    let baseDisplayLabel = displayLabel
    if (isGroupedQuestion) {
      const info = groupOrderInfo.get(groupId)
      if (info && Number.isFinite(info.min)) {
        const startNumber = info.min
        const endNumber = info.distinctOrders.size <= 1
          ? info.min + info.count - 1
          : info.max
        baseDisplayLabel = startNumber === endNumber
          ? String(startNumber)
          : `${startNumber}-${endNumber}`
      }
    }

    const showGroupHeader =
      isGroupedQuestion && !shownGroupHeaders.has(groupId)

    if (isGroupedQuestion) {
      shownGroupHeaders.add(groupId)
    }

    // OPTIONS
    const options = Array.isArray(apiQuestion.options)
      ? apiQuestion.options.map((option, optionIndex) => ({
          ...option,
          letter:
            option.letter ||
            OPTION_LETTERS[optionIndex] ||
            String(optionIndex + 1),
        }))
      : []

    const correctOption = options.find((option) => option.isCorrect)

    // USER ANSWER
    const userAnswer = userAnswersByQuestionId.value.get(
      Number(apiQuestion.id),
    )

    const answerQuestion = userAnswer?.question || null

    const sourceQuestion = answerQuestion || apiQuestion

    const selectedOptionId = userAnswer?.selectedOptionId || 0

    const selectedOption = selectedOptionId
      ? options.find(
          (option) => Number(option.id) === Number(selectedOptionId),
        )
      : null

    // Matching / group sub-questions don't ship inline `options`, so the
    // local lookup misses. Fall back to the option blob the backend attaches
    // to the userAnswer itself so we don't mis-flag answered questions as
    // omitted.
    const userAnswerOption =
      !selectedOption && userAnswer?.selectedOption
        ? userAnswer.selectedOption
        : null

    const textAnswer =
      typeof userAnswer?.textAnswer === 'string'
        ? userAnswer.textAnswer.trim()
        : ''

    let status = 'omitted'
    let yourAnswer = '-'

    if (selectedOption) {
      yourAnswer = selectedOption.letter
      status = selectedOption.isCorrect ? 'correct' : 'incorrect'
    } else if (userAnswerOption) {
      yourAnswer =
        stripHtml(getEntityText(userAnswerOption) || userAnswerOption.text || '') || '-'
      status = userAnswerOption.isCorrect ? 'correct' : 'incorrect'
    } else if (textAnswer) {
      yourAnswer = textAnswer
      status = 'incorrect'
    }

    // QUESTION TEXT
    const groupTitle = isGroupedQuestion
      ? stripHtml(getEntityText(group))
      : ''

    const questionTranslation = getLocalizedTranslation(sourceQuestion)
    const questionTextRaw = questionTranslation?.text || getEntityText(sourceQuestion)

    const titleSource =
      stripHtml(questionTextRaw) || `Savol ${displayLabel}`

    const questionPlain = stripHtml(questionTextRaw)

    return {
      id: Number(apiQuestion.id),
      order: Number(apiQuestion?.order || 0),

      displayIndex: displayLabel,

      title: titleSource,

      groupId: isGroupedQuestion ? groupId : null,

      groupTitle,

      groupDisplayLabel: baseDisplayLabel,

      showGroupHeader,

      questionText: questionTextRaw,

      questionExplanation:
        sourceQuestion.questionExplanation || null,

      imageUrl:
        sourceQuestion.imageUrl ||
        buildAssetUrl(questionTranslation?.imagePath || sourceQuestion.imagePath),

      correctAnswer:
        correctOption?.letter ||
        (typeof apiQuestion.correctAnswer === 'string' &&
        apiQuestion.correctAnswer.trim()
          ? apiQuestion.correctAnswer.trim()
          : '-'),

      yourAnswer,

      attemptedAnswer: yourAnswer,

      complexity: complexityFromScore(apiQuestion.score),

      status,

      answerOptions: options.map((option) => ({
        ...option,
        text: sanitizeOptionText(
          getEntityText(option) || option.text || '',
          questionPlain,
        ),
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

const coerceExplanationText = (value) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      return ''
    }

    return trimmedValue
      .replace(/^"(.*)"$/s, '$1')
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\(?=[A-Za-z()[\]{}])/g, '\\')
      .trim()
  }

  if (Array.isArray(value)) {
    return value.map((item) => coerceExplanationText(item)).filter(Boolean).join('\n')
  }

  if (value && typeof value === 'object') {
    if (typeof value.text === 'string' || Array.isArray(value.text)) {
      return coerceExplanationText(value.text)
    }

    return ''
  }

  return ''
}

const normalizeExplanation = (entity) => {
  if (!entity) {
    return null
  }

  const translation = getLocalizedTranslation(entity)

  return {
    ...entity,
    text: coerceExplanationText(translation?.text || entity?.text || ''),
    imagePath: translation?.imagePath || entity?.imagePath || null,
    videoLink: entity?.videoLink || null,
  }
}

const explanationImageUrl = computed(() => buildAssetUrl(currentExplanation.value?.imagePath))
const explanationVideoLink = computed(() => {
  const videoLink = currentExplanation.value?.videoLink
  return typeof videoLink === 'string' && videoLink.trim() ? videoLink.trim() : ''
})

const explanationDisplayText = computed(() => {
  const text = currentExplanation.value?.text

  if (typeof text !== 'string') {
    return ''
  }

  return text.trim()
})

const hasExplanationContent = computed(() =>
  Boolean(explanationDisplayText.value || explanationImageUrl.value || explanationVideoLink.value),
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
    isCertificateModalOpen.value ||
    showResultModal.value,
)

const statCards = computed(() => {
  const total = totalQuestions.value || 1
  return [
    {
      label: t('explanationPage.stats.correct'),
      value: correctCount.value,
      colorClass: 'text-green-600',
      bgClass: 'bg-green-50',
      percentLabel: t('explanationPage.stats.percentCorrect', {
        value: Math.round((correctCount.value / total) * 100),
      }),
      icon: 'check',
    },
    {
      label: t('explanationPage.stats.incorrect'),
      value: incorrectCount.value,
      colorClass: 'text-red-600',
      bgClass: 'bg-rose-50',
      percentLabel: t('explanationPage.stats.percentIncorrect', {
        value: Math.round((incorrectCount.value / total) * 100),
      }),
      icon: 'cross',
    },
    {
      label: t('explanationPage.stats.omitted'),
      value: omittedCount.value,
      colorClass: 'text-gray-600',
      bgClass: 'bg-gray-50',
      percentLabel: t('explanationPage.stats.percentOmitted', {
        value: Math.round((omittedCount.value / total) * 100),
      }),
      icon: 'skip',
    },
  ]
})

const tableHeaders = computed(() => [
  { key: 'questions', label: t('explanationPage.columns.questions') },
  { key: 'title', label: t('explanationPage.columns.title') },
  { key: 'correctAnswer', label: t('explanationPage.columns.correctAnswer') },
  { key: 'yourAnswer', label: t('explanationPage.columns.yourAnswer') },
  { key: 'complexity', label: t('explanationPage.columns.complexity') },
  { key: 'actions', label: t('explanationPage.columns.actions') },
])

// Strip LaTeX-only delimiters/commands so we can measure a "display length"
// and decide when a correct-answer cell needs to be truncated with a popover.
const measureAnswerLength = (raw) => {
  if (typeof raw !== 'string') return 0
  return raw
    .replace(/\\\(|\\\)|\\\[|\\\]|\$\$?/g, '')
    .replace(/\\[a-zA-Z]+\s*\{?/g, '')
    .replace(/[{}]/g, '')
    .trim().length
}

const ANSWER_TRUNCATE_LIMIT = 22

const shouldTruncateAnswer = (raw) => measureAnswerLength(raw) > ANSWER_TRUNCATE_LIMIT

const progressLegend = computed(() => [
  {
    colorClass: 'bg-green-600',
    label: t('explanationPage.legend.correct', { value: correctCount.value }),
  },
  {
    colorClass: 'bg-red-600',
    label: t('explanationPage.legend.incorrect', { value: incorrectCount.value }),
  },
  {
    colorClass: 'bg-gray-300',
    label: t('explanationPage.legend.omitted', { value: omittedCount.value }),
  },
])

function submissionBelongsToTest(submission, testId) {
  if (!submission || !testId) {
    return false
  }

  const numericTestId = Number(testId)

  if (Number(submission.testId || submission?.test?.id || 0) === numericTestId) {
    return true
  }

  if (
    Array.isArray(submission.questions) &&
    submission.questions.some((question) => Number(question?.testId) === numericTestId)
  ) {
    return true
  }

  if (typeof submission.correctCount === 'number' || typeof submission.incorrectCount === 'number') {
    const currentQuestionIds = new Set(
      (testStore.currentTest?.questions || []).map((question) => Number(question.id)),
    )

    return (
      Array.isArray(submission.userAnswers) &&
      submission.userAnswers.some((answer) => currentQuestionIds.has(Number(answer?.questionId)))
    )
  }

  return false
}

async function loadTest({ skipProgressFallback = false } = {}) {
  const testId = requestedTestId.value

  if (!testId) {
    testLoadError.value = 'Test ID topilmadi.'
    return
  }

  isLoadingTest.value = true
  testLoadError.value = ''

  try {
    await testStore.fetchTestById(testId)
    activeAttemptId.value = requestedAttemptId.value

    const storedSubmission = loadTestSubmission(testId)

    if (storedSubmission && submissionBelongsToTest(storedSubmission, testId)) {
      testStore.lastSubmission = storedSubmission
      hasSubmittedResult.value = true
      return
    }

    // When arriving from the test page, submit runs next and fills `lastSubmission`.
    const submission = testStore.lastSubmission
    const hasSubmissionForTest = submissionBelongsToTest(submission, testId)
    hasSubmittedResult.value = hasSubmissionForTest

    if (!hasSubmissionForTest && !skipProgressFallback) {
      try {
        const latestProgress = await testStore.fetchTestProgress(testId)

        if (latestProgress) {
          testStore.lastSubmission = latestProgress
          activeAttemptId.value = Number(latestProgress.id || activeAttemptId.value || 0) || null
          hasSubmittedResult.value = Boolean(
            latestProgress.isSubmitted ||
              latestProgress.submitted ||
              latestProgress.completed ||
              latestProgress.submittedAt ||
              latestProgress.finishedAt,
          )
        }
      } catch (progressError) {
        console.error(progressError)
      }
    }
  } catch (error) {
    testLoadError.value =
      error instanceof Error ? error.message : "Testni yuklashda xatolik yuz berdi."
  } finally {
    isLoadingTest.value = false
  }
}

async function finalizeTestSubmission() {
  const testId = requestedTestId.value
  const attemptId = requestedAttemptId.value || activeAttemptId.value

  if (!testId || !attemptId) {
    throw new Error('Test yoki urinish identifikatori topilmadi.')
  }

  activeAttemptId.value = Number(attemptId)
  const submission = await testStore.submitTestAttempt(testId, attemptId)

  if (submission) {
    saveTestSubmission(testId, submission)
    testStore.lastSubmission = submission
  }

  testProgressStore.clearProgress(Number(testId))
  hasSubmittedResult.value = Boolean(submission)

  return submission
}

function stripRouteFlags(flags) {
  const nextQuery = { ...route.query }

  flags.forEach((flag) => {
    delete nextQuery[flag]
  })

  return router.replace({ query: nextQuery })
}

async function initializeExplanationPage() {
  testLoadError.value = ''

  if (authStore.isAuthenticated && !authStore.userInfo) {
    try {
      await authStore.getUserInfo()
    } catch (error) {
      console.error(error)
    }
  }

  const readyToSubmit = route.query.readyToSubmit === '1'

  try {
    await loadTest({ skipProgressFallback: readyToSubmit })

    if (readyToSubmit) {
      isFinalizingSubmission.value = true
      await finalizeTestSubmission()
      showResultModal.value = true
      await stripRouteFlags(['readyToSubmit'])
      return
    }

    if (route.query.submitted === '1') {
      showResultModal.value = true
      await stripRouteFlags(['submitted'])
    }
  } catch (error) {
    testLoadError.value =
      error instanceof Error ? error.message : 'Testni topshirishda xatolik yuz berdi.'
  } finally {
    isFinalizingSubmission.value = false
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
    const explanation = await testStore.fetchQuestionExplanation(questionId)

    if (explanation) {
      currentExplanation.value = normalizeExplanation(explanation)
      return
    }

    const localExplanation =
      filteredQuestions.value.find((question) => question.id === Number(questionId))
        ?.questionExplanation || null

    if (localExplanation) {
      currentExplanation.value = normalizeExplanation(localExplanation)
      return
    }
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
  void initializeExplanationPage()
})

onBeforeRouteLeave((to) => {
  if (hasSubmittedResult.value && to.name === 'test') {
    return { name: 'math' }
  }

  return true
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

  if (certResizeObserver) {
    certResizeObserver.disconnect()
    certResizeObserver = null
  }

  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow
  }
})

function openReview(questionId) {
  reviewingQuestionId.value = questionId
  showAnswer.value = false
  activeTab.value = 'answer'
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
    activeTab.value = 'answer'
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
    activeTab.value = 'answer'
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

function closeResultModal() {
  showResultModal.value = false
}

async function downloadCertificate() {
  if (typeof window === 'undefined') {
    return
  }

  const certEl = document.querySelector('.certificate-modal-inner .certificate-page, .result-modal-inner .certificate-page')

  if (!certEl) {
    return
  }

  const scaledParent = certEl.parentElement
  const previousTransform = scaledParent?.style.transform || ''
  const previousTransition = scaledParent?.style.transition || ''

  if (scaledParent) {
    scaledParent.style.transition = 'none'
    scaledParent.style.transform = 'translate(-50%, -50%)'
  }

  const { default: html2pdf } = await import('html2pdf.js')
  const data = certificateViewModel.value || {}
  const filenameParts = [data.lastName, data.firstName, data.certificateNumber]
    .filter(Boolean)
    .map((part) => String(part).trim().replace(/\s+/g, '_'))
  const filename = `${filenameParts.join('_') || 'sertifikat'}.pdf`

  try {
    await html2pdf()
      .from(certEl)
      .set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: CERT_FRAME_WIDTH,
          windowHeight: CERT_FRAME_HEIGHT,
        },
        jsPDF: { unit: 'px', format: [CERT_FRAME_WIDTH, CERT_FRAME_HEIGHT], orientation: 'portrait' },
      })
      .save()
  } finally {
    if (scaledParent) {
      scaledParent.style.transform = previousTransform
      scaledParent.style.transition = previousTransition
    }
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

        <div class="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            class="inline-flex self-start rounded-full bg-[#0a0a0a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a1a1a] sm:self-auto"
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
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                    v-else-if="card.icon === 'cross'"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M18 6 6 18" stroke-linecap="round" />
                    <path d="m6 6 12 12" stroke-linecap="round" />
                  </svg>
                  <svg
                    v-else
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" stroke-linecap="round" />
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
          <h2 class="text-base font-bold tracking-[-0.02em] text-[#0a0a0a]">{{ t('explanationPage.title') }}</h2>
          <p class="mt-0.5 text-xs text-gray-300">{{ t('explanationPage.shownCount', { count: filteredQuestions.length }) }}</p>
        </div>

        <div class="explanation-scrollbar hidden overflow-x-auto md:block">
          <table class="w-full">
            <thead>
              <tr class="border-b border-[#f0f0f0] bg-[#fafafa]">
                <th
                  v-for="header in tableHeaders"
                  :key="header.key"
                  class="px-6 py-3.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.6px] text-gray-300"
                  :class="{ 'text-center': header.key === 'actions' }"
                >
                  {{ header.label }}
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
                      <div class="min-w-0">
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {{ t('explanationPage.questionGroup') }}
                        </p>
                        <TestInlineMathText
                          :text="row.groupTitle || t('explanationPage.groupFallback', { label: row.groupDisplayLabel })"
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
                    <div class="max-w-[340px]">
                      <TestInlineMathText
                        :text="row.title"
                        wrapper-class="line-clamp-2 break-words text-[13px] leading-[1.4]"
                      />
                      
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <NPopover
                      v-if="shouldTruncateAnswer(row.correctAnswer)"
                      trigger="click"
                      placement="top"
                      style="max-width: 320px"
                    >
                      <template #trigger>
                        <button
                          type="button"
                          class="inline-flex max-w-[140px] items-center gap-1 rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-semibold text-[#0a0a0a] transition hover:bg-[#ececec]"
                        >
                          <span class="truncate">{{ row.correctAnswer }}</span>
                          <span aria-hidden="true">…</span>
                        </button>
                      </template>
                      <div class="max-w-[300px]">
                        <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {{ t('explanationPage.correctAnswer') }}
                        </p>
                        <TestInlineMathText
                          :text="row.correctAnswer"
                          wrapper-class="text-sm font-semibold text-[#0a0a0a] break-words"
                        />
                      </div>
                    </NPopover>
                    <span
                      v-else
                      class="inline-flex rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-semibold text-[#0a0a0a]"
                    >
                      <TestInlineMathText
                        tag="span"
                        :text="row.correctAnswer"
                        wrapper-class="inline-block"
                      />
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <NPopover
                      v-if="row.status !== 'omitted' && shouldTruncateAnswer(row.yourAnswer)"
                      trigger="click"
                      placement="top"
                      style="max-width: 320px"
                    >
                      <template #trigger>
                        <button
                          type="button"
                          class="inline-flex max-w-[140px] items-center gap-1 rounded-full px-3 py-1 text-xs transition"
                          :class="answerBadgeClass(row.status)"
                        >
                          <span class="truncate">{{ row.yourAnswer }}</span>
                          <span aria-hidden="true">…</span>
                        </button>
                      </template>
                      <div class="max-w-[300px]">
                        <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {{ t('explanationPage.yourAnswer') }}
                        </p>
                        <TestInlineMathText
                          :text="row.yourAnswer"
                          wrapper-class="text-sm font-semibold text-[#0a0a0a] break-words"
                        />
                      </div>
                    </NPopover>
                    <span
                      v-else
                      class="inline-flex min-w-[72px] items-center justify-center rounded-full px-3 py-1 text-xs"
                      :class="answerBadgeClass(row.status)"
                    >
                      <template v-if="row.status === 'omitted'">{{ t('explanationPage.omitted') }}</template>
                      <TestInlineMathText
                        v-else
                        tag="span"
                        :text="row.yourAnswer"
                        wrapper-class="inline-block"
                      />
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" :class="complexityBadgeClass(row.complexity)">
                      {{ t(`explanationPage.complexity.${row.complexity}`) }}
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
                        <span>{{ t('explanationPage.review') }}</span>
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
                    {{ t('explanationPage.questionGroup') }}
                  </p>
                  <TestInlineMathText
                    :text="row.groupTitle || t('explanationPage.groupFallback', { label: row.groupDisplayLabel })"
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
                  <span class="text-[11px] text-gray-300">{{ t('explanationPage.correctLabel') }}</span>
                  <NPopover
                    v-if="shouldTruncateAnswer(row.correctAnswer)"
                    trigger="click"
                    placement="top"
                    style="max-width: 280px"
                  >
                    <template #trigger>
                      <button
                        type="button"
                        class="inline-flex max-w-[120px] items-center gap-1 rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-bold text-[#0a0a0a]"
                      >
                        <span class="truncate">{{ row.correctAnswer }}</span>
                        <span aria-hidden="true">…</span>
                      </button>
                    </template>
                    <div class="max-w-[260px]">
                      <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {{ t('explanationPage.correctAnswer') }}
                      </p>
                      <TestInlineMathText
                        :text="row.correctAnswer"
                        wrapper-class="text-sm font-semibold text-[#0a0a0a] break-words"
                      />
                    </div>
                  </NPopover>
                  <span
                    v-else
                    class="inline-flex rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-bold text-[#0a0a0a]"
                  >
                    <TestInlineMathText
                      tag="span"
                      :text="row.correctAnswer"
                      wrapper-class="inline-block"
                    />
                  </span>
                </div>

                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] text-gray-300">{{ t('explanationPage.yourLabel') }}</span>
                  <NPopover
                    v-if="row.status !== 'omitted' && shouldTruncateAnswer(row.yourAnswer)"
                    trigger="click"
                    placement="top"
                    style="max-width: 280px"
                  >
                    <template #trigger>
                      <button
                        type="button"
                        class="inline-flex max-w-[120px] items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px]"
                        :class="answerBadgeClass(row.status)"
                      >
                        <span class="truncate">{{ row.yourAnswer }}</span>
                        <span aria-hidden="true">…</span>
                      </button>
                    </template>
                    <div class="max-w-[260px]">
                      <p class="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {{ t('explanationPage.yourAnswer') }}
                      </p>
                      <TestInlineMathText
                        :text="row.yourAnswer"
                        wrapper-class="text-sm font-semibold text-[#0a0a0a] break-words"
                      />
                    </div>
                  </NPopover>
                  <span
                    v-else
                    class="inline-flex min-w-[68px] items-center justify-center rounded-full px-2.5 py-0.5 text-[11px]"
                    :class="answerBadgeClass(row.status)"
                  >
                    <template v-if="row.status === 'omitted'">{{ t('explanationPage.omitted') }}</template>
                    <TestInlineMathText
                      v-else
                      tag="span"
                      :text="row.yourAnswer"
                      wrapper-class="inline-block"
                    />
                  </span>
                </div>

                <span class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" :class="complexityBadgeClass(row.complexity)">
                  {{ t(`explanationPage.complexity.${row.complexity}`) }}
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
                  {{ t('explanationPage.review') }}
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

        <div v-if="isLoadingTest || isFinalizingSubmission"
          class="flex flex-col items-center justify-center gap-3 py-16"
        >
          <span class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-700" />
          <p v-if="isFinalizingSubmission" class="text-sm text-gray-500">Test topshirilmoqda...</p>
        </div>

        <div v-else-if="testLoadError" class="flex flex-col items-center justify-center gap-3 py-16">
          <p class="text-sm text-red-600">{{ testLoadError }}</p>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white"
            @click="initializeExplanationPage"
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
                <p class="line-clamp-2 break-words text-[11px] font-medium uppercase tracking-[0.5px] text-gray-400">
                  {{ currentQuestion.groupTitle || testStore.currentTest?.title || "Test natijasi" }}
                </p>
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
              <div class="review-scrollbar min-w-0 overflow-y-auto border-r border-[#ebebeb] bg-white px-8 py-6">
                <div class="min-w-0">
                  <p v-if="currentQuestion.groupTitle" class="mb-2 break-words text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {{ currentQuestion.groupTitle }}
                  </p>
                  <h3 class="mb-3.5 text-[15px] font-bold text-[#0a0a0a]">Savol {{ currentQuestion.displayIndex }}</h3>
                  <TestInlineMathText
                    v-if="currentQuestion.questionText"
                    tag="div"
                    :text="currentQuestion.questionText"
                    wrapper-class="mb-5 break-words text-sm leading-[1.7] text-gray-600"
                  />
                  <p v-else class="mb-5 text-sm italic text-gray-400">
                    Savol matni mavjud emas.
                  </p>

                  <!-- <div
                    v-if="currentQuestion.imageUrl"
                    class="flex items-center justify-center rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 sm:p-6"
                  >
                    <img
                      :src="currentQuestion.imageUrl"
                      :alt="`Savol ${currentQuestion.displayIndex}`"
                      class="max-h-[420px] w-auto max-w-full"
                    />
                  </div> -->
                </div>
              </div>

              <div class="review-scrollbar min-w-0 overflow-y-auto bg-[#fafafa] px-8 py-6">
                <div class="min-w-0">
                  <h3 class="mb-4 text-[15px] font-bold text-[#0a0a0a]">Javob variantlari</h3>

                  <div v-if="currentQuestion.answerOptions?.length" class="mb-5">
                    <div
                      v-for="option in currentQuestion.answerOptions"
                      :key="option.letter"
                      class="mb-2 break-words rounded-xl px-4 py-3 text-[13px] leading-[1.6] text-[#0a0a0a]"
                      :class="answerOptionClass(option)"
                    >
                      <span class="mr-1.5 font-bold">{{ option.letter }}.</span>
                      <TestInlineMathText tag="span" :text="option.text" wrapper-class="break-words" />
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
                      <span v-else class="break-words text-lg font-bold text-[#0a0a0a]">
                        {{ currentQuestion.yourAnswer }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="showAnswer"
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
                      <TestInlineMathText
                        v-if="explanationDisplayText"
                        tag="div"
                        :text="explanationDisplayText"
                        wrapper-class="mb-3 break-words text-[13px] leading-[1.7] text-gray-600"
                      />
                      <a
                        v-if="explanationVideoLink"
                        :href="explanationVideoLink"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[13px] font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
                      >
                        <span>Video izohni ko'rish</span>
                      </a>
                      <div
                        v-if="currentQuestion.imageUrl"
                        class="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        <img
                          :src="currentQuestion.imageUrl"
                          :alt="`Savol ${currentQuestion.displayIndex}`"
                          class="block h-auto w-full"
                        />
                      </div>
                    </template>

                    <p v-else class="text-[13px] italic text-gray-400">
                      Tushuntirish mavjud emas.
                    </p>
                  </div>
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
                  <TestInlineMathText
                    v-if="currentQuestion.questionText"
                    tag="div"
                    :text="currentQuestion.questionText"
                    wrapper-class="mb-5 break-words text-sm leading-[1.7] text-gray-600"
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
                      class="mb-2 break-words rounded-xl px-4 py-3 text-[13px] leading-[1.6] text-[#0a0a0a]"
                      :class="answerOptionClass(option)"
                    >
                      <span class="mr-1.5 font-bold">{{ option.letter }}.</span>
                      <TestInlineMathText tag="span" :text="option.text" wrapper-class="break-words" />
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
                      <span v-else class="break-words text-lg font-bold text-[#0a0a0a]">
                        {{ currentQuestion.yourAnswer }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="showAnswer"
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
                      <TestInlineMathText
                        v-if="explanationDisplayText"
                        tag="div"
                        :text="explanationDisplayText"
                        wrapper-class="mb-3 break-words text-[13px] leading-[1.7] text-gray-600"
                      />
                      <a
                        v-if="explanationVideoLink"
                        :href="explanationVideoLink"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-[13px] font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
                      >
                        <span>Video izohni ko'rish</span>
                      </a>
                      <div
                        v-if="currentQuestion.imageUrl"
                        class="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white"
                      >
                        <img
                          :src="currentQuestion.imageUrl"
                          :alt="`Savol ${currentQuestion.displayIndex}`"
                          class="block h-auto w-full"
                        />
                      </div>
                    </template>

                    <p v-else class="text-[13px] italic text-gray-400">
                      Tushuntirish mavjud emas.
                    </p>
                  </div>
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

          <div
            :ref="bindCertViewport"
            class="relative min-h-0 flex-1 overflow-hidden bg-[#f3f4f6]"
          >
            <TestCertificate
              :data="certificateViewModel"
              class="absolute left-1/2 top-1/2 origin-center"
              :style="certFrameStyle"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showResultModal"
        class="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-[2px] sm:items-center"
        @click.self="closeResultModal"
      >
        <div class="result-modal-inner flex h-[92vh] w-full flex-col overflow-hidden bg-white shadow-[0_28px_90px_rgba(0,0,0,0.25)] sm:mx-4 sm:max-w-5xl">
          <div class="flex shrink-0 items-start justify-between gap-4 border-b border-[#ebebeb] px-5 py-4 sm:px-6">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                Test yakunlandi
              </p>
              <h2 class="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#0a0a0a]">
                Tabriklaymiz!
              </h2>
            </div>

            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-gray-500 transition hover:bg-[#0a0a0a] hover:text-white"
              @click="closeResultModal"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18" stroke-linecap="round" />
                <path d="m6 6 12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div
            :ref="bindCertViewport"
            class="relative min-h-0 flex-1 overflow-hidden bg-[#f3f4f6]"
          >
            <TestCertificate
              :data="certificateViewModel"
              class="absolute left-1/2 top-1/2 origin-center"
              :style="certFrameStyle"
            />
          </div>

          <div class="flex shrink-0 justify-end border-t border-[#ebebeb] px-5 py-4 sm:px-6">
            <button
              type="button"
              class="h-11 rounded-full bg-[#0a0a0a] px-6 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
              @click="closeResultModal"
            >
              Natijalarni ko'rish
            </button>
          </div>
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
.certificate-modal-inner,
.result-modal-inner {
  border-radius: 20px 20px 0 0;
}

@media (min-width: 640px) {
  .review-modal-inner,
  .report-modal-inner,
  .certificate-modal-inner,
  .result-modal-inner {
    border-radius: 20px;
  }
}
</style>
