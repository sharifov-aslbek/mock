// Ona tili insho (essay) AI-analysis: production constants + normalizer.
//
// The AI (Gemini) grades the essay and returns a JSON object shaped like:
//
//   {
//     "on_topic": true,
//     "copied_suspected": false,
//     "global_notes": "…",
//     "error_criteria": {
//       "c5_structure":   { "errors": [ { "quote": "…", "issue": "…", "error_type": "…" } ] },
//       "c6_repetition":  { "errors": [] },
//       …c7_spelling / c8_punctuation / c9_affix / c10_word_style / c12_register…
//     },
//     "judgment_criteria": {
//       "c1_style": { "reasoning": "…", "band": "2" },
//       …c2_viewpoints / c3_content / c4_composition…
//     }
//   }
//
// The backend can pass that object through UNCHANGED — normalizeEssayAnalysis()
// below converts it into the view model EssayAnalysisSection.vue renders, and
// it is deliberately tolerant: missing categories, empty error lists, string
// bands and even unknown future criteria keys all render without a crash.
//
// Scoring: 12 mezon (c1–c12) × 0–2 ball = 24 ball (ESSAY_BAND_MAX). The
// overall band total is expected from the backend alongside the analysis.
import { AI_REVIEW_MODES, getAiReviewMode } from '@/utils/aiReview'

export const ESSAY_BAND_MAX = 24
// The official certificate scale: the 24-band total is projected linearly
// onto 75 points (score / 24 × 75) for display alongside the raw band.
export const ESSAY_SCALED_MAX = 75
export const JUDGMENT_BAND_MAX = 2

// The one definition of that projection — used both for the "Shkala" figure in
// the analysis section and for the insho's slice of the attempt total
// (rescaleEssayTotals below), so the essay block and the score above it can
// never disagree about the same essay. Whole points, halves up (12 → 37.5 → 38).
export function scaleEssayBand(bandTotal, bandMax = ESSAY_BAND_MAX) {
  const total = Number(bandTotal)
  const max = Number(bandMax)

  if (!Number.isFinite(total) || !Number.isFinite(max) || max <= 0) {
    return null
  }

  return Math.round((total / max) * ESSAY_SCALED_MAX)
}

// True when this attempt's questions include the Ona tili insho. Everything
// below is keyed on it: Biology's AI-reviewed questions carry a real per-question
// Score the server already counts, so they must pass through untouched.
export function hasMotherTongueEssay(questions) {
  const list = Array.isArray(questions) ? questions : []

  return list.some(
    (question) => getAiReviewMode(question) === AI_REVIEW_MODES.motherTongueEssay,
  )
}

// The attempt's points with the insho rebased from 24 to 75 — Ona tili only.
//
// The server counts the essay at its RAW band: AttachEssayReviewAsync does
// `MaxScore += 24` and `TotalScore += band`. That leaves the insho worth ~24% of
// an Ona tili test while the analysis section prints it as "n/75" — the official
// weighting, where the essay carries as much as the whole closed-question block.
// The two numbers described the same essay and disagreed by ~3×.
//
// So the 24-point slice the server added is swapped here for its 75-point
// projection: a test whose closed questions total 75 reads 150, and an 18/24
// essay contributes 56 points to it rather than 18. Frontend-only — the server
// still stores the raw band, which is what `essayReview.totalScore` carries in.
export function rescaleEssayTotals({ totalScore, maxScore, questions, essayReview }) {
  const total = Number(totalScore) || 0
  const max = Number(maxScore) || 0

  // `max < ESSAY_BAND_MAX` means the 24 is not in there to take back out (a
  // half-built payload, or a server that stopped adding it) — leave it alone
  // rather than inventing a negative maximum.
  if (!hasMotherTongueEssay(questions) || max < ESSAY_BAND_MAX) {
    return { totalScore: total, maxScore: max }
  }

  // The server adds the 24 to the max as soon as the test HAS an essay question,
  // but adds to the total only once a review exists. While grading is pending
  // (or after it failed) the band is absent and only the maximum moves.
  const band = Number(essayReview?.totalScore)
  const scaled = Number.isFinite(band) ? scaleEssayBand(band) : null

  return {
    totalScore: scaled === null ? total : total - band + scaled,
    maxScore: max - ESSAY_BAND_MAX + ESSAY_SCALED_MAX,
  }
}

