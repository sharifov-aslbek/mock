// Saved essay checkings ("Insho tekshirish" history).
//
// The essay centre has no backend of its own yet — unlike mock tests, whose
// attempts live server-side (stores/test.js) and list on the Testlar tab of
// views/app/NatijalarPage.vue. So checkings are persisted
// client-side here, per device, mirroring how the centre already keeps its
// custom topics in localStorage. When the grading endpoint lands, the same
// entry shape carries the real AI payload instead of the sample, and this store
// can be swapped for (or backfilled from) the server with no UI change.
//
// Entry shape:
//   {
//     id,                 // string, unique
//     savedAt,            // ISO timestamp
//     topic,              // essay topic title
//     mode,               // 'upload' | 'write'
//     essayText,          // the student's typed essay ('' for photo uploads)
//     uploads,            // [{ id, name, dataUrl }] — photographed pages
//     uploadsDropped,     // true if images were stripped to fit the quota
//     analysis,           // the AI grading response (the shape EssayAnalysisSection expects)
//     analyzedText,       // the text the analysis quotes refer to
//     bandTotal,          // overall band (out of bandMax)
//     bandMax,            // band scale max (24)
//     sample,             // true while the analysis is the demo payload (AI not live yet)
//   }

const STORAGE_KEY = 'milliymock_essay_checkings_v1'

// Keep the newest N checkings. Photo essays store base64 image data URLs, which
// are heavy, so we cap the history to stay well under the ~5MB localStorage
// budget (older checkings drop off the end).
const MAX_ENTRIES = 30

const readRaw = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupt store — treat as empty rather than crash the page.
    return []
  }
}

// Persist `list`, trimming the oldest entries (and, as a last resort, the newest
// entry's images) until it fits the quota. Returns the list actually stored.
const writeWithQuotaGuard = (list) => {
  let candidate = list.slice(0, MAX_ENTRIES)

  while (candidate.length) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate))
      return candidate
    } catch {
      if (candidate.length > 1) {
        // Drop the oldest checking and retry.
        candidate = candidate.slice(0, -1)
        continue
      }
      // A single checking still won't fit — almost certainly its photos. Strip
      // them so at least the analysis + text survive.
      const [only] = candidate
      if (only && only.uploads && only.uploads.length) {
        candidate = [{ ...only, uploads: [], uploadsDropped: true }]
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate))
          return candidate
        } catch {
          // Storage unavailable entirely (private mode / disabled).
          return []
        }
      }
      return []
    }
  }

  // Empty list — clear the key.
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  } catch {
    // ignore
  }
  return []
}

let idCounter = 0
const makeId = () => `essay-${Date.now()}-${idCounter++}`

// Newest first.
export const loadEssayCheckings = () => readRaw()

export const getEssayChecking = (id) =>
  readRaw().find((entry) => String(entry.id) === String(id)) || null

// Save a new checking. Returns the stored entry (with id + savedAt), or null if
// storage was unavailable.
export const saveEssayChecking = (entry) => {
  const record = {
    id: makeId(),
    savedAt: new Date().toISOString(),
    uploadsDropped: false,
    ...entry,
  }
  const stored = writeWithQuotaGuard([record, ...readRaw()])
  return stored.find((item) => item.id === record.id) || null
}

export const removeEssayChecking = (id) => {
  const next = readRaw().filter((entry) => String(entry.id) !== String(id))
  writeWithQuotaGuard(next)
  return next
}
