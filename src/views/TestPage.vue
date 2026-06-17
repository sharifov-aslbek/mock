<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { NCard, NModal, NSpin } from 'naive-ui'
import referenceImage1 from '@/assets/image1.png'
import referenceImage2 from '@/assets/image2.png'
import referenceImage3 from '@/assets/image3.png'
import TestReferenceWindow from '@/components/TestReferenceWindow.vue'
import TestBottomBar from '@/components/test/TestBottomBar.vue'
import TestErrorState from '@/components/test/TestErrorState.vue'
import TestFloatingTools from '@/components/test/TestFloatingTools.vue'
import TestQuestionBlock from '@/components/test/TestQuestionBlock.vue'
import TestQuestionGroup from '@/components/test/TestQuestionGroup.vue'
import { useAuthStore } from '@/stores/auth'
import { useTestStore } from '@/stores/test'
import { useTestProgressStore } from '@/stores/testProgress'
import { getTestApiBaseUrl } from '@/utils/api'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const testProgressStore = useTestProgressStore()
const answers = reactive({})
const freeAnswers = reactive({})
const pageErrorKey = ref('')
const remainingSeconds = ref(0)
const isReferenceOpen = ref(false)
const showSubmitModal = ref(false)
const showLeaveModal = ref(false)
let pendingNavigationCallback = null
const isSubmittingTest = ref(false)
const shouldPersistProgress = ref(true)
const activeAttemptId = ref(null)
let timerIntervalId = null
// Absolute wall-clock deadline (ms). Persisted so a reload/close resumes from
// real elapsed time instead of freezing the countdown.
let testDeadlineAt = null

// Prefer the saved absolute deadline; fall back to legacy remainingSeconds.
const resumeSecondsFromProgress = (progress) => {
  if (progress?.deadlineAt) {
    return Math.max(Math.floor((Number(progress.deadlineAt) - Date.now()) / 1000), 0)
  }
  return progress?.remainingSeconds ?? null
}
let isSyncingAnswers = false
let pendingSyncRequested = false
let isStartingAttempt = false
let isCompletingTest = ref(false)
const dirtyQuestionIds = new Set()
const ANSWER_ACTIONS_STORAGE_KEY = 'test_answer_actions'
const answerActions = ref([])
const confettiPieces = [
  { left: '-22px', top: '22px', color: '#ef4444', delay: '0s', rotate: '18deg' },
  { left: '-34px', top: '118px', color: '#f59e0b', delay: '0.18s', rotate: '-24deg' },
  { left: '-18px', top: '228px', color: '#10b981', delay: '0.32s', rotate: '42deg' },
  { left: '28px', top: '-22px', color: '#3b82f6', delay: '0.08s', rotate: '-12deg' },
  { right: '44px', top: '-26px', color: '#ec4899', delay: '0.24s', rotate: '34deg' },
  { right: '-24px', top: '48px', color: '#8b5cf6', delay: '0.14s', rotate: '-38deg' },
  { right: '-36px', top: '162px', color: '#22c55e', delay: '0.38s', rotate: '16deg' },
  { right: '-16px', top: '282px', color: '#f97316', delay: '0.28s', rotate: '-18deg' },
]

const referenceSheets = [
  {
    id: 1,
    title: 'Algebra',
    src: referenceImage1,
  },
  {
    id: 2,
    title: 'Geometry',
    src: referenceImage2,
  },
  {
    id: 3,
    title: 'Trigonometry',
    src: referenceImage3,
  },
]

const requestedTestId = computed(() => {
  if (typeof route.query.testId === 'string') {
    return route.query.testId
  }

  return ''
})

const shouldRestartTest = computed(() => route.query.restart === '1')

const currentTest = computed(() => testStore.currentTest)
const testApiBaseUrl = getTestApiBaseUrl()

const LANGUAGE_BY_LOCALE = {
  uz: 'Uzbek',
  ru: 'Russian',
}

const GROUP_SUBORDER_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

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

const buildEntityImageUrl = (imagePath) => {
  if (!imagePath) {
    return null
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath
  }

  if (!testApiBaseUrl) {
    return imagePath
  }

  try {
    return `${new URL(testApiBaseUrl).origin}/${String(imagePath).replace(/^\/+/, '')}`
  } catch {
    return imagePath
  }
}

const getEntityImageUrl = (entity) => {
  const translation = getLocalizedTranslation(entity)
  const imagePath = translation?.imagePath || entity?.imagePath || null

  return entity?.imageUrl || buildEntityImageUrl(imagePath)
}

const questionGroupsById = computed(
  () =>
    new Map(
      (currentTest.value?.questionGroups || []).map((group) => [Number(group.id), group]),
    ),
)

const renderedQuestionsById = computed(
  () => new Map(renderedQuestions.value.map((question) => [Number(question.id), question])),
)

