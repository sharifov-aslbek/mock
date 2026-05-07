<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NCard, NModal, NButton } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useTestStore } from '@/stores/test'

const props = defineProps({
  test: {
    type: Object,
    required: true
  },
  isAttemptedCard: {
    type: Boolean,
    default: false,
  }
})

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const isStarting = ref(false)
const startError = ref('')
const showStartModal = ref(false)
const showAttemptChoiceModal = ref(false)
const isInProgressCard = computed(() => Boolean(props.test.isInProgressCard))

const ensureAuth = async (redirectTarget) => {
  if (authStore.isAuthenticated) {
    return true
  }

  await router.push({
    path: '/login',
    query: {
      redirect: redirectTarget,
    },
  })

  return false
}

const openTest = async () => {
  const redirectTarget = props.isAttemptedCard
    ? `/test?testId=${props.test.id}&restart=1`
    : `/test?testId=${props.test.id}`

  if (!(await ensureAuth(redirectTarget))) {
    return
  }

  isStarting.value = true
  startError.value = ''

  try {
    await testStore.fetchTestById(props.test.id)
    await router.push(redirectTarget)
  } catch (error) {
    console.error(error)
    startError.value = testStore.errorMessage || t('mathCard.startError')
  } finally {
    isStarting.value = false
  }
}

const handleStartTest = async () => {
  await openTest()
}

const handleContinueTest = async () => {
  await openTest()
}

const confirmStartTest = async () => {
  showStartModal.value = false
  await handleStartTest()
}

const openLastResult = async () => {
  const redirectTarget = `/explanation?testId=${props.test.id}`

  if (!(await ensureAuth(redirectTarget))) {
    return
  }

  showAttemptChoiceModal.value = false
  await router.push(redirectTarget)
}

const restartAttemptedTest = async () => {
  showAttemptChoiceModal.value = false
  await openTest()
}

const handleAttemptedCardClick = () => {
  if (props.isAttemptedCard && !isInProgressCard.value) {
    showAttemptChoiceModal.value = true
  }
}
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
    :class="isAttemptedCard && !isInProgressCard ? 'cursor-pointer' : ''"
    @click="handleAttemptedCardClick"
  >
    <div class="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.8),transparent_70%)]"></div>

    <div class="relative z-10 flex h-full flex-col">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white text-black shadow-sm">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold tracking-tight text-black">{{ test.title }}</h3>
          <p class="mt-2 text-sm text-gray-500">{{ test.subject }}</p>
        </div>

        <span class="rounded-full bg-black px-3 py-1 text-xs font-semibold tracking-wide text-white">
          #{{ test.id }}
        </span>
      </div>

      <div class="mb-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('math.subjectLabel') }}</p>
        <p class="mt-2 text-base font-semibold text-black">{{ test.subject }}</p>
      </div>

      <div
        v-if="!isInProgressCard"
        class="mb-6 grid grid-cols-2 gap-3"
      >
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.amount') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.questionCount }}</p>
        </div>
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.people') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.attemptCount }}</p>
        </div>
      </div>

      <div
        v-else
        class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.remainingQuestions') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.remainingQuestions }}</p>
        </div>
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.remainingTime') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.remainingTimeLabel }}</p>
        </div>
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.answeredQuestions') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.answeredCount }}</p>
        </div>
      </div>

      <div class="mt-auto space-y-3">
        <button
          v-if="!isInProgressCard"
          type="button"
          @click.stop="isAttemptedCard ? (showAttemptChoiceModal = true) : (showStartModal = true)"
          :disabled="isStarting"
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.752 11.168-4.586-2.65A1 1 0 0 0 8.667 9.39v5.22a1 1 0 0 0 1.499.872l4.586-2.65a1 1 0 0 0 0-1.664Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {{ isStarting ? t('mathCard.starting') : isAttemptedCard ? 'Tanlash' : t('mathCard.start') }}
        </button>

        <button
          v-else
          type="button"
          @click="handleContinueTest"
          :disabled="isStarting"
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6v12m0 0 7-6m-7 6-7-6" />
          </svg>
          {{ isStarting ? t('mathCard.continuing') : t('mathCard.continue') }}
        </button>

        <p v-if="startError" class="text-sm text-red-600">
          {{ startError }}
        </p>
      </div>
    </div>

    <NModal v-model:show="showStartModal">
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div>
              <h4 class="text-xl font-bold tracking-tight text-black">
                {{ t('mathCard.confirmTitle') }}
              </h4>
            </div>

          <div class="flex justify-center gap-3">
  <button
    type="button"
    @click="showStartModal = false"
    class="inline-flex h-11 items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98]"
  >
    {{ t('mathCard.confirmNo') }}
  </button>

  <button
    type="button"
    @click="confirmStartTest"
    class="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
  >
    {{ t('mathCard.confirmYes') }}
  </button>
</div>
          </div>
        </NCard>
      </div>
    </NModal>

    <NModal v-model:show="showAttemptChoiceModal">
      <div class="w-[calc(100vw-2rem)] max-w-lg">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                {{ test.title }}
              </p>
              <h4 class="mt-2 text-xl font-bold tracking-tight text-black">
                Bu test bilan nima qilmoqchisiz?
              </h4>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                @click="restartAttemptedTest"
                :disabled="isStarting"
                class="inline-flex min-h-12 items-center justify-center rounded-2xl border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Boshidan ishlash
              </button>

              <button
                type="button"
                @click="openLastResult"
                class="inline-flex min-h-12 items-center justify-center rounded-2xl border border-black bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white active:scale-[0.98]"
              >
                Oxirgi natijalarni ko'rish
              </button>
            </div>

            <button
              type="button"
              class="text-sm font-medium text-gray-400 transition hover:text-black"
              @click="showAttemptChoiceModal = false"
            >
              Bekor qilish
            </button>
          </div>
        </NCard>
      </div>
    </NModal>
  </article>
</template>
