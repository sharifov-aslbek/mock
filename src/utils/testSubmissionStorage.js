const STORAGE_PREFIX = 'milliymock_test_submission'

function buildStorageKey(testId) {
  return `${STORAGE_PREFIX}_${Number(testId)}`
}

export function saveTestSubmission(testId, submission) {
  if (typeof window === 'undefined' || !testId || !submission) {
    return
  }

  window.localStorage.setItem(
    buildStorageKey(testId),
    JSON.stringify({
      savedAt: Date.now(),
      data: submission,
    }),
  )
}

export function loadTestSubmission(testId) {
  if (typeof window === 'undefined' || !testId) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(buildStorageKey(testId))

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)

    return parsed?.data ?? null
  } catch {
    return null
  }
}

export function clearTestSubmission(testId) {
  if (typeof window === 'undefined' || !testId) {
    return
  }

  window.localStorage.removeItem(buildStorageKey(testId))
}
