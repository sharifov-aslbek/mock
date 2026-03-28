<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NRadio, NRadioGroup, NSpin } from 'naive-ui'
import MathAnswerInput from '@/components/MathAnswerInput.vue'
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
const pageErrorKey = ref('')
const remainingSeconds = ref(0)
const activeFreeAnswerId = ref(null)
const shouldPersistProgress = ref(true)
let timerIntervalId = null

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

const answeredCount = computed(() =>
  renderedQuestions.value.reduce((count, question) => {
    const answer = answers[question.id]

    if (question.type === 'FreeAnswer') {
      return count + (typeof answer === 'string' && answer.trim() ? 1 : 0)
    }

    return count + (answer ? 1 : 0)
  }, 0),
)

const serializedAnswers = computed(() =>
  JSON.stringify(
    renderedQuestions.value.reduce((result, question) => {
      const answer = answers[question.id]

      if (typeof answer === 'string') {
        if (answer.trim()) {
          result[question.id] = answer
        }
      } else if (answer !== undefined && answer !== null && answer !== '') {
        result[question.id] = answer
      }

      return result
    }, {}),
  ),
)

const clearAnswers = () => {
  for (const answerKey of Object.keys(answers)) {
    delete answers[answerKey]
  }

  activeFreeAnswerId.value = null
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

  Object.entries(savedProgress.answers || {}).forEach(([questionId, answer]) => {
    answers[questionId] = answer
  })

  activeFreeAnswerId.value = savedProgress.activeFreeAnswerId || null

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
    remainingSeconds: remainingSeconds.value,
    activeFreeAnswerId: activeFreeAnswerId.value,
    scrollY: window.scrollY,
    completed: false,
  })
}

