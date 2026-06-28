// Shared subject filter definitions. `value` is a stable key; `aliases` are the
// backend `subject` strings this option should match (case-insensitive). Aliases
// cover likely spellings so filtering works regardless of how the admin enum is
// stored. `null` aliases means "match everything" (the All option).
export const SUBJECT_FILTER_OPTIONS = [
  { value: 'all', label: 'Barcha fanlar', aliases: null },
  { value: 'math', label: 'Matematika', aliases: ['math', 'matematika', 'математика'] },
  { value: 'history', label: 'Tarix', aliases: ['history', 'tarix', 'история'] },
  {
    value: 'physics',
    label: 'Fizika',
    aliases: ['physics', 'fizika', 'физика'],
  },
]

export function subjectMatches(testSubject, aliases) {
  if (!aliases) {
    return true
  }
  const value = String(testSubject || '').toLowerCase().trim()
  if (!value) {
    return false
  }
  return aliases.some((alias) => value === alias || value.includes(alias) || alias.includes(value))
}

// True when a backend subject string refers to mathematics. Used to gate the
// formula reference tool, which only makes sense for math tests.
export function isMathSubject(testSubject) {
  const math = SUBJECT_FILTER_OPTIONS.find((option) => option.value === 'math')
  return subjectMatches(testSubject, math?.aliases)
}

// Icon descriptor per subject, keyed by SUBJECT_FILTER_OPTIONS `value`. Math is a
// typeset π (pi) mark (rendered as text); the rest are stroke-path SVG icons. Keep
// these in sync with SubjectPage.vue's SUBJECT_CONFIG.
const SUBJECT_ICONS = {
  math: { kind: 'pi' },
  history: {
    // Scroll / manuscript.
    kind: 'paths',
    paths: [
      'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4',
      'M19 17V5a2 2 0 0 0-2-2H4',
    ],
  },
  physics: {
    // Atom — nucleus with two crossing electron orbits.
    kind: 'paths',
    paths: [
      'M12 11.3a0.7 0.7 0 1 0 0 1.4 0.7 0.7 0 1 0 0-1.4',
      'M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z',
      'M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z',
    ],
  },
}

// Resolve a backend subject string to its icon descriptor. Falls back to the
// math π (pi) mark when the subject is unknown.
export function subjectIcon(testSubject) {
  const match = SUBJECT_FILTER_OPTIONS.find(
    (option) => option.aliases && subjectMatches(testSubject, option.aliases),
  )
  return SUBJECT_ICONS[match?.value] || SUBJECT_ICONS.math
}

// Map a backend subject string (e.g. "Math", "History", "NativeLanguage") to its
// Uzbek display label (e.g. "Matematika"). Falls back to the raw value, then
// "Matematika".
export function subjectDisplayName(testSubject) {
  const match = SUBJECT_FILTER_OPTIONS.find(
    (option) => option.aliases && subjectMatches(testSubject, option.aliases),
  )
  return match?.label || (testSubject ? String(testSubject).trim() : 'Matematika')
}
