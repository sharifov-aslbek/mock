<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'
import referenceImage1 from '@/assets/image1.png'
import referenceImage2 from '@/assets/image2.png'
import referenceImage3 from '@/assets/image3.png'
import MathAnswerInput from '@/components/MathAnswerInput.vue'
import TestReferenceWindow from '@/components/TestReferenceWindow.vue'
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
const isReferenceOpen = ref(false)
const shouldPersistProgress = ref(true)
let timerIntervalId = null

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

const formattedTimer = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const totalQuestions = computed(() => renderedQuestions.value.length)

const totalDurationMinutes = computed(() =>
  Math.max(totalQuestions.value * 2, 10),

  // har bir savol uchun 2 daqiqa, lekin jami kamida 10 daqiqa beriladi

  // 10 bu minimal uchun agar 2ta savol bolb 2*2=4 bolsa 10 boladi minimal
)

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
}

const updateOptionAnswer = (questionId, value) => {
  answers[questionId] = value
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

  const durationInSeconds =
    initialRemainingSeconds ?? Math.max(Number(questionCount || 0) * 120, 600)
  remainingSeconds.value = durationInSeconds

  timerIntervalId = window.setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0
      stopTimer()
      return
    }

    remainingSeconds.value -= 1
  }, 1000)
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
  const fullDurationSeconds = Math.max(totalQuestions.value * 120, 600)
  const hasMeaningfulProgress =
    Object.keys(savedAnswers).length > 0 || remainingSeconds.value < fullDurationSeconds

  if (!hasMeaningfulProgress) {
    testProgressStore.clearProgress(currentTest.value.id)
    return
  }

  testProgressStore.saveProgress({
    testId: currentTest.value.id,
    title: currentTest.value.title,
    subject: t('math.subjectValue'),
    questionCount: totalQuestions.value,
    answeredCount: answeredCount.value,
    answers: savedAnswers,
    freeAnswers: { ...freeAnswers },
    remainingSeconds: remainingSeconds.value,
    scrollY: window.scrollY,
    completed: false,
  })
}

const loadTest = async (testId) => {
  shouldPersistProgress.value = true
  clearAnswers()
  pageErrorKey.value = ''

  if (!testId) {
    closeReferenceWindow()
    testStore.clearCurrentTest()
    pageErrorKey.value = 'testPage.missingId'
    return
  }

  if (!authStore.isAuthenticated) {
    closeReferenceWindow()
    testStore.clearCurrentTest()
    pageErrorKey.value = 'testPage.authRequired'
    return
  }

  if (Number(currentTest.value?.id) === Number(testId)) {
    return
  }

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
      remainingSeconds.value = 0
      return
    }

    const savedProgress = testProgressStore.getProgress(test.id)
    startTimer(test.questions?.length, savedProgress?.remainingSeconds ?? null)
    await restoreProgress(test.id)
  },
  {
    immediate: true,
  },
)

watch(
  [serializedAnswers, remainingSeconds],
  () => {
    persistCurrentProgress()
  },
)

const handlePageLeave = () => {
  persistCurrentProgress()
}

const handleSubmitTest = async () => {
  shouldPersistProgress.value = false

  if (currentTest.value?.id) {
    testProgressStore.clearProgress(currentTest.value.id)
  }

  await router.push('/math')
}

onMounted(() => {
  testProgressStore.hydrate()
  window.addEventListener('beforeunload', handlePageLeave)
  window.addEventListener('pagehide', handlePageLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handlePageLeave)
  window.removeEventListener('pagehide', handlePageLeave)
  persistCurrentProgress()
  stopTimer()
})
</script>

