<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NButton, NCard, NModal } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useTestStore } from '@/stores/test'

const props = defineProps({
  test: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const testStore = useTestStore()
const isStarting = ref(false)
const startError = ref('')
const showStartModal = ref(false)

const handleStartTest = async () => {
  const redirectTarget = `/test?testId=${props.test.id}`

  if (!authStore.isAuthenticated) {
    await router.push({
      path: '/login',
      query: {
        redirect: redirectTarget
      }
    })
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

const confirmStartTest = async () => {
  showStartModal.value = false
  await handleStartTest()
}
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
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

      <div class="mb-6 grid grid-cols-2 gap-3">
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.amount') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.questionCount }}</p>
        </div>
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.people') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.attemptCount }}</p>
        </div>
      </div>

      <div class="mt-auto space-y-3">
        <button
          type="button"
          @click="showStartModal = true"
          :disabled="isStarting"
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.752 11.168-4.586-2.65A1 1 0 0 0 8.667 9.39v5.22a1 1 0 0 0 1.499.872l4.586-2.65a1 1 0 0 0 0-1.664Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {{ isStarting ? t('mathCard.starting') : t('mathCard.start') }}
        </button>

        <button
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-neutral-100"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h8M8 14h5m-9 6 2.4-2.4A2 2 0 0 0 7 16.2V7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H4Z" />
          </svg>
          {{ t('mathCard.discuss') }}
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
              <NButton round @click="showStartModal = false">
                {{ t('mathCard.confirmNo') }}
              </NButton>
              <NButton
                round
                color="#000000"
                text-color="#ffffff"
                @click="confirmStartTest"
              >
                {{ t('mathCard.confirmYes') }}
              </NButton>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>
  </article>
</template>
