// One place decides what counts as a good score, so every screen — dashboard
// activity, test cards, results list, essay feedback — grades identically
// instead of each inventing its own threshold.
export const SCORE_PASS_MARK = 70

export const toneForScore = (percent) => (percent >= SCORE_PASS_MARK ? 'good' : 'bad')
