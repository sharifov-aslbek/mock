function formatScore(value) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    return '0'
  }

  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2)
}

function gradeFromPercentage(percentage) {
  if (percentage >= 90) {
    return 'A'
  }

  if (percentage >= 80) {
    return 'B'
  }

  if (percentage >= 70) {
    return 'C'
  }

  if (percentage >= 60) {
    return 'D'
  }

  return 'F'
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
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
  const omittedCount = Math.max(
    0,
    (Array.isArray(submission?.questions) ? submission.questions.length : 0) -
      correctCount -
      incorrectCount,
  )

  // Prefer identity returned by the submission itself (tempUser for guests, user for logged-in)
  // so the certificate reflects exactly what was submitted to the backend.
  const identity = submission?.tempUser || submission?.user || user || null

  const certificateNumber = attemptId
    ? `UZ25 ${String(attemptId).padStart(6, '0')}`
    : '—'

  return {
    certificateNumber,
    personalCode:
      identity?.personalCode ||
      identity?.pinfl ||
      identity?.jshshir ||
      (identity?.id != null ? String(identity.id) : '—'),
    lastName: String(identity?.lastName || '—').toUpperCase(),
    firstName: String(identity?.firstName || '—').toUpperCase(),
    fatherName: String(identity?.fatherName || '—').toUpperCase(),
    subject: resolveTestSubject(test),
    totalScore: formatScore(totalScore),
    maxScore: formatScore(maxScore),
    correctCount: String(correctCount),
    incorrectCount: String(incorrectCount),
    omittedCount: String(omittedCount),
    percentage: `${percentage.toFixed(2)} %`,
    grade: gradeFromPercentage(percentage),
    issuedDate: formatIssuedDate(issuedAt instanceof Date ? issuedAt : new Date()),
    resultRows: [
      { name: "To'g'ri javoblar", score: String(correctCount) },
      { name: "Noto'g'ri javoblar", score: String(incorrectCount) },
      { name: "Umumiy ball", score: `${formatScore(totalScore)} / ${formatScore(maxScore)}` },
    ],
  }
}