<template>
  <main class="font-sans-custom min-h-screen bg-[#f5f3ef] pb-[220px] pt-8 text-black selection:bg-black selection:text-white sm:pt-14">
    <div
      v-if="currentTest"
      class="fixed right-3 top-3 z-30 flex items-start gap-3 sm:right-6 sm:top-6"
    >
      <button
        type="button"
        @click="toggleReferenceWindow"
        class="flex min-w-[94px] flex-col items-center rounded-[18px] border border-black/10 bg-white px-3 py-2 text-center shadow-[0_10px_28px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
      >
        <span class="font-serif-custom text-[26px] font-normal leading-none text-black">x²</span>
        <span class="font-mono-custom mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/85">
          {{ t('testPage.reference') }}
        </span>
      </button>

      <div class="rounded-[22px] bg-black px-4 py-2.5 text-center text-white shadow-[0_14px_36px_rgba(15,23,42,0.2)]">
        <p class="font-mono-custom text-lg font-bold tracking-[0.12em] sm:text-[22px]">
          {{ formattedTimer }}
        </p>
      </div>
    </div>

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
        <div
          v-if="resolvedErrorMessage"
          class="mx-auto max-w-3xl rounded-[22px] border border-black/10 bg-white p-4 shadow-sm"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-normal text-black">
              {{ resolvedErrorMessage }}
            </p>

            <div class="flex gap-3">
              <RouterLink
                v-if="isLoginRequired"
                :to="loginRoute"
                class="font-sans-custom inline-flex items-center justify-center border-2 border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
              >
                {{ t('testPage.login') }}
              </RouterLink>

              <button
                v-else
                type="button"
                @click="loadTest(requestedTestId)"
                class="font-sans-custom border-2 border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                {{ t('testPage.retry') }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-else-if="currentTest"
          class="mx-auto min-h-[1056px] max-w-[760px] border border-[#e0ddd7] bg-white px-6 pb-20 pt-12 shadow-md ring-1 ring-[#ebe7e0] sm:px-14 sm:py-14"
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
              <div
                v-if="question.questionGroupId && !question.groupTitle"
                class="hidden"
              ></div>

              <div
                v-else-if="question.questionGroupId && question.groupTitle"
                class="rounded-[20px] border border-[#e5ded3] bg-[#fffdfa] p-5 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:p-6"
              >
                <div class="border-l-[3px] border-[#5b5750] pl-4">
                  <p class="text-[15px] font-normal leading-[1.85] text-[#1a1814] sm:text-[16px]">
                    {{ question.groupTitle }}
                  </p>
                </div>

                <div
                  v-if="getAvailableMatchingOptions(question.questionGroupId).length"
                  class="mt-5 space-y-2"
                >
                  <p class="font-mono-custom text-[11px] font-normal uppercase tracking-[0.18em] text-[#8a857c]">
                    {{ t('testPage.optionBank') }}
                  </p>

                  <div class="space-y-2">
                    <div
                      v-for="option in getAvailableMatchingOptions(question.questionGroupId)"
                      :key="option.id"
                      class="flex items-center gap-4 rounded-[4px] bg-[#f5f3ef] px-4 py-2.5"
                    >
                      <span class="font-serif-custom min-w-[24px] shrink-0 text-[14px] font-normal text-[#1a1814] sm:text-[15px]">
                        {{ option.letter }}.
                      </span>
                      <span class="font-mono-custom text-[14px] font-normal text-[#1a1814] sm:text-[15px]">
                        {{ option.text }}
                      </span>
                    </div>
                  </div>

                </div>

                <div class="mt-6 space-y-6">
                  <div
                    v-for="groupQuestion in getGroupedQuestions(question.questionGroupId)"
                    :key="groupQuestion.id"
                    class="space-y-3"
                    :class="
                      shouldSeparateGroupedQuestion(question.questionGroupId, groupQuestion.id)
                        ? 'pt-6'
                        : ''
                    "
                  >
                    <div
                      v-if="groupQuestion.type === 'Matching'"
                      class="flex items-start gap-2.5 sm:gap-3"
                    >
                      <span class="font-mono-custom mr-1 min-w-[24px] shrink-0 pt-2.5 text-[17px] font-semibold leading-none text-[#1a1814]">
                        {{ groupQuestion.displayIndex }}.
                      </span>

                      <div class="relative shrink-0">
                        <select
                          :value="answers[groupQuestion.id] || ''"
                          @change="updateMatchingAnswer(groupQuestion.id, $event.target.value)"
                          class="font-mono-custom h-[40px] min-w-[78px] appearance-none rounded-[4px] border border-[#d1cec7] bg-white px-4 pr-9 text-[14px] font-normal text-[#1a1814] outline-none transition hover:border-[#b8b4ad] focus:border-[#1a1814]"
                        >
                          <option value="">
                            {{ t('testPage.selectOption') }}
                          </option>
                          <option
                            v-for="option in getAvailableMatchingOptions(question.questionGroupId, groupQuestion.id)"
                            :key="option.id"
                            :value="option.id"
                          >
                            {{ option.letter }}. {{ option.text }}
                          </option>
                        </select>
                        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#8a857c]">
                          ⌄
                        </span>
                      </div>

                      <div class="min-w-0 flex-1 space-y-2 pt-1.5">
                        <p class="text-[15px] font-normal leading-[1.8] text-[#1a1814] sm:text-[16px]">
                          {{ groupQuestion.text }}
                        </p>

                        <div
                          v-if="groupQuestion.imageUrl"
                          class="rounded-[22px] border border-black/10 bg-[#faf8f4] p-3"
                        >
                          <img
                            :src="groupQuestion.imageUrl"
                            :alt="t('testPage.imageAlt')"
                            class="max-h-[420px] w-full object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <div v-else class="flex items-start gap-3 sm:gap-4">
                      <span class="font-mono-custom mr-1 min-w-[24px] shrink-0 text-[17px] font-semibold leading-none text-[#1a1814]">
                        {{ groupQuestion.displayIndex }}.
                      </span>

                      <div class="min-w-0 flex-1 space-y-4">
                        <h2 class="text-[15px] font-normal leading-[1.8] text-[#1a1814] sm:text-[16px]">
                          {{ groupQuestion.text }}
                        </h2>

                        <div
                          v-if="groupQuestion.imageUrl"
                          class="rounded-[22px] border border-black/10 bg-[#faf8f4] p-3"
                        >
                          <img
                            :src="groupQuestion.imageUrl"
                            :alt="t('testPage.imageAlt')"
                            class="max-h-[420px] w-full object-contain"
                          />
                        </div>

                        <div v-if="groupQuestion.type === 'FreeAnswer'" class="max-w-[620px] space-y-3">
                          <label class="font-mono-custom block text-[11px] font-normal uppercase tracking-[0.16em] text-[#8a857c]">
                            {{ t('testPage.freeAnswerLabel') }}
                          </label>

                          <MathAnswerInput
                            :model-value="getResolvedFreeAnswer(groupQuestion.id)"
                            :placeholder="t('testPage.freeAnswerPlaceholder')"
                            :open-label="t('testPage.openMathInput')"
                            :close-label="t('testPage.closeMathInput')"
                            @update:model-value="updateFreeAnswer(groupQuestion.id, $event)"
                          />
                        </div>

                        <div v-else class="space-y-2.5">
                          <button
                            v-for="option in groupQuestion.options"
                            :key="option.id"
                            type="button"
                            @click="updateOptionAnswer(groupQuestion.id, option.id)"
                            class="group flex w-full max-w-[420px] items-center gap-4 text-left"
                          >
                            <span
                              class="font-mono-custom flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black text-[15px] font-medium transition-all duration-200 sm:h-10 sm:w-10 sm:text-base"
                              :class="
                                answers[groupQuestion.id] === option.id
                                  ? 'bg-black text-white'
                                  : 'bg-white text-black group-hover:bg-black group-hover:text-white'
                              "
                            >
                              {{ option.letter }}
                            </span>

                            <span
                              class="text-[15px] font-medium leading-[1.7] text-[#1a1814] sm:text-[16px]"
                              :class="answers[groupQuestion.id] === option.id ? 'text-black' : ''"
                            >
                              {{ option.text }}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="flex items-start gap-3 sm:gap-4">
                <span class="font-mono-custom mr-1 min-w-[24px] shrink-0 text-[17px] font-semibold leading-none text-[#1a1814]">
                  {{ question.displayIndex }}.
                </span>

                <div class="min-w-0 flex-1 space-y-4">
                  <h2 class="text-[15px] font-normal leading-[1.8] text-[#1a1814] sm:text-[16px]">
                    {{ question.text }}
                  </h2>

                  <div v-if="question.imageUrl" class="rounded-[22px] border border-black/10 bg-[#faf8f4] p-3">
                    <img
                      :src="question.imageUrl"
                      :alt="t('testPage.imageAlt')"
                      class="max-h-[420px] w-full object-contain"
                    />
                  </div>

                  <div v-if="question.type === 'FreeAnswer'" class="max-w-[620px] space-y-3">
                    <label class="font-mono-custom block text-[11px] font-normal uppercase tracking-[0.16em] text-[#8a857c]">
                      {{ t('testPage.freeAnswerLabel') }}
                    </label>

                    <MathAnswerInput
                      :model-value="getResolvedFreeAnswer(question.id)"
                      :placeholder="t('testPage.freeAnswerPlaceholder')"
                      :open-label="t('testPage.openMathInput')"
                      :close-label="t('testPage.closeMathInput')"
                      @update:model-value="updateFreeAnswer(question.id, $event)"
                    />
                  </div>

                  <div v-else class="space-y-2.5">
                    <button
                      v-for="option in question.options"
                      :key="option.id"
                      type="button"
                      @click="updateOptionAnswer(question.id, option.id)"
                      class="group flex w-full max-w-[420px] items-center gap-4 text-left"
                    >
                      <span
                        class="font-mono-custom flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black text-[15px] font-medium transition-all duration-200 sm:h-7 sm:w-7 sm:text-base"
                        :class="
                          answers[question.id] === option.id
                            ? 'bg-black text-white'
                            : 'bg-white text-black group-hover:bg-black group-hover:text-white'
                        "
                      >
                        {{ option.letter }}
                      </span>

                      <span
                        class="text-[15px] font-medium leading-[1.7] text-[#1a1814] sm:text-[16px]"
                        :class="answers[question.id] === option.id ? 'text-black' : ''"
                      >
                        {{ option.text }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="h-24"></div>
      </div>

      <div
        v-if="currentTest"
        class="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e0ddd7] bg-[#f5f3ef]/95 backdrop-blur"
      >
        <div class="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-4 sm:px-12">
          <p class="font-mono-custom text-sm font-normal uppercase tracking-[0.18em] text-[#8a857c]">
            {{ answeredCount }} / {{ totalQuestions }} {{ t('testPage.answered') }}
          </p>

          <button
            type="button"
            @click="handleSubmitTest"
            class="font-mono-custom rounded-[4px] bg-[#1a1814] px-8 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-black"
          >
            {{ t('testPage.submit') }}
          </button>
        </div>
      </div>
    </NSpin>
  </main>
</template>

  
