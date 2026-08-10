import { useAuthStore } from '@/stores/auth'

export const COMPLETE_PROFILE_PATH = '/complete-profile'

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
export async function resolvePostAuthRoute(rawDestination = '/math') {
  const authStore = useAuthStore()

  // A `?redirect=` pointing back at this page (the auth guard bounces deep
  // links through /register, which can carry one) would loop through itself.
  const destination = String(rawDestination || '').startsWith(COMPLETE_PROFILE_PATH)
    ? '/math'
    : rawDestination

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
