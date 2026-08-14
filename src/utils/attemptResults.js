// One attempt's grade, from GET /user-test-attempt/get-results.
//
// This exists because the attempts list (get-user-attempts) carries `totalScore`
// but not `maxScore`, and maxScore is NOT always 100 — it varies per test (99 on
// some, 100 on others). So a percentage cannot be derived from the list alone;
// it costs one request per attempt, which is why callers resolve only the
// attempts they are actually showing.
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

// Grading is NOT defined here. MilliyMock has one official band table — the one
// printed on the certificate (utils/certificateData.js) — and it does not match
// the imported design's generic 90/80/70/60/50 ladder: a certificate needs 46%,
// and below that there is no letter at all. Re-exported so callers reach the
// real table without importing certificate internals.
export {
  gradeFromPercentage,
  hasCertificateGrade,
  CERTIFICATE_PASS_PERCENT,
  NO_CERTIFICATE_TEXT,
} from '@/utils/certificateData'

export async function fetchAttemptScore(attemptId) {
  const baseUrl = getTestApiBaseUrl()
  const authStore = useAuthStore()
  if (!baseUrl || !authStore.isAuthenticated) throw new Error('Not authenticated')

  const response = await apiFetch(
    `${baseUrl}/user-test-attempt/get-results?testAttemptId=${Number(attemptId)}`,
    { headers: { accept: '*/*', Authorization: `Bearer ${authStore.token}` } },
  )
  const payload = await response.json()
  if (!response.ok || payload?.code !== 200 || !payload?.data) {
    throw new Error(payload?.message || `HTTP ${response.status}`)
  }

  const data = payload.data
  const maxScore = Number(data.maxScore) || 0
  const totalScore = Number(data.totalScore) || 0

  return {
    totalScore,
    maxScore,
    // No max means the attempt is not gradable this way — leave the percentage
    // absent rather than dividing by zero and rendering NaN%.
    percent: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : null,
    correctCount: Number(data.correctCount) || 0,
    incorrectCount: Number(data.incorrectCount) || 0,
  }
}
