// Biology open-response (AiReviewMode.BiologyOpenResponse) AI review: constants
// + normalizer for what get-results returns under `biologyReviews`.
//
// One entry per AI-graded question:
//
//   {
//     id, questionId,
//     problemType: "genetika (uch genli birikish va krossingover)",
//     verdict: "graded" | "wrong_method" | …,
//     totalScore: 25,                 // or { source: "22.0", parsedValue: 22 }
//     maxScore: 25,
//     methodologicalScore, arithmeticScore, presentationScore,
//     methodBlockVoided: false,
//     globalNotes: "…",
//     elementBreakdownJson: "{\"a1\":{applicable,verdict,weight}, …}",
//     evaluationJson: "{ problem_type, …flags, global_notes, elements:[…] }"
//   }
//
// The two JSON columns overlap: elementBreakdownJson carries each criterion's
// WEIGHT, evaluationJson carries its REASONING and QUOTE. normalizeBiologyReview
// merges them by criterion code, and is deliberately tolerant — either column
// may be missing, unparseable, or gain criteria this build has never seen.

// Criterion codes are grouped by their leading letter. a/b feed the
// methodological score, c the arithmetic score, d the presentation score.
export const ELEMENT_GROUPS = [
  { key: 'a', label: 'Yondashuv va shart' },
  { key: 'b', label: 'Sxema va modellashtirish' },
  { key: 'c', label: 'Hisob-kitob' },
  { key: 'd', label: 'Javob va rasmiylashtirish' },
]

const OTHER_GROUP = { key: 'other', label: 'Boshqa mezonlar' }

export const ELEMENT_VERDICTS = {
  full: { label: 'To‘liq', color: '#4f7a55' },
  partial: { label: 'Qisman', color: '#c08a3e' },
  zero: { label: 'Bajarilmagan', color: '#c25d52' },
}

// Criteria the AI marked not applicable to this problem type (e.g. a Punnett
// square on a molecular-biology task). They score nothing and are not failures.
export const SKIPPED_VERDICT = { label: 'Tegishli emas', color: '#a39e94' }

export const SCORE_BUCKETS = [
  { key: 'methodologicalScore', label: 'Metodik qism', color: '#5b7ea3' },
  { key: 'arithmeticScore', label: 'Hisob-kitoblar', color: '#4f8f88' },
  { key: 'presentationScore', label: 'Rasmiylashtirish', color: '#b8703c' },
]

// verdict === "graded" is the normal case. EVERY other verdict is an official
// zero condition — totalScore is 0 and the UI shows the verdict's `explanation`
// instead of a score breakdown.
const REVIEW_VERDICTS = {
  graded: { label: 'Baholandi', tone: 'ok' },
  wrong_method: {
    label: 'Yechim usuli xato',
    tone: 'bad',
    explanation:
      'Tanlangan yechim usuli tubdan xato. Rasmiy baholash qoidasiga ko‘ra bunday yechimga 0 ball qo‘yiladi.',
  },
  answer_only: {
    label: 'Faqat javob yozilgan',
    tone: 'warn',
    explanation:
      'Rasmda faqat javob ko‘rsatilgan, yechimning o‘zi yozilmagan. Yechimsiz javob rasmiy qoidaga ko‘ra baholanmaydi — 0 ball.',
  },
  no_solution: {
    label: 'Yechim yozilmagan',
    tone: 'bad',
    explanation:
      'Yuborilgan rasmda bu topshiriqning yechimi topilmadi, shuning uchun 0 ball qo‘yildi.',
  },
  illegible: {
    label: 'O‘qib bo‘lmadi',
    tone: 'bad',
    explanation:
      'Qo‘lyozmani o‘qib bo‘lmadi, shuning uchun yechim baholanmadi. Keyingi safar yechimni aniqroq yozib, yorug‘ joyda suratga oling.',
  },
  gross_biological_error: {
    label: 'Jiddiy biologik xato',
    tone: 'bad',
    explanation:
      'Yechimda jiddiy biologik xato bor. Rasmiy baholash qoidasiga ko‘ra bunday yechimga 0 ball qo‘yiladi.',
  },
  no_applicable_elements: {
    label: 'Baholanadigan element yo‘q',
    tone: 'bad',
    explanation:
      'Yechimda baholash mezonlariga mos keladigan element topilmadi, shuning uchun ball qo‘yilmadi.',
  },
  pending: { label: 'Tekshirilmoqda', tone: 'warn' },
}

// Blocking problems the AI flags on the evaluation payload. Each one explains a
// heavily reduced score, so they surface as warning chips above the criteria.
const FLAGS = [
  { key: 'method_fundamentally_wrong', label: 'Yechim usuli tubdan xato' },
  { key: 'gross_biological_error', label: 'Jiddiy biologik xato' },
  { key: 'answer_only', label: 'Faqat javob yozilgan, yechimsiz' },
  { key: 'no_solution', label: 'Yechim yozilmagan' },
  { key: 'illegible', label: 'Qo‘lyozma o‘qilmadi' },
]

// Scores arrive either as a bare number or boxed as { source, parsedValue }
// (a serializer quirk on the grading pipeline), and `source` is a string that
// may use a decimal comma. Read every one of those shapes, else null.
export function readScore(value) {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim().replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }

  if (typeof value === 'object') {
    const parsed = readScore(value.parsedValue ?? value.ParsedValue)
    return parsed !== null ? parsed : readScore(value.source ?? value.Source)
  }

  return null
}

