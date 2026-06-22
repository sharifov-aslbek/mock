<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NCard, NModal, NButton } from 'naive-ui'
import { useTestStore } from '@/stores/test'
import { useAuthStore } from '@/stores/auth'
import { useBalanceStore } from '@/stores/balance'
import { isPremiumTest, isTestPurchased, testTokenCost } from '@/utils/premium'
import { subjectIcon } from '@/utils/subjects'

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
const testStore = useTestStore()
const authStore = useAuthStore()
const balanceStore = useBalanceStore()
const isStarting = ref(false)
const startError = ref('')
const showStartModal = ref(false)
const showAttemptChoiceModal = ref(false)
const showPremiumModal = ref(false)
const showTopUpModal = ref(false)
const isCheckingBalance = ref(false)
const isInProgressCard = computed(() => Boolean(props.test.isInProgressCard))

// Card icon follows the test's subject — π for math, scroll for history, book
// for Ona tili. See src/utils/subjects.js.
const icon = computed(() => subjectIcon(props.test.subject))

// Premium marking comes from the backend (see src/utils/premium.js). In-progress
// cards never show the premium treatment — the user is mid-attempt already.
const isPremium = computed(
  () => !isInProgressCard.value && isPremiumTest(props.test),
)
// Free tests, admins, and already-bought premium tests come back purchased.
const isPurchased = computed(() => isTestPurchased(props.test))

const tokenCost = computed(() => testTokenCost(props.test))
const availableTanga = computed(() => balanceStore.available)
const purchaseError = ref('')
const isPurchasing = ref(false)

// Premium gate. Starting a test goes through a single backend call
// (`POST /user-test-attempt/start-test`) that, for a premium test, also performs
// the purchase before creating the attempt. Free tests and already-purchased
// tests start straight away — no charge.
const handlePremiumClick = async () => {
  // Must be signed in to have a tanga balance / make a purchase.
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { reason: 'auth-required', redirect: `/test?testId=${props.test.id}` },
    })
    return
  }

  isCheckingBalance.value = true
  try {
    // Refresh so the balance is current before we offer to spend it.
    await balanceStore.refresh()
  } catch (error) {
    console.error(error)
  } finally {
    isCheckingBalance.value = false
  }

  // Already owns it → no charge, just open (or let an attempted card choose).
  if (isPurchased.value) {
    if (props.isAttemptedCard) {
      showAttemptChoiceModal.value = true
    } else {
      await openTest()
    }
    return
  }

  // Needs to buy it first. We just refreshed the balance above, so when we have
  // a confirmed balance we can tell up front whether the user can afford it and
  // skip a doomed round-trip: not enough tanga → go straight to the top-up
  // prompt. The backend stays the final authority — confirmPremiumPurchase can
  // still be rejected (e.g. the balance changed underneath us), and that
  // rejection path still steers to top-up — but this gives instant feedback
  // instead of waiting on a server error.
  purchaseError.value = ''

  if (balanceStore.isLoaded && availableTanga.value < tokenCost.value) {
    showTopUpModal.value = true
    return
  }

  showPremiumModal.value = true
}

const confirmPremiumPurchase = async () => {
  purchaseError.value = ''
  isPurchasing.value = true
  try {
    // One call buys the test (deducting test.price) and starts the attempt.
    await startAndOpen()
    showPremiumModal.value = false
  } catch (error) {
    console.error(error)
    // Insufficient funds → steer to top-up; otherwise surface the message.
    if (/insufficient/i.test(error?.message || '')) {
      showPremiumModal.value = false
      showTopUpModal.value = true
    } else {
      purchaseError.value = error?.message || t('mathCard.startError')
    }
  } finally {
    isPurchasing.value = false
  }
}

const goToPricing = () => {
  showTopUpModal.value = false
  router.push('/pricing')
}

// Begins the attempt via start-test (which also performs the premium purchase
// when needed), stores the test + attempt in the test store, then navigates into
// it. Throws on failure so callers can react — premium shows the top-up modal on
// insufficient funds, the plain start button shows an inline error. The test
// page renders straight from the store; it never re-fetches or re-starts.
const startAndOpen = async () => {
  const redirectTarget = props.isAttemptedCard
    ? `/test?testId=${props.test.id}&restart=1`
    : `/test?testId=${props.test.id}`

  await testStore.startTest(props.test.id)
  await router.push(redirectTarget)
}