const groupRenderModels = computed(() => {
  const models = new Map()

  for (const group of currentTest.value?.questionGroups || []) {
    const normalizedGroupId = Number(group.id)
    const groupedQuestions = getGroupedQuestions(normalizedGroupId)
    const distinctOrders = [
      ...new Set(
        groupedQuestions
          .map((question) => String(question.displayOrder || question.order || '').trim())
          .filter(Boolean),
      ),
    ]
    const useSharedGroupOrder = groupedQuestions.length > 1 && distinctOrders.length === 1
    // When sub-questions share an order we show that single number and label
    // sub-questions as a/b/c. When they have different orders we still want a
    // group header — fall back to the lowest order, or a range if there is
    // more than one.
    const numericOrders = distinctOrders
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .sort((firstOrder, secondOrder) => firstOrder - secondOrder)
    let orderLabel = ''
    if (useSharedGroupOrder) {
      orderLabel = distinctOrders[0]
    } else if (numericOrders.length > 1) {
      orderLabel = `${numericOrders[0]}-${numericOrders[numericOrders.length - 1]}`
    } else if (numericOrders.length === 1) {
      orderLabel = String(numericOrders[0])
    }
    const questions = groupedQuestions.map((question, index) => ({
      ...question,
      groupSubLabel: useSharedGroupOrder
        ? GROUP_SUBORDER_LETTERS[index] || String(index + 1)
        : question.showOrder
          ? String(question.displayOrder)
          : '',
      shouldSeparate: shouldSeparateGroupedQuestion(normalizedGroupId, question.id),
      matchingOptions:
        question.type === 'Matching'
          ? getAvailableMatchingOptions(normalizedGroupId, question.id)
          : [],
    }))

    models.set(normalizedGroupId, {
      orderLabel,
      optionBank: getAvailableMatchingOptions(normalizedGroupId),
      questions,
    })
  }

  return models
})




const renderedQuestions = computed(() => {
  const shownGroups = new Set()
  let previousOrderLabel = null

  // Backend may return questions in arbitrary order — sort ascending by
  // `order`, falling back to `id` so identical orders remain stable.
  const sortedQuestions = [...(currentTest.value?.questions || [])].sort(
    (firstQuestion, secondQuestion) => {
      const firstOrder = Number(firstQuestion.order)
      const secondOrder = Number(secondQuestion.order)
      const safeFirstOrder = Number.isFinite(firstOrder) ? firstOrder : Number.POSITIVE_INFINITY
      const safeSecondOrder = Number.isFinite(secondOrder) ? secondOrder : Number.POSITIVE_INFINITY
      if (safeFirstOrder !== safeSecondOrder) {
        return safeFirstOrder - safeSecondOrder
      }
      return Number(firstQuestion.id) - Number(secondQuestion.id)
    },
  )

  return sortedQuestions.map((question, index) => {
    const group = question.questionGroupId
      ? questionGroupsById.value.get(Number(question.questionGroupId))
      : null
    const normalizedOrder = Number(question.order)
    const displayOrder =
      Number.isFinite(normalizedOrder) && normalizedOrder > 0 ? normalizedOrder : index + 1
    const orderLabel = String(displayOrder)
    const showGroupBlock = Boolean(group && !shownGroups.has(Number(group.id)))
    const showOrder = orderLabel !== previousOrderLabel

    if (showGroupBlock) {
      shownGroups.add(Number(group.id))
    }

    previousOrderLabel = orderLabel

    return {
      ...question,
      displayOrder,
      showOrder,
      showGroupBlock,
      text: getEntityText(question),
      imageUrl: getEntityImageUrl(question),
      groupTitle: getEntityText(group),
      groupImageUrl: getEntityImageUrl(group),
    }
  })
})

const resolvedErrorMessage = computed(() => {
  if (pageErrorKey.value) {
    return t(pageErrorKey.value)
  }

  return testStore.errorMessage
})

const canAccessTest = computed(() => Boolean(currentTest.value))

// Bottom-bar count = the highest order in the test. A group's sub-questions
// share an order, so the user perceives them as part of one numbered slot
// (e.g. "savol 33" with parts a/b/c), not as separate questions.
const totalQuestions = computed(() => {
  let maxOrder = 0
  for (const question of renderedQuestions.value) {
    const order = Number(question.order)
    if (Number.isFinite(order) && order > maxOrder) {
      maxOrder = order
    }
  }
  return maxOrder || renderedQuestions.value.length
})

const TEST_DURATION_MINUTES = 60
const TEST_DURATION_SECONDS = TEST_DURATION_MINUTES * 60
const totalDurationMinutes = computed(() => TEST_DURATION_MINUTES)

const hasFreeAnswerContent = (value) => {
  if (typeof value !== 'string') {
    return false
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return false
  }

  if (/data-type=["']inline-math["']/i.test(normalizedValue)) {
    return true
  }

  const textContent = normalizedValue
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim()

  return Boolean(textContent)
}

const isQuestionAnswered = (question) => {
  if (question.type === 'FreeAnswer') {
    return hasFreeAnswerContent(getResolvedFreeAnswer(question.id))
  }
  return Boolean(answers[question.id])
}

// Order slot counts as answered when every sub-question sharing that order
// has a value — partial completion of a multi-part task doesn't tick the
// counter up.
const answeredCount = computed(() => {
  const buckets = new Map()
  for (const question of renderedQuestions.value) {
    const order = Number(question.order)
    if (!Number.isFinite(order)) continue
    if (!buckets.has(order)) buckets.set(order, [])
    buckets.get(order).push(question)
  }
  let count = 0
  for (const questions of buckets.values()) {
    if (questions.every(isQuestionAnswered)) {
      count += 1
    }
  }
  return count
})

const serializedAnswers = computed(() =>
  JSON.stringify(
    renderedQuestions.value.reduce((result, question) => {
      const answer =
        question.type === 'FreeAnswer'
          ? getResolvedFreeAnswer(question.id)
          : answers[question.id]

      if (typeof answer === 'string') {
        if (question.type === 'FreeAnswer' ? hasFreeAnswerContent(answer) : answer.trim()) {
          result[question.id] = answer
        }
      } else if (answer !== undefined && answer !== null && answer !== '') {
        result[question.id] = answer
      }

      return result
    }, {}),
  ),
)

const getResolvedFreeAnswer = (questionId) => {
  return typeof freeAnswers[questionId] === 'string' ? freeAnswers[questionId] : ''
}

const extractTextAnswer = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return ''
  }

  if (!normalizedValue.includes('<') || typeof document === 'undefined') {
    return normalizedValue
  }

  const container = document.createElement('div')
  container.innerHTML = normalizedValue

  container.querySelectorAll('[data-type="inline-math"]').forEach((node) => {
    const latexValue =
      node.getAttribute('data-latex') ||
      node.getAttribute('data-math-latex') ||
      node.getAttribute('data-math') ||
      node.textContent ||
      ''

    node.replaceWith(document.createTextNode(` ${latexValue} `))
  })

  return (container.textContent || '').replace(/\s+/g, ' ').trim()
}

