function formatScore(value) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return '0'
  }

  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2)
}

function gradeFromPercentage(percentage) {
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

  if (percentage >= 46) {
    return 'C'
  }

  return 'Sertifikatga tavsiya etilmadingiz'
}

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

function resolveTestSubject(test) {
  if (!test) {
    return 'Matematika'
  }

  const translations = Array.isArray(test.translations) ? test.translations : []
  const preferred =
    translations.find((item) => item.language === 'Uzbek') || translations[0]

  return (
    preferred?.title ||
    preferred?.name ||
    test.name ||
    test.title ||
    'Matematika'
  )
}

export function buildCertificateViewModel({
  submission,
  user,
  test,
  attemptId,
  issuedAt,
}) {
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

  // Percentage/grade are count-based over ALL questions (same basis as the
  // results page), so skipping questions correctly lowers the score.
  const percentage =
    totalQuestionCount > 0 ? (correctCount / totalQuestionCount) * 100 : 0

  // Full point max: prefer backend maxScore only when it spans the whole test;
  // otherwise sum per-question scores across the full test.
  const fullMaxFromTest = testQuestions.reduce(
    (sum, question) => sum + (Number(question?.score) || 0),
    0,
  )
  const effectiveMax =
    fullMaxFromTest > 0 ? fullMaxFromTest : maxScore > 0 ? maxScore : 0

  const omittedCount = Math.max(0, totalQuestionCount - correctCount - incorrectCount)

  const identity = submission?.user || user || null

  const certificateNumber = attemptId
    ? `UZ25 ${String(attemptId).padStart(6, '0')}`
    : '—'

  return {
    certificateNumber,
    personalCode:
      identity?.personalCode ||
      identity?.pinfl ||
      identity?.jshshir ||
      generatePersonalCode(identity),
    lastName: String(identity?.lastName || '—').toUpperCase(),
    firstName: String(identity?.firstName || '—').toUpperCase(),
    fatherName: String(identity?.fatherName || '—').toUpperCase(),
    subject: resolveTestSubject(test),
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
      { name: "Noto'g'ri javoblar", score: String(incorrectCount) },
      { name: "Umumiy ball", score: `${formatScore(totalScore)} / ${formatScore(effectiveMax)}` },
    ],
  }
}
