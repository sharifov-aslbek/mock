<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'
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

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const testProgressStore = useTestProgressStore()
const answers = reactive({})
const freeAnswers = reactive({})
const pageErrorKey = ref('')
const remainingSeconds = ref(0)
const timerDurationMs = ref(0)
const timerResetKey = ref(0)
const isReferenceOpen = ref(false)
const shouldPersistProgress = ref(true)
const activeAttemptId = ref(null)
let timerIntervalId = null
let autosaveIntervalId = null
let isSyncingAnswers = false
let isStartingAttempt = false
const dirtyQuestionIds = new Set()

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

const currentTest = computed(() => testStore.currentTest)

const questionGroupsById = computed(
  () =>
    new Map(
      (currentTest.value?.questionGroups || []).map((group) => [group.id, group]),
    ),
)

const renderedQuestionsById = computed(
  () => new Map(renderedQuestions.value.map((question) => [Number(question.id), question])),
)

const groupRenderModels = computed(() => {
  const models = new Map()

  for (const group of currentTest.value?.questionGroups || []) {
    const questions = getGroupedQuestions(group.id).map((question) => ({
      ...question,
      shouldSeparate: shouldSeparateGroupedQuestion(group.id, question.id),
      matchingOptions:
        question.type === 'Matching' ? getAvailableMatchingOptions(group.id, question.id) : [],
    }))

    models.set(group.id, {
      optionBank: getAvailableMatchingOptions(group.id),
      questions,
    })
  }

  return models
})

const renderedQuestions = computed(() => {
  const shownGroups = new Set()

  return (currentTest.value?.questions || []).map((question, index) => {
    const group = question.questionGroupId
      ? questionGroupsById.value.get(question.questionGroupId)
      : null
    const showGroupTitle = Boolean(group && !shownGroups.has(group.id))

    if (showGroupTitle) {
      shownGroups.add(group.id)
    }

    return {
      ...question,
      displayIndex: index + 1,
      groupTitle: showGroupTitle ? group.title : '',
    }
  })
})

const resolvedErrorMessage = computed(() => {
  if (pageErrorKey.value) {
    return t(pageErrorKey.value)
  }

  return testStore.errorMessage
})

const loginRoute = computed(() => ({
  path: '/login',
  query: {
    redirect: route.fullPath,
  },
}))

const isLoginRequired = computed(() => pageErrorKey.value === 'testPage.authRequired')

const totalQuestions = computed(() => renderedQuestions.value.length)

const totalDurationMinutes = computed(() => Number(totalQuestions.value || 0) * 2)

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

const answeredCount = computed(() =>
  renderedQuestions.value.reduce((count, question) => {
    if (question.type === 'FreeAnswer') {
      return count + (hasFreeAnswerContent(getResolvedFreeAnswer(question.id)) ? 1 : 0)
    }

    const answer = answers[question.id]
    return count + (answer ? 1 : 0)
  }, 0),
)

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
  const group = questionGroupsById.value.get(groupId)

  if (!group) {
    return []
  }

  return [...(group.questions || [])]
    .sort(
      (firstQuestion, secondQuestion) =>
        Number(firstQuestion.order) - Number(secondQuestion.order) ||
        Number(firstQuestion.id) - Number(secondQuestion.id),
    )
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
  const group = questionGroupsById.value.get(groupId)

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

const updateMatchingAnswer = (questionId, value) => {
  answers[questionId] = value ? Number(value) : ''
  dirtyQuestionIds.add(String(questionId))
}

const updateOptionAnswer = (questionId, value) => {
  answers[questionId] = value
  dirtyQuestionIds.add(String(questionId))
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
}

const toggleReferenceWindow = () => {
  isReferenceOpen.value = !isReferenceOpen.value
}

const closeReferenceWindow = () => {
  isReferenceOpen.value = false
}

const stopTimer = () => {
  if (timerIntervalId) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
}

const startTimer = (questionCount, initialRemainingSeconds = null) => {
  stopTimer()

  const durationInMinutes = Number(questionCount || 0) * 2
  const durationInSeconds =
    initialRemainingSeconds ?? Math.max(Math.floor(durationInMinutes * 60), 0)
  const durationInMilliseconds = Math.max(durationInSeconds, 0) * 1000
  const startedAt = Date.now()

  remainingSeconds.value = Math.ceil(durationInMilliseconds / 1000)
  timerDurationMs.value = durationInMilliseconds
  timerResetKey.value += 1

  timerIntervalId = window.setInterval(() => {
    const elapsedMilliseconds = Date.now() - startedAt
    const nextDurationMs = Math.max(durationInMilliseconds - elapsedMilliseconds, 0)

    remainingSeconds.value = Math.ceil(nextDurationMs / 1000)

    if (nextDurationMs <= 0) {
      stopTimer()
    }
  }, 1000)

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
    completed: false,
  })
}

const buildAnswerPayload = (questionId) => {
  const question = renderedQuestionsById.value.get(Number(questionId))

  if (!question || !activeAttemptId.value) {
    return null
  }

  if (question.type === 'FreeAnswer') {
    return {
      userTestAttemptId: Number(activeAttemptId.value),
      questionId: Number(question.id),
      selectedOptionId: null,
      textAnswer: extractTextAnswer(getResolvedFreeAnswer(question.id)),
    }
  }

  return {
    userTestAttemptId: Number(activeAttemptId.value),
    questionId: Number(question.id),
    selectedOptionId: answers[question.id] ? Number(answers[question.id]) : null,
    textAnswer: null,
  }
}