const loadTest = async (testId) => {
  shouldPersistProgress.value = true
  clearAnswers()
  pageErrorKey.value = ''

  if (!testId) {
    testStore.clearCurrentTest()
    pageErrorKey.value = 'testPage.missingId'
    return
  }

  if (!authStore.isAuthenticated) {
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
  [serializedAnswers, remainingSeconds, activeFreeAnswerId],
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
  <main class="min-h-screen bg-[#f3efe8] text-black font-sans selection:bg-black selection:text-white">
    <div
      v-if="currentTest"
      class="fixed right-3 top-3 z-30 sm:right-6 sm:top-6"
    >
      <div class="rounded-[22px] bg-black px-4 py-2.5 text-center text-white shadow-[0_14px_36px_rgba(15,23,42,0.2)]">
        <p class="text-lg font-bold tracking-[0.12em] sm:text-[22px]">
          {{ formattedTimer }}
        </p>
      </div>
    </div>

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
                class="inline-flex items-center justify-center border-2 border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                {{ t('testPage.login') }}
              </RouterLink>

              <button
                v-else
                type="button"
                @click="loadTest(requestedTestId)"
                class="border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                {{ t('testPage.retry') }}
              </button>
            </div>
          </div>
        </div>

        <div
          v-else-if="currentTest"
          class="mx-auto max-w-[1080px] rounded-[28px] border border-black/8 bg-white px-5 pb-16 pt-8 shadow-[0_20px_64px_rgba(15,23,42,0.07)] sm:px-8 sm:pt-10"
        >
          <div class="border-b border-black/10 pb-7">
            <h1 class="text-2xl font-semibold tracking-tight text-black sm:text-[42px]">
              {{ currentTest.title || t('testPage.title') }}
            </h1>
            <p class="mt-3 text-[10px] font-normal uppercase tracking-[0.24em] text-black/40 sm:text-xs">
              {{ totalDurationMinutes }} {{ t('testPage.minutes') }} &bull; {{ totalQuestions }} {{ t('testPage.questionsLabel') }}
            </p>
          </div>

          <div class="my-8 flex items-center gap-4">
            <div class="h-px flex-1 bg-black/12"></div>
            <p class="text-[10px] font-normal uppercase tracking-[0.28em] text-black/35 sm:text-[11px]">
              {{ t('testPage.sectionTitle') }}
            </p>
            <div class="h-px flex-1 bg-black/12"></div>
          </div>

          <div class="space-y-12 pb-16">
            <div
              v-for="question in renderedQuestions"
              :key="question.id"
              class="question-block"
            >
              <div v-if="question.groupTitle" class="mb-4 border-l-[3px] border-black/70 pl-4">
                <p class="text-[10px] font-normal uppercase tracking-[0.16em] text-black/45">
                  {{ t('testPage.groupedTask') }}
                </p>
                <p class="mt-1.5 text-sm font-normal leading-6 text-black sm:text-base">
                  {{ question.groupTitle }}
                </p>
              </div>

              <div class="flex items-start gap-3 sm:gap-4">
                <span class="shrink-0 text-xl font-semibold leading-none text-black sm:text-2xl">
                  {{ question.displayIndex }}.
                </span>

                <div class="min-w-0 flex-1 space-y-4">
                  <h2 class="text-base font-normal leading-[1.75] text-black sm:text-[18px]">
                    {{ question.text }}
                  </h2>

                  <div v-if="question.imageUrl" class="rounded-[22px] border border-black/10 bg-[#faf8f4] p-3">
                    <img
                      :src="question.imageUrl"
                      :alt="t('testPage.imageAlt')"
                      class="max-h-[420px] w-full object-contain"
                    />
                  </div>

                  <div v-if="question.type === 'FreeAnswer'" class="max-w-2xl space-y-2.5">
                    <button
                      type="button"
                      @click="activeFreeAnswerId = question.id"
                      class="w-full rounded-[18px] border border-black/15 bg-[#faf8f4] px-4 py-4 text-left transition hover:border-black hover:bg-[#f6f2ea]"
                    >
                      <span class="block text-[10px] font-normal uppercase tracking-[0.14em] text-black/45">
                        {{ t('testPage.freeAnswerLabel') }}
                      </span>
                      <span
                        class="mt-2 block text-xs font-normal leading-6 sm:text-sm"
                        :class="answers[question.id] ? 'text-black' : 'text-black/35'"
                      >
                        {{
                          activeFreeAnswerId === question.id
                            ? t('testPage.mathInputOpen')
                            : answers[question.id]
                              ? t('testPage.answerSaved')
                              : t('testPage.freeAnswerPlaceholder')
                        }}
                      </span>
                    </button>

                    <MathAnswerInput
                      v-if="activeFreeAnswerId === question.id"
                      v-model="answers[question.id]"
                      :placeholder="t('testPage.freeAnswerPlaceholder')"
                      :preview-label="t('testPage.preview')"
                    />
                  </div>

                  <NRadioGroup
                    v-else
                    v-model:value="answers[question.id]"
                    class="block"
                  >
                    <div class="space-y-2.5">
                      <label
                        v-for="option in question.options"
                        :key="option.id"
                        class="group flex cursor-pointer items-center gap-2.5"
                      >
                        <span
                          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-black text-xs font-bold transition-all duration-200 group-hover:bg-black group-hover:text-white sm:h-9 sm:w-9 sm:text-sm"
                          :class="
                            answers[question.id] === option.id
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          "
                        >
                          {{ option.letter }}
                        </span>

                        <NRadio :value="option.id" class="test-radio">
                          <span class="text-[13px] font-normal leading-6 text-black sm:text-sm">
                            {{ option.text }}
                          </span>
                        </NRadio>
                      </label>
                    </div>
                  </NRadioGroup>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="h-24"></div>
      </div>

      <div
        v-if="currentTest"
        class="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-[#f3efe8]/95 backdrop-blur"
      >
        <div class="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p class="text-[10px] font-normal uppercase tracking-[0.18em] text-black/50 sm:text-xs">
            {{ answeredCount }} / {{ totalQuestions }} {{ t('testPage.answered') }}
          </p>

          <button
            type="button"
            @click="handleSubmitTest"
            class="rounded-[18px] bg-black px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition hover:bg-neutral-900 sm:px-8 sm:text-xs"
          >
            {{ t('testPage.submit') }}
          </button>
        </div>
      </div>
    </NSpin>
  </main>
</template>

<style scoped>
:deep(.n-radio) {
  align-items: center;
}

:deep(.test-radio .n-radio__dot-wrapper) {
  display: none !important;
}

:deep(.test-radio .n-radio__label) {
  padding-left: 0 !important;
}
</style>
  