const getGroupedQuestions = (groupId) => {
  const normalizedGroupId = Number(groupId)
  const group = questionGroupsById.value.get(normalizedGroupId)

  if (!group) {
    return []
  }

  const groupQuestions =
    Array.isArray(group.questions) && group.questions.length
      ? group.questions
      : (currentTest.value?.questions || []).filter(
          (question) => Number(question.questionGroupId) === normalizedGroupId,
        )

  return [...groupQuestions]
    .sort((firstQuestion, secondQuestion) => {
      const firstOrder = Number(firstQuestion.order)
      const secondOrder = Number(secondQuestion.order)
      const safeFirstOrder = Number.isFinite(firstOrder) ? firstOrder : Number.POSITIVE_INFINITY
      const safeSecondOrder = Number.isFinite(secondOrder) ? secondOrder : Number.POSITIVE_INFINITY
      if (safeFirstOrder !== safeSecondOrder) {
        return safeFirstOrder - safeSecondOrder
      }
      return Number(firstQuestion.id) - Number(secondQuestion.id)
    })
    .map((question) => {
      const renderedQuestion = renderedQuestionsById.value.get(Number(question.id))
      return renderedQuestion || question
    })
}

const shouldSeparateGroupedQuestion = (groupId, questionId) => {
  const groupedQuestions = getGroupedQuestions(groupId)
  const currentIndex = groupedQuestions.findIndex(
    (question) => Number(question.id) === Number(questionId),
  )

  if (currentIndex <= 0) {
    return false
  }

  const previousQuestion = groupedQuestions[currentIndex - 1]
  const currentQuestion = groupedQuestions[currentIndex]

  return previousQuestion?.type === 'Matching' && currentQuestion?.type !== 'Matching'
}

const getAvailableMatchingOptions = (groupId, currentQuestionId = null) => {
  const group = questionGroupsById.value.get(Number(groupId))

  if (!group) {
    return []
  }

  const takenOptionIds = new Set(
    getGroupedQuestions(groupId)
      .filter(
        (question) =>
          question.type === 'Matching' && Number(question.id) !== Number(currentQuestionId),
      )
      .map((question) => answers[question.id])
      .filter((value) => value !== undefined && value !== null && value !== ''),
  )

  return (group.options || []).filter(
    (option) =>
      !takenOptionIds.has(option.id) || Number(answers[currentQuestionId]) === Number(option.id),
  )
}

const normalizeStoredAnswerAction = (action) => {
  const testId = Number(action?.testId)
  const questionId = Number(action?.questionId)

  if (!testId || !questionId) {
    return null
  }

  return {
    testId,
    attemptId: action?.attemptId ? Number(action.attemptId) : null,
    questionId,
    selectedOptionId: Number(action?.selectedOptionId || 0),
    textAnswer: typeof action?.textAnswer === 'string' ? action.textAnswer : null,
    requestMethod: action?.requestMethod === 'PUT' ? 'PUT' : 'POST',
    hasCreatedRemoteRecord: Boolean(action?.hasCreatedRemoteRecord),
    isPending: action?.isPending !== false,
    createdAt: Number(action?.createdAt || Date.now()),
    updatedAt: Number(action?.updatedAt || Date.now()),
  }
}

const persistAnswerActions = () => {
  if (typeof window === 'undefined') {
    return
  }

  // window.localStorage.setItem(ANSWER_ACTIONS_STORAGE_KEY, JSON.stringify(answerActions.value))
}

const setAnswerActions = (nextActions) => {
  answerActions.value = nextActions
  // persistAnswerActions()
}

const hydrateAnswerActions = () => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const storedValue = null;

    if (!storedValue) {
      answerActions.value = []
      return
    }

    const parsedValue = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      setAnswerActions([])
      return
    }

    answerActions.value = parsedValue.map(normalizeStoredAnswerAction).filter(Boolean)
  } catch (error) {
    console.error(error)
    setAnswerActions([])
  }
}

const buildAnswerActionDraft = (questionId) => {
  const question = renderedQuestionsById.value.get(Number(questionId))

  if (!question || !currentTest.value?.id) {
    return null
  }

  if (question.type === 'FreeAnswer') {
    return {
      testId: Number(currentTest.value.id),
      attemptId: activeAttemptId.value ? Number(activeAttemptId.value) : null,
      questionId: Number(question.id),
      selectedOptionId: 0,
      textAnswer: extractTextAnswer(getResolvedFreeAnswer(question.id)),
    }
  }

  return {
    testId: Number(currentTest.value.id),
    attemptId: activeAttemptId.value ? Number(activeAttemptId.value) : null,
    questionId: Number(question.id),
    selectedOptionId: answers[question.id] ? Number(answers[question.id]) : 0,
    textAnswer: null,
  }
}

