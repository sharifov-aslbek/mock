// The subject registry. One entry per subject, shared by the Testlar grid, the
// test rows and the dashboard so a subject cannot look like two different things
// in two places.
//
// `icon` names a path set in AppIcon.vue — the platform's one icon style. The
// order below is the order of the Fanlar grid.
export const SUBJECTS = {
  math: {
    label: 'Matematika',
    icon: 'calculator',
    description: 'Algebra, geometriya, arifmetika va boshqa bo‘limlar',
  },
  motherTongue: {
    label: 'Ona tili',
    // The full name is the official one; the grid card and rows use `label`.
    fullLabel: 'Ona tili va adabiyot',
    icon: 'book',
    description: 'Grammatika, imlo, uslubiyat va matn tahlili',
  },
  physics: {
    label: 'Fizika',
    icon: 'atom',
    description: 'Mexanika, termodinamika, elektr va optika',
  },
  chemistry: {
    label: 'Kimyo',
    icon: 'flask',
    description: 'Noorganik, organik kimyo va kimyoviy reaksiyalar',
  },
  history: {
    label: 'Tarix',
    icon: 'landmark',
    description: 'O‘zbekiston tarixi va jahon tarixi',
  },
  geography: {
    label: 'Geografiya',
    icon: 'globe',
    description: 'Tabiiy geografiya va iqtisodiy geografiya',
  },
  english: {
    label: 'Ingliz tili',
    icon: 'languages',
    description: 'Grammar, vocabulary, reading va listening',
  },
  informatics: {
    label: 'Informatika',
    icon: 'monitor',
    description: 'Algoritmlar, dasturlash va axborot texnologiyalari',
  },
  biology: {
    label: 'Biologiya',
    icon: 'leaf',
    description: 'Botanika, zoologiya, odam va uning salomatligi',
  },
}

// The order the Fanlar grid renders in. Biologiya is deliberately absent — it is
// not in the approved Testlar mockup. Add its key here to show it.
export const SUBJECT_ORDER = [
  'math',
  'motherTongue',
  'physics',
  'chemistry',
  'history',
  'geography',
  'english',
  'informatics',
]

export const getSubject = (key) => SUBJECTS[key] ?? null

// A mock is identified by the exam date and shift it reproduces.
export const testName = (test) => `${test.date} (${test.shift}-smena)`

export const ACTION_BY_STATE = {
  new: 'Testni boshlash',
  progress: 'Davom etish',
  done: 'Natijani ko‘rish',
}
