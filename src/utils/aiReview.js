// Backend `AiReviewMode` enum, carried on each question. It is NULLABLE — a null
// mode means the question is graded normally and no AI review happens.
//
//   MotherTongueEssay   = 0   → the Ona tili insho (typed or transcribed text)
//   BiologyOpenResponse = 1   → answered ONLY by uploading photo(s) of the
//                               handwritten solution + drawings, via
//                               POST /user-answer/images
//
// The API serializes enums as their member name, but every read here also
// accepts the raw integer so a converter change can't silently drop the UI.
// NOTE: MotherTongueEssay is 0, which is falsy — never test a mode with a plain
// truthiness check; compare against null/undefined explicitly (that is what
// hasAiReview does).
export const AI_REVIEW_MODES = {
  motherTongueEssay: 'MotherTongueEssay',
  biologyOpenResponse: 'BiologyOpenResponse',
}

const AI_REVIEW_MODES_BY_NUMBER = {
  0: AI_REVIEW_MODES.motherTongueEssay,
  1: AI_REVIEW_MODES.biologyOpenResponse,
}

// Normalize a question's `aiReviewMode` to a canonical member name, or null when
// there is no AI review. An unrecognized (e.g. newly added) mode is passed
// through as-is rather than nulled, so the "AI tekshiradi" badge still shows for
// modes this build doesn't know about yet.
export function getAiReviewMode(question) {
  const rawMode = question?.aiReviewMode

  if (rawMode === null || rawMode === undefined || rawMode === '') {
    return null
  }

  if (typeof rawMode === 'number') {
    return AI_REVIEW_MODES_BY_NUMBER[rawMode] ?? String(rawMode)
  }

  const modeText = String(rawMode).trim()

  if (/^\d+$/.test(modeText)) {
    return AI_REVIEW_MODES_BY_NUMBER[Number(modeText)] ?? modeText
  }

  return (
    Object.values(AI_REVIEW_MODES).find(
      (mode) => mode.toLowerCase() === modeText.toLowerCase(),
    ) || modeText
  )
}

// True when the question is graded by AI — drives the "AI tekshiradi" badge.
export function hasAiReview(question) {
  return getAiReviewMode(question) !== null
}

// True for the image-only open response (Biology 41–43): no typed answer box,
// the uploaded photos ARE the answer.
export function isImageAnswerQuestion(question) {
  return getAiReviewMode(question) === AI_REVIEW_MODES.biologyOpenResponse
}
