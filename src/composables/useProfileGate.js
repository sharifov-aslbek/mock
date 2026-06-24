import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

// First-time test gate.
//
// Before a brand-new test attempt is created (start-test), the test-taker must
// have a real name on file (firstName + lastName + fatherName) — those fields
// are printed on the certificate. This composable exposes
// `ensureProfileComplete()`, which resolves instantly when the profile is
// already filled and otherwise opens the ProfileGateModal and waits for the
// user to either save their details or back out. Once saved, it never asks
// again.
export function useProfileGate() {
  const authStore = useAuthStore()
  const showProfileGate = ref(false)
  let resolveGate = null

  // Returns a Promise<boolean>: true once the profile is complete (already, or
  // after the user fills the form), false if the user backed out of the modal.
  async function ensureProfileComplete() {
    // We may not have the user record yet (e.g. deep-linked straight to /test).
    if (!authStore.userInfo && authStore.isAuthenticated) {
      try {
        await authStore.getUserInfo()
      } catch {
        // If we can't load it, fall through and prompt — better to ask than to
        // silently issue a certificate with a missing name.
      }
    }

    if (authStore.isProfileComplete) {
      return true
    }

    showProfileGate.value = true
    return new Promise((resolve) => {
      resolveGate = resolve
    })
  }

  function onProfileCompleted() {
    showProfileGate.value = false
    if (resolveGate) {
      resolveGate(true)
      resolveGate = null
    }
  }

  function onProfileCancel() {
    showProfileGate.value = false
    if (resolveGate) {
      resolveGate(false)
      resolveGate = null
    }
  }

  return {
    showProfileGate,
    ensureProfileComplete,
    onProfileCompleted,
    onProfileCancel,
  }
}
