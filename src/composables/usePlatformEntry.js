// Where the marketing site's calls-to-action lead.
//
// One place decides this, because four buttons each hardcoding their own answer
// is exactly how "Platformaga kirish" ended up pointing at /math — a public
// subject page — for signed-in visitors, while "Bepul boshlash" sent people who
// were already signed in to a login form.
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

  // "Platformaga kirish" — straight in when there is a session; otherwise sign
  // in and carry the platform as the destination, so the journey finishes where
  // the button promised rather than on whatever the login page defaults to.
  const enter = computed(() =>
    hasSession.value ? PLATFORM_HOME : { path: '/login', query: { redirect: PLATFORM_HOME } },
  )

  // "Bepul boshlash" — a visitor who has never registered should meet the
  // registration form, not a login form they cannot fill in.
  const start = computed(() =>
    hasSession.value ? PLATFORM_HOME : { path: '/register', query: { redirect: PLATFORM_HOME } },
  )

  return { hasSession, enter, start }
}
