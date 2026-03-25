<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  NAlert,
  NButton,
  NCard,
  NInput,
  NRadio,
  NRadioGroup,
  NSpin,
} from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useTestStore } from '@/stores/test'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const answers = reactive({})
const pageErrorKey = ref('')

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

const clearAnswers = () => {
  for (const answerKey of Object.keys(answers)) {
    delete answers[answerKey]
  }
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

const goBack = async () => {
  await router.push('/math')
}

const getQuestionTypeLabel = (type) => t(`testPage.questionTypes.${type}`)
</script>

<template>
  <main class="min-h-screen bg-[#f7f7f5] px-4 py-8 text-black">
    <div class="mx-auto max-w-6xl">
      <section class="mb-8 rounded-[32px] border border-black/10 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <button
              type="button"
              @click="goBack"
              class="inline-flex items-center gap-2 text-sm font-medium text-black/60 transition hover:text-black"
            >
              <span>←</span>
              <span>{{ t('testPage.back') }}</span>
            </button>

            <h1 class="mt-4 text-3xl font-black tracking-tight text-black sm:text-4xl">
              {{ currentTest?.title || t('testPage.title') }}
            </h1>
            <p class="mt-3 text-sm leading-6 text-black/60 sm:text-base">
              {{ t('testPage.description') }}
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-3xl border border-black/10 bg-black px-5 py-4 text-white">
              <p class="text-xs uppercase tracking-[0.18em] text-white/60">
                {{ t('testPage.questionCount') }}
              </p>
              <p class="mt-3 text-3xl font-black">
                {{ currentTest?.questions?.length || 0 }}
              </p>
            </div>

            <div class="rounded-3xl border border-black/10 bg-white px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-black/45">
                Test ID
              </p>
              <p class="mt-3 text-3xl font-black text-black">
                #{{ currentTest?.id || requestedTestId || '-' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <NSpin :show="testStore.isLoading">
        <div v-if="resolvedErrorMessage" class="mb-6">
          <NAlert type="error" :show-icon="false">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span>{{ resolvedErrorMessage }}</span>

              <div class="flex gap-3">
                <RouterLink
                  v-if="isLoginRequired"
                  :to="loginRoute"
                  class="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {{ t('testPage.login') }}
                </RouterLink>

                <NButton
                  v-else
                  color="#000000"
                  text-color="#ffffff"
                  round
                  @click="loadTest(requestedTestId)"
                >
                  {{ t('testPage.retry') }}
                </NButton>
              </div>
            </div>
          </NAlert>
        </div>

        <div v-else-if="currentTest" class="space-y-6">
          <section
            v-for="question in renderedQuestions"
            :key="question.id"
            class="space-y-4"
          >
            <div
              v-if="question.groupTitle"
              class="rounded-[28px] border border-black/10 bg-black px-6 py-5 text-white shadow-sm"
            >
              <p class="text-xs uppercase tracking-[0.18em] text-white/60">
                {{ t('testPage.groupedTask') }}
              </p>
              <h2 class="mt-3 text-lg font-semibold leading-7">
                {{ question.groupTitle }}
              </h2>
            </div>

            <NCard :bordered="false" class="!rounded-[28px] !bg-white !shadow-sm">
              <div class="space-y-6">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div class="max-w-3xl">
                    <p class="text-xs uppercase tracking-[0.18em] text-black/45">
                      {{ t('testPage.questionLabel') }} {{ question.displayIndex }}
                    </p>
                    <h3 class="mt-3 text-xl font-bold leading-8 text-black">
                      {{ question.text }}
                    </h3>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span
                      class="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1 text-xs font-semibold tracking-wide text-black/70"
                    >
                      {{ t('testPage.scoreLabel') }}: {{ question.score }}
                    </span>
                    <span
                      class="rounded-full border border-black/10 bg-black px-3 py-1 text-xs font-semibold tracking-wide text-white"
                    >
                      {{ getQuestionTypeLabel(question.type) }}
                    </span>
                  </div>
                </div>

                <img
                  v-if="question.imageUrl"
                  :src="question.imageUrl"
                  :alt="t('testPage.imageAlt')"
                  class="max-h-[420px] w-full rounded-[24px] border border-black/10 bg-[#fafaf9] object-contain p-4"
                />

                <div v-if="question.type === 'FreeAnswer'" class="space-y-3">
                  <p class="text-xs uppercase tracking-[0.18em] text-black/45">
                    {{ t('testPage.freeAnswerLabel') }}
                  </p>
                  <NInput
                    v-model:value="answers[question.id]"
                    type="textarea"
                    :autosize="{ minRows: 3, maxRows: 6 }"
                    :placeholder="t('testPage.freeAnswerPlaceholder')"
                  />
                </div>

                <div v-else class="space-y-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-black/45">
                    {{ t('testPage.optionBank') }}
                  </p>

                  <NRadioGroup v-model:value="answers[question.id]" class="block">
                    <div class="grid gap-3 md:grid-cols-2">
                      <label
                        v-for="option in question.options"
                        :key="option.id"
                        class="group flex cursor-pointer items-center gap-3 rounded-[22px] border border-black/10 bg-[#fafaf9] px-4 py-4 transition hover:border-black"
                      >
                        <span
                          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white text-sm font-bold text-black transition group-hover:bg-black group-hover:text-white"
                          :class="
                            answers[question.id] === option.id
                              ? 'border-black bg-black text-white'
                              : ''
                          "
                        >
                          {{ option.letter }}
                        </span>

                        <NRadio :value="option.id" class="test-radio">
                          <span class="text-sm font-medium leading-6 text-black">
                            {{ option.text }}
                          </span>
                        </NRadio>
                      </label>
                    </div>
                  </NRadioGroup>
                </div>
              </div>
            </NCard>
          </section>
        </div>
      </NSpin>
    </div>
  </main>
</template>

<style scoped>
:deep(.test-radio .n-radio__dot--checked) {
  box-shadow: inset 0 0 0 2px #000000 !important;
}

:deep(.test-radio .n-radio__dot::before) {
  background-color: #000000 !important;
}

:deep(.test-radio .n-radio__dot) {
  border: 2px solid #000000 !important;
  background-color: #ffffff !important;
}

:deep(.test-radio:hover .n-radio__dot) {
  border-color: #000000 !important;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.08) !important;
}
</style>