// Judgment criteria (holistic bands) — labels for known keys; unknown keys
// fall back to the raw key so new criteria never break the UI.
export const judgmentCriteriaMeta = {
  c1_style: { label: 'Uslub', short: 'C1' },
  c2_viewpoints: { label: 'Nuqtai nazar', short: 'C2' },
  c3_content: { label: 'Mazmun va dalillar', short: 'C3' },
  c4_composition: { label: 'Kompozitsiya', short: 'C4' },
}

// Error criteria: display order, label and highlight color (light theme).
// `block: true` renders as a sentence-level left-rail block (whole-sentence
// structure errors); the rest render as inline highlighter marks.
export const errorCriteriaMeta = {
  c5_structure: { label: 'Gap qurilishi', color: '#5b7ea3', block: true },
  c6_repetition: { label: 'Takror', color: '#b8703c' },
  c7_spelling: { label: 'Imlo', color: '#c25d52' },
  c8_punctuation: { label: 'Tinish belgilari', color: '#c08a3e' },
  c9_affix: { label: "Qo'shimchalar", color: '#7d6bb0' },
  c10_word_style: { label: "So'z qo'llash", color: '#4f8f88' },
  c12_register: { label: "Uslubiy me'yor", color: '#b56b93' },
}

const FALLBACK_CAT_META = { label: '', color: '#8a857c', block: false }

// Meta for a category key, safe for unknown keys (label falls back to the key).
export function catMeta(cat) {
  return errorCriteriaMeta[cat] || { ...FALLBACK_CAT_META, label: String(cat) }
}

// Raw AI response → view model. Never throws on malformed input.
export function normalizeEssayAnalysis(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}

  const errorCriteria =
    source.error_criteria && typeof source.error_criteria === 'object'
      ? source.error_criteria
      : {}

  // Known categories keep their curated display order; unknown keys the AI
  // may add later are appended after them.
  const knownCats = Object.keys(errorCriteriaMeta).filter((cat) => cat in errorCriteria)
  const extraCats = Object.keys(errorCriteria).filter((cat) => !(cat in errorCriteriaMeta))
  const cats = [...knownCats, ...extraCats]

  const errors = cats.flatMap((cat) => {
    const list = Array.isArray(errorCriteria[cat]?.errors) ? errorCriteria[cat].errors : []
    return list
      .filter((error) => error && typeof error.quote === 'string' && error.quote.trim())
      .map((error, index) => ({
        id: `${cat}-${index}`,
        cat,
        quote: error.quote,
        issue: String(error.issue || ''),
        errorType: String(error.error_type || ''),
      }))
  })

  const judgment = Object.entries(
    source.judgment_criteria && typeof source.judgment_criteria === 'object'
      ? source.judgment_criteria
      : {},
  ).map(([key, value]) => {
    const band = Number.parseInt(value?.band, 10)
    const meta = judgmentCriteriaMeta[key]
    return {
      key,
      label: meta?.label || key,
      short: meta?.short || key.toUpperCase(),
      reasoning: String(value?.reasoning || ''),
      band: Number.isFinite(band) ? band : 0,
    }
  })

  return {
    onTopic: source.on_topic !== false,
    copiedSuspected: source.copied_suspected === true,
    globalNotes: String(source.global_notes || ''),
    errors,
    judgment,
    catsWithHits: cats.filter((cat) => errors.some((error) => error.cat === cat)),
    cleanCats: cats.filter((cat) => !errors.some((error) => error.cat === cat)),
  }
}
