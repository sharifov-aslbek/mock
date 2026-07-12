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

export const ESSAY_BAND_MAX = 24
export const JUDGMENT_BAND_MAX = 2

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
