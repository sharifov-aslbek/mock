// Subject marks for test cards and rows.
//
// One glyph per subject, sized identically, so a list of mixed subjects reads
// as a system rather than assorted icons. Where a conventional symbol exists it
// is used (π, Δ); otherwise the subject's initial. Shared so the Testlar screen
// and the dashboard cannot drift apart.
export const SUBJECTS = {
  math: { label: 'Matematika', mark: 'π' },
  motherTongue: { label: 'Ona tili va adabiyot', mark: 'A' },
  history: { label: 'Tarix', mark: 'T' },
  physics: { label: 'Fizika', mark: 'Δ' },
  biology: { label: 'Biologiya', mark: 'B' },
}

// A mock is identified by the exam date and shift it reproduces.
export const testName = (test) => `${test.date} (${test.shift}-smena)`

export const ACTION_BY_STATE = {
  new: 'Testni boshlash',
  progress: 'Davom etish',
  done: 'Natijani ko‘rish',
}
