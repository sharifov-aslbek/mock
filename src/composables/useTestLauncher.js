// Opening a test from a platform screen.
//
// Four cases, from the row's state and the test's premium flags:
//   done      → open the saved result (/explanation)
//   progress  → resume that attempt (/test with its attemptId)
//   new, free → confirm, then start
//   new, paid → confirm the tanga cost, then start; short balance → top up
//
// This mirrors what MathTestCard does on the public subject pages, but is a
// separate implementation on purpose: that card drives the live purchase flow
// for real students today, and this screen is not worth destabilising it for.
// If the two ever disagree, MathTestCard is the authority. TODO: unify once the
// platform screens are signed off.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTestStore } from '@/stores/test'
import { useBalanceStore } from '@/stores/balance'
import { isPremiumTest, isTestPurchased, testTokenCost } from '@/utils/premium'
import { useProfileGate } from '@/composables/useProfileGate'

export function useTestLauncher() {
  const router = useRouter()
  const testStore = useTestStore()
  const balanceStore = useBalanceStore()
  const { showProfileGate, ensureProfileComplete, onProfileCompleted, onProfileCancel } =
    useProfileGate()

  // The test awaiting confirmation, and which dialog is showing for it.
  const pending = ref(null)
  const dialog = ref('') // '' | 'start' | 'purchase' | 'topup'
  const busyTestId = ref(null)
  const errorMessage = ref('')

  const cost = computed(() => (pending.value ? testTokenCost(pending.value) : 0))
  const balance = computed(() => balanceStore.available)

  const close = () => {
    dialog.value = ''
    pending.value = null
    errorMessage.value = ''
  }

  // Entry point — the row's action button.
  async function open(test) {
    errorMessage.value = ''

    if (test.state === 'done' && test.attemptId) {
      await router.push(`/explanation?testId=${test.id}&attemptId=${test.attemptId}`)
      return
    }

    if (test.state === 'progress' && test.attemptId) {
      await router.push(`/test?testId=${test.id}&attemptId=${test.attemptId}`)
      return
    }

    pending.value = test

    // Free, or already owned → a plain confirm. Nothing is charged.
    if (!isPremiumTest(test) || isTestPurchased(test)) {
      dialog.value = 'start'
      return
    }

    // Paid and not owned → check the balance before offering to spend it. The
    // backend stays the final authority; this is just faster feedback.
    busyTestId.value = test.id
    try {
      await balanceStore.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      busyTestId.value = null
    }

    dialog.value =
      balanceStore.isLoaded && balance.value < testTokenCost(test) ? 'topup' : 'purchase'
  }

  // Starts the attempt and navigates in. One backend call creates the attempt
  // and, for a premium test, performs the purchase.
  async function confirm() {
    const test = pending.value
    if (!test) return

    errorMessage.value = ''
    busyTestId.value = test.id

    try {
      // start-test mints a fresh attempt, so the test-taker needs a real name
      // on file for the certificate. No-op once the profile is complete;
      // backing out aborts the start — no attempt, no charge.
      const profileOk = await ensureProfileComplete()
      if (!profileOk) return

      await testStore.startTest(test.id)

      const attemptId = testStore.currentAttempt?.id
        ? Number(testStore.currentAttempt.id)
        : null
      const params = new URLSearchParams({ testId: String(test.id) })
      if (attemptId) params.set('attemptId', String(attemptId))

      dialog.value = ''
      pending.value = null
      await router.push(`/test?${params.toString()}`)
    } catch (error) {
      console.error(error)
      // Balance moved underneath us → steer to top-up rather than a dead error.
      if (/insufficient/i.test(error?.message || '')) {
        dialog.value = 'topup'
      } else {
        errorMessage.value = testStore.errorMessage || 'Testni ochib bo‘lmadi.'
      }
    } finally {
      busyTestId.value = null
    }
  }

  const goToTopUp = async () => {
    close()
    await router.push('/narxlar')
  }

  return {
    pending,
    dialog,
    busyTestId,
    errorMessage,
    cost,
    balance,
    open,
    confirm,
    close,
    goToTopUp,
    showProfileGate,
    onProfileCompleted,
    onProfileCancel,
  }
}