const openTest = async () => {
  isStarting.value = true
  startError.value = ''

  try {
    await startAndOpen()
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
  showAttemptChoiceModal.value = false
  isStarting.value = true
  startError.value = ''
  try {
    // The results endpoint is keyed by attempt, but the card only knows the
    // test — resolve the user's most recent attempt for it from their history.
    const attempts = await testStore.fetchUserAttempts()
    const latest = attempts
      .filter((attempt) => Number(attempt?.testId ?? attempt?.test?.id) === Number(props.test.id))
      .sort(
        (a, b) =>
          new Date(b?.startedAt || 0) - new Date(a?.startedAt || 0) ||
          Number(b?.id || 0) - Number(a?.id || 0),
      )[0]

    if (!latest?.id) {
      startError.value = t('mathCard.startError')
      return
    }

    await router.push(`/explanation?testId=${props.test.id}&attemptId=${latest.id}`)
  } catch (error) {
    console.error(error)
    startError.value = testStore.errorMessage || t('mathCard.startError')
  } finally {
    isStarting.value = false
  }
}

const restartAttemptedTest = async () => {
  showAttemptChoiceModal.value = false
  // Premium tests are bought once and the backend allows a single attempt — it
  // governs restarts (a second premium attempt is rejected server-side). Free
  // tests restart freely. Nothing to charge here.
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
    class="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white/80 p-6 shadow-[0_10px_30px_rgba(26,24,20,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#d8d3ca] hover:shadow-[0_20px_50px_rgba(26,24,20,0.12)]"
    :class="isAttemptedCard && !isInProgressCard ? 'cursor-pointer' : ''"
    @click="handleAttemptedCardClick"
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle,#d8d3ca_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_30%,transparent_85%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(255,255,255,0.6),transparent_70%)]"></div>

    <!-- Premium: faint monochrome top hairline — same accent-line motif used
         elsewhere on the site, just to give premium cards a subtle signature. -->
    <div
      v-if="isPremium"
      class="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[#1a1814]/25 to-transparent"
    ></div>

    <div class="relative z-10 flex h-full flex-col">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1814] text-white shadow-[0_8px_20px_rgba(26,24,20,0.2)] transition-transform duration-300 group-hover:scale-105">
            <!-- Math mark: a typeset π (pi) — the universally recognized symbol for
                 mathematics, set in italic serif to match the editorial type. Reads
                 the same to a junior or an exam student. Other subjects use stroke
                 icons (see src/utils/subjects.js). -->
            <span v-if="icon.kind === 'pi'" class="select-none font-serif text-[26px] italic leading-none">π</span>
            <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, i) in icon.paths" :key="i" :d="d" />
            </svg>
          </div>
          <h3 class="line-clamp-2 min-h-[3.5rem] text-2xl font-bold leading-tight tracking-[-0.02em] text-[#1a1814]">{{ test.title }}</h3>
          <p class="mt-2 text-sm text-[#8a857c]">{{ test.subject }}</p>
        </div>

        <div class="flex shrink-0 flex-col items-end gap-2">
          <span
            v-if="isPremium"
            class="font-mono-custom inline-flex items-center gap-1.5 rounded-full border border-[#e0ddd7] bg-[#faf9f6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a1814]"
          >
            <svg class="h-3 w-3 text-[#8a857c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Premium
          </span>
        </div>
      </div>

      <div
        v-if="!isInProgressCard"
        class="mb-6 grid grid-cols-2 gap-3"
      >
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ t('mathCard.amount') }}</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ test.questionCount }}</p>
        </div>
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ t('mathCard.people') }}</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ test.attemptCount }}</p>
        </div>
      </div>

      <div
        v-else
        class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ t('mathCard.remainingQuestions') }}</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ test.remainingQuestions }}</p>
        </div>
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ t('mathCard.remainingTime') }}</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ test.remainingTimeLabel }}</p>
        </div>
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ t('mathCard.answeredQuestions') }}</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ test.answeredCount }}</p>
        </div>
      </div>

      <div class="mt-auto space-y-3">
        <button
          v-if="!isInProgressCard && !isPremium"
          type="button"
          @click.stop="isAttemptedCard ? (showAttemptChoiceModal = true) : (showStartModal = true)"
          :disabled="isStarting"
          class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1814] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(26,24,20,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_14px_36px_rgba(26,24,20,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.752 11.168-4.586-2.65A1 1 0 0 0 8.667 9.39v5.22a1 1 0 0 0 1.499.872l4.586-2.65a1 1 0 0 0 0-1.664Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {{ isStarting ? t('mathCard.starting') : isAttemptedCard ? t('mathCard.select') : t('mathCard.start') }}
        </button>

        <!-- Premium variant: outlined "locked" CTA (matches the site's
             outline-button vocabulary). Fills to brand black on hover. Still
             opens the test for now; the purchase/balance gate is the next step. -->
        <button
          v-else-if="!isInProgressCard && isPremium"
          type="button"
          @click.stop="handlePremiumClick"
          :disabled="isStarting || isCheckingBalance"
          class="flex w-full items-center justify-center gap-2 rounded-full border border-[#1a1814] bg-white/70 px-4 py-3.5 text-sm font-semibold text-[#1a1814] shadow-[0_4px_14px_rgba(26,24,20,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#1a1814] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ isStarting ? t('mathCard.starting') : isCheckingBalance ? t('mathCard.checking') : isAttemptedCard ? t('mathCard.select') : 'Premium' }}
        </button>

        <button
          v-else
          type="button"
          @click="handleContinueTest"
          :disabled="isStarting"
          class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1814] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(26,24,20,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_14px_36px_rgba(26,24,20,0.24)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
    class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98]"
  >
    {{ t('mathCard.confirmNo') }}
  </button>

  <button
    type="button"
    @click="confirmStartTest"
    class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
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
                {{ t('mathCard.chooseTitle') }}
              </h4>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                @click="restartAttemptedTest"
                :disabled="isStarting"
                class="inline-flex min-h-12 items-center justify-center rounded-2xl border border-black bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {{ t('mathCard.restart') }}
              </button>

              <button
                type="button"
                @click="openLastResult"
                class="inline-flex min-h-12 items-center justify-center rounded-2xl border border-black bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white active:scale-[0.98]"
              >
                {{ t('mathCard.viewLast') }}
              </button>
            </div>

            <button
              type="button"
              class="text-sm font-medium text-gray-400 transition hover:text-black"
              @click="showAttemptChoiceModal = false"
            >
              {{ t('mathCard.cancel') }}
            </button>
          </div>
        </NCard>
      </div>
    </NModal>

    <!-- Premium purchase confirm (enough tanga) -->
    <NModal v-model:show="showPremiumModal">
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] text-[#1a1814]">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <h4 class="text-xl font-bold tracking-tight text-black">Premium test</h4>
              <p class="mt-2 text-sm leading-6 text-gray-500">
                «{{ test.title }}» ni ochish uchun
                <span class="font-semibold text-black">{{ tokenCost }} tanga</span> sarflanadi.
              </p>
              <p class="mt-1 text-sm text-gray-500">
                Hisobingizda: <span class="font-semibold text-black">{{ availableTanga }} tanga</span>
              </p>
            </div>

            <p v-if="purchaseError" class="text-sm text-red-600">
              {{ purchaseError }}
            </p>

            <div class="flex justify-center gap-3">
              <button
                type="button"
                @click="showPremiumModal = false"
                :disabled="isPurchasing"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                @click="confirmPremiumPurchase"
                :disabled="isPurchasing"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isPurchasing ? 'Sotib olinmoqda…' : 'Sotib olish' }}
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>

    <!-- Insufficient tanga → prompt to top up -->
    <NModal v-model:show="showTopUpModal">
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] text-[#1a1814]">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M9.5 9.5h3.25a1.75 1.75 0 0 1 0 3.5H11a1.75 1.75 0 0 0 0 3.5h3.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <h4 class="text-xl font-bold tracking-tight text-black">Tanga yetarli emas</h4>
              <p class="mt-2 text-sm leading-6 text-gray-500">
                Bu premium testni ochish uchun
                <span class="font-semibold text-black">{{ tokenCost }} tanga</span> kerak.
              </p>
              <p class="mt-1 text-sm text-gray-500">
                Hisobingizda: <span class="font-semibold text-black">{{ availableTanga }} tanga</span>.
                Tangalarni to‘ldiring.
              </p>
            </div>

            <div class="space-y-3">
              <button
                type="button"
                @click="goToPricing"
                class="inline-flex h-12 w-full items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
              >
                Hisobni to‘ldirish
              </button>
              <button
                type="button"
                class="text-sm font-medium text-gray-400 transition hover:text-black"
                @click="showTopUpModal = false"
              >
                Yopish
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>
  </article>
</template>