// Trim trailing zeros so 22.0 reads "22" but 4.5 stays "4.5".
export function formatScore(value) {
  const score = readScore(value)
  if (score === null) {
    return '—'
  }
  return Number.isInteger(score) ? String(score) : String(Math.round(score * 10) / 10)
}

function parseJsonColumn(raw) {
  if (raw && typeof raw === 'object') {
    return raw
  }

  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw)
    } catch {
      // Malformed column — the caller falls back to the flattened fields.
    }
  }

  return null
}

function normalizeVerdict(value) {
  const verdict = String(value || '').trim().toLowerCase()

  if (REVIEW_VERDICTS[verdict]) {
    return { key: verdict, ...REVIEW_VERDICTS[verdict] }
  }

  // No verdict at all → an older row from before the verdict column; treat as
  // graded. An UNKNOWN verdict is, per the contract, some new zero condition —
  // pass the raw name through with a generic zero explanation.
  if (!verdict) {
    return { key: '', ...REVIEW_VERDICTS.graded }
  }

  return {
    key: verdict,
    label: String(value),
    tone: 'warn',
    explanation: 'Rasmiy baholash qoidasiga ko‘ra bu yechimga ball qo‘yilmadi.',
  }
}

// One raw review → the view model BiologyReviewSection renders. Never throws.
export function normalizeBiologyReview(raw) {
  const review = raw && typeof raw === 'object' ? raw : {}
  const evaluation = parseJsonColumn(review.evaluationJson) || {}
  const breakdown = parseJsonColumn(review.elementBreakdownJson) || {}

  // Criterion codes from BOTH columns, so a criterion present in only one still
  // renders. evaluationJson's order is the AI's own reading order; anything that
  // exists only in the breakdown is appended.
  const evaluationElements = Array.isArray(evaluation.elements) ? evaluation.elements : []
  const codes = [
    ...evaluationElements.map((element) => String(element?.code || '').trim()).filter(Boolean),
  ]
  for (const code of Object.keys(breakdown)) {
    if (!codes.includes(code)) {
      codes.push(code)
    }
  }

  const elements = codes.map((code) => {
    const fromEvaluation =
      evaluationElements.find((element) => String(element?.code || '').trim() === code) || {}
    const fromBreakdown = breakdown[code] || {}

    // `applicable: false` wins from either column — a criterion the AI skipped
    // must not read as a lost point.
    const applicable = fromEvaluation.applicable !== false && fromBreakdown.applicable !== false
    const verdictKey = String(fromEvaluation.verdict || fromBreakdown.verdict || '')
      .trim()
      .toLowerCase()
    const weight = readScore(fromBreakdown.weight ?? fromEvaluation.weight)

    return {
      code,
      label: code.toUpperCase(),
      groupKey: /^[a-d]/i.test(code) ? code[0].toLowerCase() : OTHER_GROUP.key,
      applicable,
      verdictKey: applicable ? verdictKey : 'skipped',
      verdict: applicable ? ELEMENT_VERDICTS[verdictKey] || SKIPPED_VERDICT : SKIPPED_VERDICT,
      weight,
      reasoning: String(fromEvaluation.reasoning || ''),
      quote: String(fromEvaluation.quote || '').trim(),
    }
  })

  const applicableElements = elements.filter((element) => element.applicable)

  const groups = [...ELEMENT_GROUPS, OTHER_GROUP]
    .map((group) => ({
      ...group,
      elements: elements.filter((element) => element.groupKey === group.key),
    }))
    .filter((group) => group.elements.length > 0)

  const totalScore = readScore(review.totalScore)
  const maxScore = readScore(review.maxScore)

  const buckets = SCORE_BUCKETS.map((bucket) => ({
    ...bucket,
    value: readScore(review[bucket.key]) ?? 0,
  }))

  const verdict = normalizeVerdict(review.verdict)

  return {
    id: review.id ?? null,
    questionId: Number(review.questionId) || null,
    problemType: String(review.problemType || evaluation.problem_type || '').trim(),
    verdict,
    // Only a graded review shows the score split + criterion breakdown; a zero
    // condition shows verdict.explanation instead.
    isGraded: verdict.key === 'graded' || verdict.key === '',
    totalScore,
    maxScore,
    percent:
      totalScore !== null && maxScore
        ? Math.max(0, Math.min(100, Math.round((totalScore / maxScore) * 100)))
        : null,
    buckets,
    globalNotes: String(evaluation.global_notes || review.globalNotes || '').trim(),
    methodBlockVoided: review.methodBlockVoided === true,
    flags: FLAGS.filter((flag) => evaluation[flag.key] === true),
    groups,
    counts: {
      total: applicableElements.length,
      full: applicableElements.filter((element) => element.verdictKey === 'full').length,
      partial: applicableElements.filter((element) => element.verdictKey === 'partial').length,
      zero: applicableElements.filter((element) => element.verdictKey === 'zero').length,
      skipped: elements.length - applicableElements.length,
    },
  }
}

export function normalizeBiologyReviews(rawReviews) {
  return (Array.isArray(rawReviews) ? rawReviews : []).map(normalizeBiologyReview)
}
