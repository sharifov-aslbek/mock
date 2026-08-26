import { useAuthStore } from '@/stores/auth'
import { PLATFORM_HOME } from '@/composables/usePlatformEntry'

export const COMPLETE_PROFILE_PATH = '/complete-profile'

// TEMP (2026-08-16): the SMS provider is down again, so nothing that ends in an
// OTP can complete — /complete-profile (verify-my-phone) and /verify-phone are
// dead ends right now. The backend's own gates were disabled at the same time.
// This is the ONE switch: set it back to true once SMS works again and
// everything below comes back — nothing else changes.
//
// /register is not on this switch: phone sign-up runs through the Telegram bot
// (the bot reads the number from a shared contact and shows the code — no SMS
// anywhere in that flow), so it renders the same with SMS up or down.
export const SMS_AVAILABLE = false

// While false, no flow redirects INTO phone verification: post-auth routing goes
// straight to the destination (a Google / Telegram session included),
// start-test's "verify your phone" 403 falls through as a plain error, login's
// "verify first" hand-off is skipped, and /complete-profile saves without an
// OTP step. The point is that signed-in users keep using the site.
//
// Read by: resolvePostAuthRoute below, views/Login.vue, components/MathTestCard.vue,
// views/TestPage.vue, composables/useTestLauncher.js, views/CompleteProfilePage.vue.
export const PHONE_VERIFY_REDIRECTS_ENABLED = SMS_AVAILABLE

// While SMS is down, /complete-profile can't run, so the OLD first-time gate is
// back: before a test starts, ProfileGateModal asks for first/last/father name
// and a phone number (saved with PUT /user, no OTP) — the certificate is printed
// from them. It goes dormant again the moment SMS_AVAILABLE flips, because
// /complete-profile then collects the same fields, with verification.
// Read by: composables/useProfileGate.js (the one place that checks it).
export const PROFILE_GATE_MODAL_ENABLED = !SMS_AVAILABLE

// Where to send someone who has just authenticated, or who just tried to start
// a test without a usable profile.
//
// Everyone needs a real name (it's printed on the certificate) and a confirmed
// phone number before start-test will mint an attempt. Google and Telegram
// sign-ins hand back a session with neither, so they land on /complete-profile
// with their original destination carried along in ?redirect=.
//
// Browsing is deliberately left open — the backend gate on start-test is the
// only thing that has to hold, so there's no reason to fence off the rest of
// the site.
export async function resolvePostAuthRoute(rawDestination = PLATFORM_HOME) {
  const authStore = useAuthStore()

  // A `?redirect=` pointing back at this page (the auth guard bounces deep
  // links through /register, which can carry one) would loop through itself.
  const destination = String(rawDestination || '').startsWith(COMPLETE_PROFILE_PATH)
    ? PLATFORM_HOME
    : rawDestination

  // TEMP: SMS down — never detour into /complete-profile (see the flag above).
  if (!PHONE_VERIFY_REDIRECTS_ENABLED) {
    return destination
  }

  try {
    await authStore.getUserInfo()
  } catch {
    // Couldn't read the profile — let them through rather than bouncing them on
    // a guess. start-test's 403 still catches an unconfirmed phone later.
  }

  if (authStore.needsProfileSetup) {
    return { path: COMPLETE_PROFILE_PATH, query: { redirect: destination } }
  }

  return destination
}
