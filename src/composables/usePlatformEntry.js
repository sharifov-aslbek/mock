// Where the marketing site's calls-to-action lead.
//
// One place decides this, because four buttons each hardcoding their own answer
// is exactly how "Platformaga kirish" ended up pointing at /math — a public
// subject page — for signed-in visitors, while "Bepul boshlash" sent people who
// were already signed in to a login form. Signed out, they all now land on
// /register.
//
// The landing shell deliberately never calls the session API (see
// MarketingLayout), so this peeks at localStorage only. A stale token here costs
// nothing: the platform's own guard re-checks and bounces to registration.
import { computed, onMounted, ref } from 'vue'
import { hasStoredSession } from '@/utils/authToken'

// The platform's front door. Not a subject page — signing in should land a
// student inside the product, not back on the public catalogue.
export const PLATFORM_HOME = '/dashboard'

export function usePlatformEntry() {
  const hasSession = ref(false)
  onMounted(() => {
    hasSession.value = hasStoredSession()
  })

  // Every marketing CTA — "Platformaga kirish" as much as "Bepul boshlash" —
  // leads to the same door: straight into the platform when there is a session,
  // otherwise registration, carrying the platform as the destination so the
  // journey finishes where the button promised.
  //
  // Registration, not login, for both: most people arriving from the landing
  // page have no account yet, and /register already offers "Hisobingiz bormi?
  // Kirish" for the ones who do. Sending a first-time visitor to a login form
  // they cannot fill in is the worse failure of the two.
  const entry = computed(() =>
    hasSession.value ? PLATFORM_HOME : { path: '/register', query: { redirect: PLATFORM_HOME } },
  )

  // Two names kept because the CTAs read differently, even though they now
  // resolve identically.
  return { hasSession, enter: entry, start: entry }
}
