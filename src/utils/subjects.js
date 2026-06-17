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
