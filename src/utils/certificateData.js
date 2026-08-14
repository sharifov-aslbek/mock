function formatScore(value) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return '0'
  }

  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2)
}

// The lowest percentage that still earns a certificate. Below this there is no
// letter at all — the certificate says the student was not recommended for one.
export const CERTIFICATE_PASS_PERCENT = 46

export const NO_CERTIFICATE_TEXT = 'Sertifikatga tavsiya etilmadingiz'

// The official band table — the one printed on the certificate. Exported so
// every screen that shows a test grade reads the same thresholds instead of
// inventing its own; a result page that called 0% a "C" would be promising a
// certificate the student is not getting.
export function gradeFromPercentage(percentage) {
  if (percentage >= 70) {
    return 'A+'
  }

  if (percentage >= 65) {
    return 'A'
  }

  if (percentage >= 60) {
    return 'B+'
  }

  if (percentage >= 50) {
    return 'B'
  }

  if (percentage >= CERTIFICATE_PASS_PERCENT) {
    return 'C'
  }

  return NO_CERTIFICATE_TEXT
}

// True when the percentage earns a letter grade at all.
export const hasCertificateGrade = (percentage) =>
  Number(percentage) >= CERTIFICATE_PASS_PERCENT

// Deterministic per-account personal code. The same user always gets the same
// 14-digit code (derived from their stable account id/username/email), so it is
// reproducible across sessions — not random.
function generatePersonalCode(identity) {
  const seed = String(
    identity?.id ?? identity?.username ?? identity?.email ?? '',
  ).trim()

  if (!seed) {
    return '—'
  }

  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  let code = String(hash)
  let salt = hash
  while (code.length < 14) {
    salt = (salt * 1103515245 + 12345) >>> 0
    code += String(salt)
  }

  return code.slice(0, 14)
}

function formatIssuedDate(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

export function buildCertificateViewModel({
  submission,
  user,
  test,
  attemptId,
  issuedAt,
  subjectName,
}) {
  // Display name of the subject this test belongs to (e.g. "Matematika").
  // The caller resolves it from the test list, since the test-detail endpoint
  // doesn't return the subject. Falls back to Matematika.
  const subjectDisplay =
    subjectName && String(subjectName).trim()
      ? String(subjectName).trim()
      : 'Matematika'
  const totalScore = Number(submission?.totalScore ?? 0)
  const maxScore = Number(submission?.maxScore ?? 0)
  const correctCount = Number(submission?.correctCount ?? 0)
  const incorrectCount = Number(submission?.incorrectCount ?? 0)

  // Total questions in the WHOLE test (includes skipped). submission.questions
  // and submission.maxScore frequently cover only the answered questions, which
  // would inflate the percentage when most answers are skipped.
  const submissionQuestions = Array.isArray(submission?.questions) ? submission.questions : []
  const testQuestions = Array.isArray(test?.questions) ? test.questions : []
  const totalQuestionCount =
    testQuestions.length ||
    submissionQuestions.length ||
    correctCount + incorrectCount

  // Full point max: prefer backend maxScore only when it spans the whole test;
  // otherwise sum per-question scores across the full test.
  const fullMaxFromTest = testQuestions.reduce(
    (sum, question) => sum + (Number(question?.score) || 0),
    0,
  )
  const effectiveMax =
    fullMaxFromTest > 0 ? fullMaxFromTest : maxScore > 0 ? maxScore : 0

  // Percentage and grade are POINT-based — derived from the same earned/max
  // points printed on the certificate — so the points, the percentage and the
  // grade stay mutually consistent even when questions carry different weights.
  const percentage = effectiveMax > 0 ? (totalScore / effectiveMax) * 100 : 0

  const omittedCount = Math.max(0, totalQuestionCount - correctCount - incorrectCount)

  // The certificate name must be the test-taker's real, complete name. Two
  // sources can supply it: the submission snapshot (submission.user) and the
  // live signed-in profile (user = authStore.userInfo). Either can be only
  // partially filled, so resolve each field independently — prefer the live
  // profile and fall back to the snapshot — instead of picking one object
  // wholesale. (Previously `submission.user || user` let a snapshot carrying
  // only firstName win over a complete profile, printing blank Familiya/Otasi.)
  const snapshotIdentity = submission?.user || null
  const firstNonEmpty = (...values) => {
    for (const value of values) {
      if (value != null && String(value).trim()) {
        return value
      }
    }
    return null
  }
  const identity =
    snapshotIdentity || user
      ? {
          id: user?.id ?? snapshotIdentity?.id ?? null,
          username: user?.username ?? snapshotIdentity?.username ?? null,
          email: user?.email ?? snapshotIdentity?.email ?? null,
          firstName: firstNonEmpty(user?.firstName, snapshotIdentity?.firstName),
          lastName: firstNonEmpty(user?.lastName, snapshotIdentity?.lastName),
          fatherName: firstNonEmpty(user?.fatherName, snapshotIdentity?.fatherName),
          personalCode: firstNonEmpty(
            user?.personalCode,
            user?.pinfl,
            user?.jshshir,
            snapshotIdentity?.personalCode,
            snapshotIdentity?.pinfl,
            snapshotIdentity?.jshshir,
          ),
        }
      : null

  const certificateNumber = attemptId
    ? `UZ25 ${String(attemptId).padStart(6, '0')}`
    : '—'

  return {
    certificateNumber,
    personalCode: identity?.personalCode || generatePersonalCode(identity),
    lastName: String(identity?.lastName || '—').toUpperCase(),
    firstName: String(identity?.firstName || '—').toUpperCase(),
    fatherName: String(identity?.fatherName || '—').toUpperCase(),
    subject: subjectDisplay,
    subjectLine: `${subjectDisplay} (O‘zbek)`,
    totalScore: formatScore(totalScore),
    maxScore: formatScore(effectiveMax),
    correctCount: String(correctCount),
    incorrectCount: String(incorrectCount),
    omittedCount: String(omittedCount),
    percentage: `${percentage.toFixed(2)} %`,
    grade: gradeFromPercentage(percentage),
    issuedDate: formatIssuedDate(issuedAt instanceof Date ? issuedAt : new Date()),
    resultRows: [
      { name: "To'g'ri javoblar", score: String(correctCount) },
      // A skipped question is a mistake too — count omitted questions as
      // "Noto'g'ri" so the certificate matches the results-page tally.
      { name: "Noto'g'ri javoblar", score: String(incorrectCount + omittedCount) },
      { name: "Umumiy ball", score: `${formatScore(totalScore)} / ${formatScore(effectiveMax)}` },
    ],
  }
}
