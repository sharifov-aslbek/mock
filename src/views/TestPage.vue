<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import { NButton, NRadio, NRadioGroup, NSpin } from 'naive-ui'
import MathAnswerInput from '@/components/MathAnswerInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useTestStore } from '@/stores/test'

const route = useRoute()
const { t } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const answers = reactive({})
const pageErrorKey = ref('')
const remainingSeconds = ref(0)
const activeFreeAnswerId = ref(null)
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

const startTimer = (questionCount) => {
  stopTimer()

  const durationInSeconds = Math.max(Number(questionCount || 0) * 120, 600)
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

const loadTest = async (testId) => {
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
  (test) => {
    if (!test) {
      stopTimer()
      remainingSeconds.value = 0
      return
    }

    startTimer(test.questions?.length)
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  stopTimer()
})

</script>

<template>
  <main class="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
    <header class="sticky top-0 z-10 border-b-2 border-black bg-white px-6 py-4">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-black">
            {{ currentTest?.title || t('testPage.title') }}
          </h1>
        </div>

        <div class="flex items-center gap-4 self-start sm:self-auto">
          <div class="border-2 border-black px-4 py-2 text-center">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55">
              {{ t('testPage.timer') }}
            </p>
            <p class="mt-1 text-lg font-bold text-black">
              {{ formattedTimer }}
            </p>
          </div>

          <NButton
            color="#000000"
            text-color="#ffffff"
            size="large"
            class="!rounded-none !border-2 !border-black !px-8 !font-bold hover:!bg-white hover:!text-black transition-colors duration-200"
          >
            {{ t('testPage.submit') }}
          </NButton>
        </div>
      </div>
    </header>

    <NSpin :show="testStore.isLoading">
      <div class="mx-auto max-w-6xl px-6 py-10 space-y-12">
        <div
          v-if="resolvedErrorMessage"
          class="rounded-none border-2 border-black bg-white p-5"
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

        <div v-else-if="currentTest" class="space-y-12">
          <div
            v-for="question in renderedQuestions"
            :key="question.id"
            class="question-block"
          >
            <div v-if="question.groupTitle" class="mb-4 ml-6 border-l-2 border-black pl-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-black/50">
                {{ t('testPage.groupedTask') }}
              </p>
              <p class="mt-2 text-base font-semibold leading-7 text-black">
                {{ question.groupTitle }}
              </p>
            </div>

            <h2 class="mb-4 text-[17px] font-bold leading-relaxed text-black">
              {{ question.displayIndex }}. {{ question.text }}
            </h2>

            <div v-if="question.imageUrl" class="mb-5 ml-6">
              <img
                :src="question.imageUrl"
                :alt="t('testPage.imageAlt')"
                class="max-w-[400px] border-2 border-black"
              />
            </div>

            <div v-if="question.type === 'FreeAnswer'" class="ml-6 max-w-3xl space-y-3">
              <button
                type="button"
                @click="activeFreeAnswerId = question.id"
                class="w-full rounded-2xl border-2 border-black bg-white px-4 py-4 text-left transition hover:bg-black/5"
              >
                <span class="block text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                  {{ t('testPage.freeAnswerLabel') }}
                </span>
                <span
                  class="mt-2 block text-base"
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
              class="ml-6 block"
            >
              <div class="grid gap-3 md:grid-cols-2">
                <label
                  v-for="option in question.options"
                  :key="option.id"
                  class="group flex cursor-pointer items-center gap-3"
                >
                  <span
                    class="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-black text-[13px] font-bold transition-all duration-200 group-hover:bg-black group-hover:text-white"
                    :class="
                      answers[question.id] === option.id
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    "
                  >
                    {{ option.letter }}
                  </span>

                  <NRadio :value="option.id" class="test-radio">
                    <span class="text-[16px] font-medium text-black">
                      {{ option.text }}
                    </span>
                  </NRadio>
                </label>
              </div>
            </NRadioGroup>
          </div>
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
  
