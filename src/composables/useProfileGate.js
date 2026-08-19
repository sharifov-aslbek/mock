import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { PROFILE_GATE_MODAL_ENABLED } from '@/utils/postAuth'

// First-time test gate.
//
// Before a brand-new test attempt is created (start-test), the test-taker must
// have a real name on file (firstName + lastName + fatherName) and a phone
// number — the name is printed on the certificate. This composable exposes
// `ensureProfileComplete()`, which resolves instantly when the profile is
// already filled and otherwise opens the ProfileGateModal and waits for the
// user to either save their details or back out. Once saved, it never asks
// again.
//
// TEMP: this is the SMS-down stand-in for /complete-profile (which collects the
// same fields but also verifies the phone by OTP). PROFILE_GATE_MODAL_ENABLED
// in utils/postAuth.js is derived from SMS_AVAILABLE, so when SMS returns the
// gate turns itself off and every call site becomes a no-op again.
export function useProfileGate() {
  const authStore = useAuthStore()
  const showProfileGate = ref(false)
  let resolveGate = null

  // Returns a Promise<boolean>: true once the profile is complete (already, or
  // after the user fills the form), false if the user backed out of the modal.
  async function ensureProfileComplete() {
    if (!PROFILE_GATE_MODAL_ENABLED) {
      return true
    }

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
