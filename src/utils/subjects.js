// Shared subject filter definitions. `value` is a stable key; `aliases` are the
// backend `subject` strings this option should match (case-insensitive). Aliases
// cover likely spellings so filtering works regardless of how the admin enum is
// stored. `null` aliases means "match everything" (the All option).
export const SUBJECT_FILTER_OPTIONS = [
  { value: 'all', label: 'Barcha fanlar', aliases: null },
  { value: 'math', label: 'Matematika', aliases: ['math', 'matematika', 'математика'] },
  { value: 'history', label: 'Tarix', aliases: ['history', 'tarix', 'история'] },
  {
    value: 'nativeLanguage',
    label: 'Ona tili',
    aliases: ['nativelanguage', 'native', 'mothertongue', 'uzbek', 'onatili', 'ona tili', 'til', 'language', 'родной', 'язык'],
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

// Icon descriptor per subject, keyed by SUBJECT_FILTER_OPTIONS `value`. Math is a
// typeset f(x) mark (rendered as text); the rest are stroke-path SVG icons. Keep
// these in sync with SubjectPage.vue's SUBJECT_CONFIG.
const SUBJECT_ICONS = {
  math: { kind: 'fx' },
  history: {
    // Scroll / manuscript.
    kind: 'paths',
    paths: [
      'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4',
      'M19 17V5a2 2 0 0 0-2-2H4',
    ],
  },
  nativeLanguage: {
    // Open book.
    kind: 'paths',
    paths: [
      'M12 7v14',
      'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
    ],
  },
}

// Resolve a backend subject string to its icon descriptor. Falls back to the
// math f(x) mark when the subject is unknown.
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
