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
      class="fixed right-4 top-4 z-30 sm:right-8 sm:top-8"
    >
      <div class="rounded-[26px] bg-black px-6 py-4 text-center text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)]">
        <p class="text-xl font-black tracking-[0.14em] sm:text-[28px]">
          {{ formattedTimer }}
        </p>
      </div>
    </div>

    <NSpin :show="testStore.isLoading">
      <div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div
          v-if="resolvedErrorMessage"
          class="mx-auto max-w-3xl rounded-[28px] border border-black/10 bg-white p-5 shadow-sm"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-medium text-black">
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
          class="mx-auto max-w-5xl rounded-[34px] border border-black/8 bg-white px-6 pb-20 pt-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:pt-14"
        >
          <div class="border-b border-black/10 pb-10">
            <h1 class="text-3xl font-bold tracking-tight text-black sm:text-5xl">
              {{ currentTest.title || t('testPage.title') }}
            </h1>
            <p class="mt-5 text-xs font-normal uppercase tracking-[0.28em] text-black/40 sm:text-sm">
              {{ totalDurationMinutes }} {{ t('testPage.minutes') }} &bull; {{ totalQuestions }} {{ t('testPage.questionsLabel') }}
            </p>
          </div>

          <div class="my-12 flex items-center gap-5">
            <div class="h-px flex-1 bg-black/12"></div>
            <p class="text-[11px] font-normal uppercase tracking-[0.32em] text-black/35 sm:text-xs">
              {{ t('testPage.sectionTitle') }}
            </p>
            <div class="h-px flex-1 bg-black/12"></div>
          </div>

          <div class="space-y-16 pb-20">
            <div
              v-for="question in renderedQuestions"
              :key="question.id"
              class="question-block"
            >
              <div v-if="question.groupTitle" class="mb-6 border-l-4 border-black/70 pl-5">
                <p class="text-[11px] font-normal uppercase tracking-[0.2em] text-black/45">
                  {{ t('testPage.groupedTask') }}
                </p>
                <p class="mt-2 text-base font-normal leading-7 text-black sm:text-lg">
                  {{ question.groupTitle }}
                </p>
              </div>

              <div class="flex items-start gap-4 sm:gap-6">
                <span class="shrink-0 text-2xl font-semibold leading-none text-black sm:text-3xl">
                  {{ question.displayIndex }}.
                </span>

                <div class="min-w-0 flex-1 space-y-6">
                  <h2 class="text-lg font-normal leading-[1.8] text-black sm:text-[21px]">
                    {{ question.text }}
                  </h2>

                  <div v-if="question.imageUrl" class="rounded-[28px] border border-black/10 bg-[#faf8f4] p-4">
                    <img
                      :src="question.imageUrl"
                      :alt="t('testPage.imageAlt')"
                      class="max-h-[420px] w-full object-contain"
                    />
                  </div>

                  <div v-if="question.type === 'FreeAnswer'" class="max-w-3xl space-y-3">
                    <button
                      type="button"
                      @click="activeFreeAnswerId = question.id"
                      class="w-full rounded-[24px] border border-black/15 bg-[#faf8f4] px-5 py-5 text-left transition hover:border-black hover:bg-[#f6f2ea]"
                    >
                      <span class="block text-[11px] font-normal uppercase tracking-[0.16em] text-black/45">
                        {{ t('testPage.freeAnswerLabel') }}
                      </span>
                      <span
                        class="mt-3 block text-sm font-normal leading-7 sm:text-base"
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
                    <div class="space-y-4">
                      <label
                        v-for="option in question.options"
                        :key="option.id"
                        class="group flex cursor-pointer items-center gap-4"
                      >
                        <span
                          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-black text-lg font-bold transition-all duration-200 group-hover:bg-black group-hover:text-white"
                          :class="
                            answers[question.id] === option.id
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          "
                        >
                          {{ option.letter }}
                        </span>

                        <NRadio :value="option.id" class="test-radio">
                          <span class="text-base font-normal leading-8 text-black sm:text-[20px]">
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
        <div class="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p class="text-xs font-normal uppercase tracking-[0.22em] text-black/50 sm:text-sm">
            {{ answeredCount }} / {{ totalQuestions }} {{ t('testPage.answered') }}
          </p>

          <button
            type="button"
            @click="handleSubmitTest"
            class="rounded-[22px] bg-black px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-neutral-900 sm:px-10"
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
  