const syncDirtyAnswers = async () => {
  if (!activeAttemptId.value || !dirtyQuestionIds.size || isSyncingAnswers) {
    return
  }

  isSyncingAnswers = true

  const pendingQuestionIds = [...dirtyQuestionIds]
  dirtyQuestionIds.clear()

  try {
    const payloads = pendingQuestionIds.map(buildAnswerPayload).filter(Boolean)

    if (payloads.length) {
      await Promise.all(payloads.map((payload) => testStore.saveUserAnswer(payload)))
    }
  } catch (error) {
    pendingQuestionIds.forEach((questionId) => dirtyQuestionIds.add(String(questionId)))
    console.error(error)
  } finally {
    isSyncingAnswers = false
  }
}

const stopAutosaveLoop = () => {
  if (autosaveIntervalId) {
    clearInterval(autosaveIntervalId)
    autosaveIntervalId = null
  }
}

const startAutosaveLoop = () => {
  stopAutosaveLoop()

  autosaveIntervalId = window.setInterval(() => {
    void syncDirtyAnswers()
  }, 5000)
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
    persistCurrentProgress()
    return
  }

  try {
    isStartingAttempt = true
    const attempt = await testStore.startTestAttempt(test.id)
    activeAttemptId.value = Number(attempt.id)
    persistCurrentProgress()
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
    pageErrorKey.value = 'testPage.authRequired'
    return
  }

  if (Number(currentTest.value?.id) === Number(testId)) {
    if (!activeAttemptId.value && currentTest.value) {
      await ensureAttemptStarted(currentTest.value)
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
      stopAutosaveLoop()
      remainingSeconds.value = 0
      timerDurationMs.value = 0
      activeAttemptId.value = null
      return
    }

    startAutosaveLoop()
    const savedProgress = testProgressStore.getProgress(test.id)
    startTimer(test.questions?.length, savedProgress?.remainingSeconds ?? null)
    await restoreProgress(test.id)
    await ensureAttemptStarted(test)
  },
  {
    immediate: true,
  },
)

watch([serializedAnswers, remainingSeconds, activeAttemptId], () => {
  persistCurrentProgress()
})

const handleSubmitTest = async () => {
  shouldPersistProgress.value = false
  await syncDirtyAnswers()
  dirtyQuestionIds.clear()
  activeAttemptId.value = null

  if (currentTest.value?.id) {
    testProgressStore.clearProgress(currentTest.value.id)
  }

  await router.push('/math')
}

onMounted(() => {
  testProgressStore.hydrate()
  startAutosaveLoop()
})

onBeforeUnmount(() => {
  stopAutosaveLoop()
  void syncDirtyAnswers()
  persistCurrentProgress()
  stopTimer()
})
</script>

<template>
  <main class="font-sans-custom min-h-screen bg-[#f5f3ef] pb-[220px] pt-8 text-black selection:bg-black selection:text-white sm:pt-14">
    <TestFloatingTools
      v-if="currentTest"
      :reference-label="t('testPage.reference')"
      :timer-duration-ms="timerDurationMs"
      :timer-key="timerResetKey"
      @toggle-reference="toggleReferenceWindow"
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
      <div class="mx-auto max-w-[1280px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6 lg:py-8">
        <TestErrorState
          v-if="resolvedErrorMessage"
          :message="resolvedErrorMessage"
          :show-login="isLoginRequired"
          :login-route="loginRoute"
          :login-label="t('testPage.login')"
          :retry-label="t('testPage.retry')"
          @retry="loadTest(requestedTestId)"
        />

        <div
          v-else-if="currentTest"
          class="mx-auto min-h-[1056px] max-w-[920px] border border-[#e0ddd7] bg-white px-6 pb-20 pt-12 shadow-md ring-1 ring-[#ebe7e0] sm:px-12 sm:py-14 lg:px-16"
        >
          <div class="border-b border-[#e0ddd7] pb-8">
            <h1 class="font-serif-custom text-4xl font-normal tracking-[0.02em] text-[#1a1814]">
              {{ currentTest.title || t('testPage.title') }}
            </h1>
            <p class="font-mono-custom mt-3 text-sm font-normal uppercase tracking-[0.18em] text-[#8a857c]">
              {{ totalDurationMinutes }} {{ t('testPage.minutes') }} &bull; {{ totalQuestions }} {{ t('testPage.questionsLabel') }}
            </p>
          </div>

          <div class="my-10 flex items-center gap-4">
            <div class="h-px flex-1 bg-[#e0ddd7]"></div>
            <p class="font-mono-custom text-xs font-normal uppercase tracking-[0.2em] text-[#8a857c]">
              {{ t('testPage.sectionTitle') }}
            </p>
            <div class="h-px flex-1 bg-[#e0ddd7]"></div>
          </div>

          <div class="space-y-10 pb-4">
            <div
              v-for="question in renderedQuestions"
              :key="question.id"
              class="question-block"
            >
              <TestQuestionGroup
                v-if="question.questionGroupId && question.groupTitle"
                :title="question.groupTitle"
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

        <div v-else class="h-24"></div>
      </div>

      <TestBottomBar
        v-if="currentTest"
        :answered-count="answeredCount"
        :total-questions="totalQuestions"
        :answered-label="t('testPage.answered')"
        :submit-label="t('testPage.submit')"
        @submit="handleSubmitTest"
      />
    </NSpin>
  </main>
</template>

  
