// The subject registry. One entry per subject, shared by the Testlar grid, the
// test rows and the dashboard so a subject cannot look like two different things
// in two places.
//
// `icon` names a path set in AppIcon.vue — the platform's one icon style.
// `api` is the backend SubjectType enum value; `aliases` cover the other
// spellings the admin panel may have stored, matched case-insensitively, so a
// test is never dropped just because its subject string is worded differently.
export const SUBJECTS = {
  math: {
    label: 'Matematika',
    icon: 'calculator',
    api: 'Math',
    aliases: ['math', 'matematika', 'математика'],
    description: 'Algebra, geometriya, arifmetika va boshqa bo‘limlar',
  },
  motherTongue: {
    label: 'Ona tili',
    // The official name; rows and the subject page heading use this.
    fullLabel: 'Ona tili va adabiyot',
    icon: 'book',
    api: 'MotherTongue',
    aliases: ['mothertongue', 'mother tongue', 'ona tili', 'onatili', 'родной язык'],
    description: 'Grammatika, imlo, uslubiyat va matn tahlili',
  },
  physics: {
    label: 'Fizika',
    icon: 'atom',
    api: 'Physics',
    aliases: ['physics', 'fizika', 'физика'],
    description: 'Mexanika, termodinamika, elektr va optika',
  },
  chemistry: {
    label: 'Kimyo',
    icon: 'flask',
    api: 'Chemistry',
    aliases: ['chemistry', 'kimyo', 'химия'],
    description: 'Noorganik, organik kimyo va kimyoviy reaksiyalar',
  },
  history: {
    label: 'Tarix',
    icon: 'landmark',
    api: 'History',
    aliases: ['history', 'tarix', 'история'],
    description: 'O‘zbekiston tarixi va jahon tarixi',
  },
  geography: {
    label: 'Geografiya',
    icon: 'globe',
    api: 'Geography',
    aliases: ['geography', 'geografiya', 'география'],
    description: 'Tabiiy geografiya va iqtisodiy geografiya',
  },
  english: {
    label: 'Ingliz tili',
    icon: 'languages',
    api: 'English',
    aliases: ['english', 'ingliz tili', 'ingliztili', 'английский'],
    description: 'Grammar, vocabulary, reading va listening',
  },
  informatics: {
    label: 'Informatika',
    icon: 'monitor',
    api: 'Informatics',
    aliases: ['informatics', 'informatika', 'информатика'],
    description: 'Algoritmlar, dasturlash va axborot texnologiyalari',
  },
  biology: {
    label: 'Biologiya',
    icon: 'leaf',
    api: 'Biology',
    aliases: ['biology', 'biologiya', 'биология'],
    description: 'Botanika, zoologiya, odam va uning salomatligi',
  },
}

// Display order of the Fanlar grid. Subjects the backend has no tests for are
// dropped from the grid entirely, so this is an ordering, not a whitelist.
export const SUBJECT_ORDER = [
  'math',
  'motherTongue',
  'physics',
  'chemistry',
  'history',
  'geography',
  'english',
  'informatics',
  'biology',
]

// What a subject unknown to this registry falls back to, so a test whose
// subject string we do not recognise is still shown rather than silently lost.
export const unknownSubject = (raw) => ({
  label: String(raw || 'Boshqa'),
  icon: 'tests',
  description: '',
  isUnknown: true,
})

export const getSubject = (key) => SUBJECTS[key] ?? null

// Backend subject string → registry key. Exact enum match first, then aliases,
// both case-insensitive. Returns null when nothing matches.
export function subjectKeyFromApi(value) {
  const raw = String(value ?? '').toLowerCase().trim()
  if (!raw) return null

  for (const [key, subject] of Object.entries(SUBJECTS)) {
    if (subject.api.toLowerCase() === raw) return key
  }
  for (const [key, subject] of Object.entries(SUBJECTS)) {
    if (subject.aliases.some((alias) => raw === alias || raw.includes(alias))) return key
  }
  return null
}

export const ACTION_BY_STATE = {
  new: 'Testni boshlash',
  progress: 'Davom etish',
  done: 'Natijani ko‘rish',
}