const upsertAnswerAction = (questionId) => {
  const draft = buildAnswerActionDraft(questionId)

  if (!draft) {
    return
  }

  const nextActions = [...answerActions.value]
  const existingActionIndex = nextActions.findIndex(
    (action) =>
      Number(action.testId) === Number(draft.testId) &&
      Number(action.questionId) === Number(draft.questionId),
  )
  const timestamp = Date.now()

  if (existingActionIndex < 0) {
    nextActions.push({
      ...draft,
      requestMethod: 'POST',
      hasCreatedRemoteRecord: false,
      isPending: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    setAnswerActions(nextActions)
    return
  }

  const existingAction = nextActions[existingActionIndex]

  nextActions[existingActionIndex] = {
    ...existingAction,
    ...draft,
    attemptId: draft.attemptId ?? existingAction.attemptId ?? null,
    requestMethod: existingAction.hasCreatedRemoteRecord ? 'PUT' : 'POST',
    isPending: true,
    updatedAt: timestamp,
  }

  setAnswerActions(nextActions)
}

const syncAnswerActionAttemptIds = () => {
  if (!currentTest.value?.id || !activeAttemptId.value) {
    return
  }

  const normalizedTestId = Number(currentTest.value.id)
  const normalizedAttemptId = Number(activeAttemptId.value)
  let hasChanges = false

  const nextActions = answerActions.value.map((action) => {
    if (Number(action.testId) !== normalizedTestId) {
      return action
    }

    if (Number(action.attemptId || 0) === normalizedAttemptId) {
      return action
    }

    hasChanges = true

    return {
      ...action,
      attemptId: normalizedAttemptId,
    }
  })

  if (hasChanges) {
    setAnswerActions(nextActions)
  }
}

const clearAnswerActionsForTest = (testId) => {
  if (!testId) {
    return
  }

  const normalizedTestId = Number(testId)

  setAnswerActions(
    answerActions.value.filter((action) => Number(action.testId) !== normalizedTestId),
  )
}

const updateMatchingAnswer = (questionId, value) => {
  answers[questionId] = value ? Number(value) : ''
  dirtyQuestionIds.add(String(questionId))
  upsertAnswerAction(questionId)
  void syncDirtyAnswers()
}

const updateOptionAnswer = (questionId, value) => {
  answers[questionId] = value
  dirtyQuestionIds.add(String(questionId))
  upsertAnswerAction(questionId)
  void syncDirtyAnswers()
}

const clearAnswers = () => {
  for (const answerKey of Object.keys(answers)) {
    delete answers[answerKey]
  }

  for (const answerKey of Object.keys(freeAnswers)) {
    delete freeAnswers[answerKey]
  }
}

const updateFreeAnswer = (questionId, value) => {
  freeAnswers[questionId] = value
  dirtyQuestionIds.add(String(questionId))
  upsertAnswerAction(questionId)
  void syncDirtyAnswers()
}

const toggleReferenceWindow = () => {
  isReferenceOpen.value = !isReferenceOpen.value
}

const closeReferenceWindow = () => {
  isReferenceOpen.value = false
}

const clearRestartQuery = async () => {
  if (!shouldRestartTest.value) {
    return
  }

  const nextQuery = { ...route.query }
  delete nextQuery.restart
  await router.replace({ query: nextQuery })
}

const stopTimer = () => {
  if (timerIntervalId) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
}

const startTimer = (_questionCount, initialRemainingSeconds = null) => {
  stopTimer()

  const resumeSeconds = Number(initialRemainingSeconds)
  const canResume = Number.isFinite(resumeSeconds) && resumeSeconds > 0
  const durationInSeconds = canResume ? resumeSeconds : TEST_DURATION_SECONDS
  const durationInMilliseconds = Math.max(durationInSeconds, 0) * 1000
  const startedAt = Date.now()
  testDeadlineAt = startedAt + durationInMilliseconds

  remainingSeconds.value = Math.max(Math.ceil(durationInMilliseconds / 1000), 0)

  if (durationInMilliseconds <= 0) {
    return durationInMilliseconds
  }

  const tick = () => {
    const elapsedMilliseconds = Date.now() - startedAt
    const nextDurationMs = Math.max(durationInMilliseconds - elapsedMilliseconds, 0)

    remainingSeconds.value = Math.max(Math.ceil(nextDurationMs / 1000), 0)

    if (nextDurationMs <= 0) {
      stopTimer()
      void autoSubmitOnTimeUp()
    }
  }

  timerIntervalId = window.setInterval(tick, 1000)
  tick()

  return durationInMilliseconds
}

const restoreProgress = async (testId) => {
  const savedProgress = testProgressStore.getProgress(testId)

  if (!savedProgress) {
    return
  }

  renderedQuestions.value.forEach((question) => {
    const questionId = String(question.id)

    if (question.type === 'FreeAnswer') {
      const savedFreeAnswer =
        savedProgress.freeAnswers?.[questionId] ||
        savedProgress.mathAnswers?.[questionId] ||
        savedProgress.textAnswers?.[questionId] ||
        (typeof savedProgress.answers?.[questionId] === 'string'
          ? savedProgress.answers[questionId]
          : '')

      if (typeof savedFreeAnswer === 'string' && savedFreeAnswer.trim()) {
        freeAnswers[questionId] = savedFreeAnswer
      }

      return
    }

    const savedAnswer = savedProgress.answers?.[questionId]

    if (savedAnswer !== undefined && savedAnswer !== null && savedAnswer !== '') {
      answers[questionId] = savedAnswer
    }
  })

  await nextTick()

  if (typeof savedProgress.scrollY === 'number') {
    window.scrollTo({
      top: savedProgress.scrollY,
      behavior: 'auto',
    })
  }
}

const restoreProgressFromApi = async (testId) => {
  if (!testId) {
    return
  }

  let progress = null

  try {
    progress = await testStore.fetchTestProgress(testId)
  } catch (error) {
    console.error(error)
    return
  }

  if (!progress || !progress.id) {
    return
  }

  activeAttemptId.value = Number(progress.id)
  syncAnswerActionAttemptIds()

  const userAnswers = Array.isArray(progress.userAnswers) ? progress.userAnswers : []

  for (const userAnswer of userAnswers) {
    const normalizedQuestionId = Number(userAnswer?.questionId)

    if (!normalizedQuestionId) {
      continue
    }

    const questionKey = String(normalizedQuestionId)
    const question = renderedQuestionsById.value.get(normalizedQuestionId)

    if (question?.type === 'FreeAnswer') {
      if (typeof userAnswer.textAnswer === 'string' && userAnswer.textAnswer.trim()) {
        freeAnswers[questionKey] = userAnswer.textAnswer
      }
      continue
    }

    const selectedOptionId = Number(userAnswer?.selectedOptionId || 0)

    if (selectedOptionId > 0) {
      answers[questionKey] = selectedOptionId
    }
  }
}

const persistCurrentProgress = () => {
  if (!shouldPersistProgress.value || !currentTest.value) {
    return
  }

  const savedAnswers = JSON.parse(serializedAnswers.value)
  const hasMeaningfulProgress =
    Boolean(activeAttemptId.value) ||
    Object.keys(savedAnswers).length > 0 ||
    remainingSeconds.value > 0

  if (!hasMeaningfulProgress) {
    testProgressStore.clearProgress(currentTest.value.id)
    return
  }

  testProgressStore.saveProgress({
    testId: currentTest.value.id,
    attemptId: activeAttemptId.value,
    title: currentTest.value.title,
    subject: t('math.subjectValue'),
    questionCount: totalQuestions.value,
    answeredCount: answeredCount.value,
    answers: savedAnswers,
    freeAnswers: { ...freeAnswers },
    remainingSeconds: remainingSeconds.value,
    deadlineAt: testDeadlineAt,
    completed: false,
  })
}

const buildCreateAnswerPayload = (action) => {
  if (!action?.attemptId) {
    return null
  }

  return {
    userTestAttemptId: Number(action.attemptId),
    questionId: Number(action.questionId),
    selectedOptionId: Number(action.selectedOptionId || 0),
    textAnswer: typeof action.textAnswer === 'string' ? action.textAnswer : null,
  }
}

const buildUpdateAnswerPayload = (action) => {
  return {
    userTestAttemptId: Number(action.attemptId || 0),
    questionId: Number(action.questionId),
    selectedOptionId: Number(action.selectedOptionId || 0),
    textAnswer: typeof action.textAnswer === 'string' ? action.textAnswer : null,
  }
}

const markAnswerActionAsSynced = (syncedAction, syncedUpdatedAt) => {
  const nextActions = answerActions.value.map((action) => {
    if (
      Number(action.testId) !== Number(syncedAction.testId) ||
      Number(action.questionId) !== Number(syncedAction.questionId)
    ) {
      return action
    }

    const wasEditedDuringSync = Number(action.updatedAt) !== Number(syncedUpdatedAt)

    return {
      ...action,
      attemptId: syncedAction.attemptId ?? action.attemptId ?? null,
      hasCreatedRemoteRecord: true,
      requestMethod: 'PUT',
      isPending: wasEditedDuringSync,
    }
  })

  setAnswerActions(nextActions)

  const latestAction = nextActions.find(
    (action) =>
      Number(action.testId) === Number(syncedAction.testId) &&
      Number(action.questionId) === Number(syncedAction.questionId),
  )

  if (latestAction && !latestAction.isPending) {
    dirtyQuestionIds.delete(String(syncedAction.questionId))
  }
}

const syncDirtyAnswers = async () => {
  if (!activeAttemptId.value || !currentTest.value?.id) {
    return
  }

  // A sync is already running; queue one more pass so the latest edit is sent.
  if (isSyncingAnswers) {
    pendingSyncRequested = true
    return
  }

  syncAnswerActionAttemptIds()

  const pendingActions = answerActions.value.filter(
    (action) => Number(action.testId) === Number(currentTest.value.id) && action.isPending,
  )

  if (!pendingActions.length) {
    return
  }

  isSyncingAnswers = true

  try {
    for (const action of pendingActions) {
      try {
        const syncedUpdatedAt = action.updatedAt
        const requestMethod =
          action.hasCreatedRemoteRecord || action.requestMethod === 'PUT' ? 'PUT' : 'POST'
        const payload =
          requestMethod === 'PUT'
            ? buildUpdateAnswerPayload(action)
            : buildCreateAnswerPayload(action)

        if (!payload) {
          continue
        }

        if (requestMethod === 'PUT') {
          await testStore.updateUserAnswer(payload)
        } else {
          await testStore.createUserAnswer(payload)
        }

        markAnswerActionAsSynced(action, syncedUpdatedAt)
      } catch (error) {
        dirtyQuestionIds.add(String(action.questionId))
        console.error(error)
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    isSyncingAnswers = false
  }

  if (pendingSyncRequested) {
    pendingSyncRequested = false
    void syncDirtyAnswers()
  }
}

const ensureAttemptStarted = async (test) => {
  if (!test?.id) {
    activeAttemptId.value = null
    return
  }

  if (isStartingAttempt || activeAttemptId.value) {
    return
  }

  const savedProgress = testProgressStore.getProgress(test.id)

  if (savedProgress?.attemptId) {
    activeAttemptId.value = Number(savedProgress.attemptId)
    syncAnswerActionAttemptIds()
    persistCurrentProgress()
    void syncDirtyAnswers()
    return
  }

  try {
    isStartingAttempt = true
    const attempt = await testStore.startTestAttempt(test.id)
    activeAttemptId.value = Number(attempt.id)
    syncAnswerActionAttemptIds()
    persistCurrentProgress()
    void syncDirtyAnswers()
  } catch (error) {
    console.error(error)
  } finally {
    isStartingAttempt = false
  }
}

const loadTest = async (testId) => {
  shouldPersistProgress.value = true
  pageErrorKey.value = ''
  testStore.clearError()

  if (!testId) {
    clearAnswers()
    activeAttemptId.value = null
    dirtyQuestionIds.clear()
    closeReferenceWindow()
    testStore.clearCurrentTest()
    pageErrorKey.value = 'testPage.missingId'
    return
  }

  if (!authStore.isAuthenticated) {
    clearAnswers()
    activeAttemptId.value = null
    dirtyQuestionIds.clear()
    closeReferenceWindow()
    testStore.clearCurrentTest()
    shouldPersistProgress.value = false
    await router.replace({
      path: '/login',
      query: { reason: 'auth-required', redirect: route.fullPath },
    })
    return
  }

  if (Number(currentTest.value?.id) === Number(testId)) {
    if (shouldRestartTest.value && currentTest.value) {
      clearAnswers()
      activeAttemptId.value = null
      dirtyQuestionIds.clear()
      testProgressStore.clearProgress(testId)
      clearAnswerActionsForTest(testId)
      const savedProgress = testProgressStore.getProgress(testId)
      const questionCount = totalQuestions.value || Number(currentTest.value.questions?.length || 0)
      startTimer(questionCount, null)
      await ensureAttemptStarted(currentTest.value)
      await clearRestartQuery()
      return
    }

    if (!activeAttemptId.value && currentTest.value) {
      const savedProgress = testProgressStore.getProgress(testId)
      await ensureAttemptStarted(currentTest.value)
      const questionCount = totalQuestions.value || Number(currentTest.value.questions?.length || 0)
      startTimer(questionCount, resumeSecondsFromProgress(savedProgress))
    }
    return
  }

  clearAnswers()
  activeAttemptId.value = null
  dirtyQuestionIds.clear()
  testStore.clearCurrentTest()

  try {
    await testStore.fetchTestById(testId)
  } catch (error) {
    console.error(error)
  }
}

const enterFullscreen = async () => {
  if (typeof document === 'undefined' || document.fullscreenElement) {
    return
  }

  const element = document.documentElement
  const request =
    element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen

  if (typeof request !== 'function') {
    return
  }

  try {
    await request.call(element)
  } catch (error) {
    console.error(error)
  }
}

const exitFullscreen = () => {
  if (typeof document === 'undefined' || !document.fullscreenElement) {
    return
  }

  const exit =
    document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen

  if (typeof exit !== 'function') {
    return
  }

  try {
    void exit.call(document)
  } catch (error) {
    console.error(error)
  }
}

function removeFullscreenGestureListeners() {
  if (typeof window === 'undefined') {
    return
  }

  window.removeEventListener('pointerdown', handleFullscreenGesture)
  window.removeEventListener('keydown', handleFullscreenGesture)
}

const handleFullscreenGesture = () => {
  removeFullscreenGestureListeners()
  void enterFullscreen()
}

const finishTestAndGoToExplanation = async () => {
  await syncDirtyAnswers()
  stopTimer()
  teardownFullscreen()
  showSubmitModal.value = false

  await router.push({
    name: 'explanation',
    query: {
      testId: currentTest.value.id,
      attemptId: activeAttemptId.value,
      readyToSubmit: '1',
    },
  })
}

// Browsers only allow fullscreen from a user gesture, so try immediately and
// fall back to entering on the test taker's first interaction with the page.
const armFullscreen = () => {
  if (typeof window === 'undefined') {
    return
  }

  void enterFullscreen()
  removeFullscreenGestureListeners()
  window.addEventListener('pointerdown', handleFullscreenGesture)
  window.addEventListener('keydown', handleFullscreenGesture)
}

const handleFullscreenChange = () => {
  if (!currentTest.value || isCompletingTest.value) {
    return
  }

  if (!document.fullscreenElement) {
    armFullscreen()
  }
}

const setupFullscreen = () => {
  if (typeof window === 'undefined') {
    return
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)
  armFullscreen()
}

const teardownFullscreen = () => {
  if (typeof window === 'undefined') {
    return
  }

  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  removeFullscreenGestureListeners()
  exitFullscreen()
}

// True whenever the test is loaded and the user has not finished it. We do
// NOT require an active attempt id — the API call that creates it can be
// in-flight when the user hits refresh, and we still want the browser's
// native "Leave site?" dialog to appear in that window.
const shouldBlockNavigation = computed(
  () => Boolean(currentTest.value) && !isCompletingTest.value && !isSubmittingTest.value,
)

const handleBeforeUnload = (event) => {
  if (!shouldBlockNavigation.value) {
    return undefined
  }
  // Modern browsers ignore custom text and show their own dialog — we just
  // need to set returnValue to trigger it.
  event.preventDefault()
  event.returnValue = ''
  return ''
}

const confirmLeave = () => {
  showLeaveModal.value = false
  const callback = pendingNavigationCallback
  pendingNavigationCallback = null
  if (typeof callback === 'function') {
    callback()
  }
}

const cancelLeave = () => {
  showLeaveModal.value = false
  const callback = pendingNavigationCallback
  pendingNavigationCallback = null
  if (typeof callback === 'function') {
    callback(false)
  }
}

onBeforeRouteLeave((_to, _from, next) => {
  if (!shouldBlockNavigation.value) {
    next()
    return
  }
  pendingNavigationCallback = next
  showLeaveModal.value = true
})

watch(
  requestedTestId,
  (testId) => {
    void loadTest(testId)
  },
  {
    immediate: true,
  },
)

watch(
  currentTest,
  async (test) => {
    if (!test) {
      closeReferenceWindow()
      stopTimer()
      teardownFullscreen()
      remainingSeconds.value = 0
      activeAttemptId.value = null
      return
    }

    setupFullscreen()
    const savedProgress = testProgressStore.getProgress(test.id)
    const shouldStartFresh = shouldRestartTest.value

    if (shouldStartFresh) {
      clearAnswers()
      activeAttemptId.value = null
      dirtyQuestionIds.clear()
      testProgressStore.clearProgress(test.id)
      clearAnswerActionsForTest(test.id)
    }

    const questionCount = totalQuestions.value || Number(test.questions?.length || 0)
    startTimer(questionCount, shouldStartFresh ? null : resumeSecondsFromProgress(savedProgress))

    if (!shouldStartFresh) {
      await restoreProgress(test.id)
      await restoreProgressFromApi(test.id)
    }

    await ensureAttemptStarted(test)
    await clearRestartQuery()
  },
  {
    immediate: true,
  },
)

watch([serializedAnswers, remainingSeconds, activeAttemptId], () => {
  persistCurrentProgress()
})

const handleSubmitTest = () => {
  showSubmitModal.value = true
}

const closeSubmitModal = () => {
  if (isSubmittingTest.value) {
    return
  }

  showSubmitModal.value = false
}

const confirmSubmitTest = async () => {
  if (isSubmittingTest.value) {
    return
  }

  if (!currentTest.value?.id || !activeAttemptId.value) {
    showSubmitModal.value = false
    return
  }

  isSubmittingTest.value = true
  isCompletingTest.value = true

  try {
    await finishTestAndGoToExplanation()
  } catch (error) {
    console.error(error)
    isCompletingTest.value = false
  } finally {
    isSubmittingTest.value = false
  }
}

async function autoSubmitOnTimeUp() {
  if (
    isSubmittingTest.value ||
    isCompletingTest.value ||
    !currentTest.value?.id ||
    !activeAttemptId.value
  ) {
    return
  }

  isSubmittingTest.value = true
  isCompletingTest.value = true
  showSubmitModal.value = false

  try {
    await finishTestAndGoToExplanation()
  } catch (error) {
    console.error(error)
    isCompletingTest.value = false
  } finally {
    isSubmittingTest.value = false
  }
}

onMounted(() => {
  testProgressStore.hydrate()
  hydrateAnswerActions()
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
})

onBeforeUnmount(() => {
  void syncDirtyAnswers()
  persistCurrentProgress()
  stopTimer()
  teardownFullscreen()
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})
</script>

<template>
  <main class="font-sans-custom min-h-screen bg-[#f5f3ef] pb-[190px] pt-2 text-black selection:bg-black selection:text-white sm:pb-[220px] sm:pt-6">

    <TestFloatingTools
      v-if="currentTest"
      :remaining-seconds="remainingSeconds"
    />


    <TestReferenceWindow
      v-if="currentTest && isReferenceOpen"
      :drag-label="t('testPage.dragHere')"
      :shrink-label="t('testPage.referenceShrink')"
      :grow-label="t('testPage.referenceGrow')"
      :close-label="t('testPage.referenceClose')"
      :sheet-alt-label="t('testPage.referenceSheetAlt')"
      :sheets="referenceSheets"
      @close="closeReferenceWindow"
    />

    <NSpin :show="testStore.isLoading">
      <div class="mx-auto max-w-[1280px] px-3 py-2 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
        <TestErrorState
          v-if="resolvedErrorMessage"
          :message="resolvedErrorMessage"
          :retry-label="t('testPage.retry')"
          @retry="loadTest(requestedTestId)"
        />

        <div
          v-else-if="canAccessTest"
          class="mx-auto max-w-[1040px]"
        >
          <button
            type="button"
            @click="toggleReferenceWindow"
            class="mb-3 inline-flex h-11 items-center justify-center gap-2 self-start rounded-full border border-[#e0ddd7] bg-white/95 px-4 text-center shadow-[0_4px_14px_rgba(15,23,42,0.05)] lg:fixed lg:left-2 lg:top-1/2 lg:z-20 lg:mb-0 lg:h-[168px] lg:w-[72px] lg:-translate-y-1/2 lg:flex-col lg:justify-between lg:gap-0 lg:rounded-[20px] lg:px-2.5 lg:py-4 xl:left-3"
          >
            <span class="font-serif-custom text-[20px] font-normal leading-none text-[#1a1814] lg:text-[28px]">
              x²
            </span>
            <span class="font-mono-custom text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a1814] lg:text-[9px] lg:[writing-mode:vertical-rl] lg:[text-orientation:mixed]">
              {{ t('testPage.reference') }}
            </span>
          </button>

          <div
            class="mx-auto min-h-[calc(100vh-11rem)] max-w-[920px] overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white px-4 pb-14 pt-5 shadow-[0_14px_40px_rgba(26,24,20,0.06)] ring-1 ring-[#ebe7e0] sm:min-h-[1056px] sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-16 lg:pb-20 lg:pt-12"
          >
            <div class="border-b border-[#e0ddd7] pb-5 sm:pb-8">
              <h1 class="font-serif-custom text-[2rem] font-normal leading-[0.96] tracking-[0.01em] text-[#1a1814] sm:text-[2.55rem] lg:text-4xl">
                {{ currentTest.title || t('testPage.title') }}
              </h1>
              <p class="font-mono-custom mt-3 text-[11px] font-normal uppercase tracking-[0.18em] text-[#8a857c] sm:text-sm">
                {{ totalDurationMinutes }} {{ t('testPage.minutes') }} &bull; {{ totalQuestions }} {{ t('testPage.questionsLabel') }}
              </p>
            </div>

            <div class="my-6 flex items-center gap-3 sm:my-10 sm:gap-4">
              <div class="h-px flex-1 bg-[#e0ddd7]"></div>
              <p class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.22em] text-[#8a857c] sm:text-xs">
                {{ t('testPage.sectionTitle') }}
              </p>
              <div class="h-px flex-1 bg-[#e0ddd7]"></div>
            </div>

            <div class="space-y-8 pb-3 sm:space-y-10 sm:pb-4">
              <div
                v-for="question in renderedQuestions"
                :key="question.id"
                class="question-block"
              >
                <TestQuestionGroup
                  v-if="question.questionGroupId && question.showGroupBlock"
                  :title="question.groupTitle"
                  :image-url="question.groupImageUrl"
                  :order-label="groupRenderModels.get(question.questionGroupId)?.orderLabel || ''"
                  :option-bank="groupRenderModels.get(question.questionGroupId)?.optionBank || []"
                  :questions="groupRenderModels.get(question.questionGroupId)?.questions || []"
                  :selected-answers="answers"
                  :resolve-free-answer="getResolvedFreeAnswer"
                  :image-alt="t('testPage.imageAlt')"
                  :option-bank-label="t('testPage.optionBank')"
                  :select-option-label="t('testPage.selectOption')"
                  :free-answer-label="t('testPage.freeAnswerLabel')"
                  :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
                  :open-math-label="t('testPage.openMathInput')"
                  :close-math-label="t('testPage.closeMathInput')"
                  @update-matching-answer="updateMatchingAnswer"
                  @update-option="updateOptionAnswer"
                  @update-free-answer="updateFreeAnswer"
                />

                <TestQuestionBlock
                  v-else-if="!question.questionGroupId"
                  :question="question"
                  :selected-answer="answers[question.id]"
                  :free-answer-value="getResolvedFreeAnswer(question.id)"
                  :image-alt="t('testPage.imageAlt')"
                  :free-answer-label="t('testPage.freeAnswerLabel')"
                  :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
                  :open-math-label="t('testPage.openMathInput')"
                  :close-math-label="t('testPage.closeMathInput')"
                  @update-option="updateOptionAnswer"
                  @update-free-answer="updateFreeAnswer"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="h-24"></div>
      </div>

      <TestBottomBar
        v-if="canAccessTest"
        :answered-count="answeredCount"
        :total-questions="totalQuestions"
        :answered-label="t('testPage.answered')"
        :submit-label="t('testPage.finish')"
        @submit="handleSubmitTest"
      />
    </NSpin>

    <NModal
      v-model:show="showSubmitModal"
      :mask-closable="!isSubmittingTest"
      :close-on-esc="!isSubmittingTest"
    >
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div>
              <h4 class="text-xl font-bold tracking-tight text-black">
                {{ t('testPage.submitConfirmTitle') }}
              </h4>
            </div>

            <div class="flex justify-center gap-3">
              <button
                type="button"
                @click="closeSubmitModal"
                :disabled="isSubmittingTest"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
              >
                {{ t('testPage.submitConfirmNo') }}
              </button>

              <button
                type="button"
                @click="confirmSubmitTest"
                :disabled="isSubmittingTest"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:bg-black"
              >
                {{ t('testPage.submitConfirmYes') }}
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>

    <NModal
      v-model:show="showLeaveModal"
      :mask-closable="false"
      :close-on-esc="false"
      @update:show="(value) => { if (!value) cancelLeave() }"
    >
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div class="space-y-2">
              <h4 class="text-xl font-bold tracking-tight text-black">
                {{ t('testPage.leaveConfirmTitle') }}
              </h4>
              <p class="text-sm text-[#6b6760]">
                {{ t('testPage.leaveConfirm') }}
              </p>
            </div>

            <div class="flex justify-center gap-3">
              <button
                type="button"
                @click="cancelLeave"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98]"
              >
                {{ t('testPage.leaveConfirmStay') }}
              </button>

              <button
                type="button"
                @click="confirmLeave"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
              >
                {{ t('testPage.leaveConfirmLeave') }}
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>

  </main>
</template>

<style scoped>
.submit-confetti-piece {
  pointer-events: none;
  position: absolute;
  z-index: 1;
  height: 18px;
  width: 8px;
  border-radius: 999px;
  animation: submit-confetti-float 1.4s ease-in-out infinite alternate;
  box-shadow: 0 8px 18px rgba(26, 24, 20, 0.14);
}

.submit-confetti-pop {
  animation: submit-confetti-pop 1.5s ease-in-out infinite;
}

@keyframes submit-confetti-float {
  from {
    opacity: 0.72;
    translate: 0 0;
  }

  to {
    opacity: 1;
    translate: 0 -16px;
  }
}

@keyframes submit-confetti-pop {
  0%,
  100% {
    opacity: 0.25;
    scale: 0.9;
  }

  50% {
    opacity: 0.55;
    scale: 1.08;
  }
}
</style>
