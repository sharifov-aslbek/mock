import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'

// Practice (mashq) mode, backed by /api/practice/* (see milliy-platform
// docs/MASHQ_PRACTICE_SPEC.md). Questions arrive WITHOUT the correct answer;
// the verdict + explanation only come back from submitAnswer, so the client
// can never leak answers pre-submit. Quota: 10 free answers/day, 2 tanga
// buys +10 the same day.
//
// USE_MOCK serves a local question bank with the exact same DTO shapes while
// the backend endpoints are being built. Flip to false once /api/practice/*
// is deployed — no other code changes needed.
const USE_MOCK = true

// UI filter values → API enum ints (SubjectType / PracticeDifficulty).
const SUBJECT_TO_API = { Matematika: 1, Tarix: 3, Fizika: 4 }
const DIFFICULTY_TO_API = { oson: 1, orta: 2, qiyin: 3 }
const DIFFICULTY_FROM_API = { 1: 'oson', 2: 'orta', 3: 'qiyin' }
const SUBJECT_FROM_API = { 1: 'Matematika', 2: 'Biologiya', 3: 'Tarix', 4: 'Fizika' }

export class QuotaExhaustedError extends Error {
  constructor({ priceTanga = 2, grantsQuestions = 10 } = {}) {
    super('quota_exhausted')
    this.name = 'QuotaExhaustedError'
    this.priceTanga = priceTanga
    this.grantsQuestions = grantsQuestions
  }
}

// ---------------------------------------------------------------------------
// Mock backend (deleted when USE_MOCK flips) — same contract as the real API.
// ---------------------------------------------------------------------------

const MOCK_BANK = [
  {
    id: 1,
    subject: 'Matematika', grade: 9, difficulty: 'orta', topic: 'tenglamalar', timeLimitSeconds: 90,
    text: "$x^2 - 5x + 6 = 0$ tenglamaning ildizlari yig'indisini toping.",
    optionA: '$5$', optionB: '$6$', optionC: '$-5$', optionD: '$1$',
    correctLetter: 'A',
    explanationTitle: 'Viet teoremasi',
    explanation:
      "Viet teoremasiga ko'ra $x_1 + x_2 = -\\frac{b}{a} = 5$.\n\nJavob: A.",
  },
  {
    id: 2,
    subject: 'Matematika', grade: 9, difficulty: 'oson', topic: 'tenglamalar',
    text: '$3x - 7 = 8$ tenglamani yeching.',
    optionA: '$x = 3$', optionB: '$x = 5$', optionC: '$x = -5$', optionD: '$x = 7$',
    correctLetter: 'B',
    explanationTitle: 'Chiziqli tenglama',
    explanation: '$3x = 15 \\Rightarrow x = 5$.\n\nJavob: B.',
  },
  {
    id: 3,
    subject: 'Matematika', grade: 8, difficulty: 'orta', topic: 'planimetriya',
    text: "To'g'ri burchakli uchburchakning katetlari $6$ va $8$ ga teng. Gipotenuzani toping.",
    optionA: '$12$', optionB: '$14$', optionC: '$10$', optionD: '$9$',
    correctLetter: 'C',
    explanationTitle: 'Pifagor teoremasi',
    explanation: '$c = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$.\n\nJavob: C.',
  },
  {
    id: 4,
    subject: 'Matematika', grade: 11, difficulty: 'qiyin', topic: 'trigonometriya',
    text: '$\\sin^2 x + \\cos^2 x + \\tan^2 x = 4$ bo‘lsa, $\\tan^2 x$ ni toping.',
    optionA: '$4$', optionB: '$2$', optionC: '$1$', optionD: '$3$',
    correctLetter: 'D',
    explanationTitle: 'Asosiy ayniyat',
    explanation:
      "$\\sin^2 x + \\cos^2 x = 1$ ekanligidan $1 + \\tan^2 x = 4$, demak $\\tan^2 x = 3$.\n\nJavob: D.",
  },
  {
    id: 5,
    subject: 'Matematika', grade: 10, difficulty: 'orta', topic: 'funksiyalar',
    text: "$f(x) = 2x + 3$ va $g(x) = x^2$ bo'lsa, $g(f(1))$ ni hisoblang.",
    optionA: '$25$', optionB: '$5$', optionC: '$11$', optionD: '$16$',
    correctLetter: 'A',
    explanationTitle: 'Murakkab funksiya',
    explanation: '$f(1) = 5$, $g(5) = 25$.\n\nJavob: A.',
  },
  {
    id: 6,
    subject: 'Matematika', grade: 9, difficulty: 'qiyin', topic: 'ehtimollik',
    text: "Tanga uch marta tashlanganda kamida bir marta gerb tushish ehtimolini toping.",
    optionA: '$\\frac{3}{8}$', optionB: '$\\frac{7}{8}$', optionC: '$\\frac{1}{2}$', optionD: '$\\frac{5}{8}$',
    correctLetter: 'B',
    explanationTitle: "Qarama-qarshi hodisa",
    explanation:
      "Hech qachon gerb tushmaslik ehtimoli $\\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8}$.\n\nDemak $P = 1 - \\frac{1}{8} = \\frac{7}{8}$.\n\nJavob: B.",
  },
  {
    id: 7,
    subject: 'Tarix', grade: 7, difficulty: 'oson', topic: 'temuriylar-davri', timeLimitSeconds: 30,
    text: "Amir Temur qaysi yilda tug'ilgan?",
    optionA: '1336-yil', optionB: '1370-yil', optionC: '1405-yil', optionD: '1360-yil',
    correctLetter: 'A',
    explanationTitle: "Sohibqiron tavalludi",
    explanation:
      "Amir Temur 1336-yil 9-aprelda Kesh (hozirgi Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida tug'ilgan.\n\nJavob: A.",
  },
  {
    id: 8,
    subject: 'Tarix', grade: 8, difficulty: 'orta', topic: 'ilk-orta-asrlar',
    text: "Buyuk ipak yo'lining asosiy tarmog'i qaysi shaharlar orqali o'tgan?",
    optionA: 'Buxoro va Samarqand', optionB: 'Toshkent va Namangan',
    optionC: 'Xiva va Nukus', optionD: "Qo'qon va Andijon",
    correctLetter: 'A',
    explanationTitle: "Ipak yo'li",
    explanation:
      "Buyuk ipak yo'lining markaziy tarmog'i Movarounnahrning yirik savdo markazlari — Buxoro va Samarqand orqali o'tgan.\n\nJavob: A.",
  },
  {
    id: 9,
    subject: 'Fizika', grade: 9, difficulty: 'oson', topic: 'mexanika',
    text: "Jism $20\\,\\text{m/s}$ tezlik bilan $5\\,\\text{s}$ davomida tekis harakatlandi. Bosib o'tilgan yo'lni toping.",
    optionA: '$50\\,\\text{m}$', optionB: '$100\\,\\text{m}$', optionC: '$25\\,\\text{m}$', optionD: '$4\\,\\text{m}$',
    correctLetter: 'B',
    explanationTitle: 'Tekis harakat',
    explanation: '$s = v \\cdot t = 20 \\cdot 5 = 100\\,\\text{m}$.\n\nJavob: B.',
  },
  {
    id: 10,
    subject: 'Fizika', grade: 10, difficulty: 'orta', topic: 'elektr',
    text: "Zanjir bo'lagida kuchlanish $12\\,\\text{V}$, qarshilik $4\\,\\Omega$. Tok kuchini toping.",
    optionA: '$48\\,\\text{A}$', optionB: '$0{,}3\\,\\text{A}$', optionC: '$3\\,\\text{A}$', optionD: '$8\\,\\text{A}$',
    correctLetter: 'C',
    explanationTitle: 'Om qonuni',
    explanation: '$I = \\frac{U}{R} = \\frac{12}{4} = 3\\,\\text{A}$.\n\nJavob: C.',
  },
  {
    id: 11,
    subject: 'Matematika', grade: 6, difficulty: 'oson', topic: 'sonlar',
    text: "Sonlarning eng katta umumiy bo'luvchisini toping: $\\text{EKUB}(24; 36)$.",
    optionA: '$6$', optionB: '$18$', optionC: '$72$', optionD: '$12$',
    correctLetter: 'D',
    explanationTitle: 'EKUB',
    explanation: '$24 = 2^3 \\cdot 3$, $36 = 2^2 \\cdot 3^2$; umumiy: $2^2 \\cdot 3 = 12$.\n\nJavob: D.',
  },
  {
    id: 12,
    subject: 'Matematika', grade: 7, difficulty: 'orta', topic: 'planimetriya',
    text: "Uchburchak ichki burchaklarining yig'indisi necha gradus?",
    optionA: '$360°$', optionB: '$180°$', optionC: '$90°$', optionD: '$270°$',
    correctLetter: 'B',
    explanationTitle: 'Ichki burchaklar',
    explanation: "Har qanday uchburchak ichki burchaklarining yig'indisi $180°$ ga teng.\n\nJavob: B.",
  },
]

// In-memory mock session state (resets on reload — real backend persists).
const mockState = {
  attempts: new Map(), // questionId -> { letter, isCorrect }
  saved: new Set(),
  freeLimit: 10,
  used: 0,
  extra: 0,
}

const mockDelay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

function mockQuestionDto(q) {
  const attempt = mockState.attempts.get(q.id)
  return {
    id: q.id,
    subject: SUBJECT_TO_API[q.subject] ?? 1,
    grade: q.grade,
    difficulty: DIFFICULTY_TO_API[q.difficulty] ?? 2,
    topic: q.topic,
    text: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    timeLimitSeconds: q.timeLimitSeconds || 60,
    isSaved: mockState.saved.has(q.id),
    lastResult: attempt ? (attempt.isCorrect ? 'correct' : 'incorrect') : null,
  }
}

const mockApi = {
  async getQuestions(filters, count) {
    await mockDelay()
    let pool = MOCK_BANK.filter((q) => q.subject === filters.subject)
    if (filters.grade !== 'all') pool = pool.filter((q) => String(q.grade) === String(filters.grade))
    if (filters.difficulty !== 'all') pool = pool.filter((q) => q.difficulty === filters.difficulty)
    if (filters.topic !== 'all') pool = pool.filter((q) => q.topic === filters.topic)
    if (filters.status !== 'all') {
      pool = pool.filter((q) => {
        const attempt = mockState.attempts.get(q.id)
        if (filters.status === 'unanswered') return !attempt
        if (filters.status === 'correct') return attempt?.isCorrect === true
        if (filters.status === 'incorrect') return attempt?.isCorrect === false
        if (filters.status === 'saved') return mockState.saved.has(q.id)
        return true
      })
    }
    return pool.slice(0, count).map(mockQuestionDto)
  },

  async submitAnswer(questionId, letter) {
    await mockDelay()
    if (mockState.freeLimit + mockState.extra - mockState.used <= 0) {
      throw new QuotaExhaustedError()
    }
    const q = MOCK_BANK.find((item) => item.id === questionId)
    if (!q) throw new Error('Savol topilmadi.')
    const isCorrect = q.correctLetter === letter
    mockState.attempts.set(questionId, { letter, isCorrect })
    mockState.used += 1
    return {
      isCorrect,
      correctLetter: q.correctLetter,
      explanationTitle: q.explanationTitle,
      explanation: q.explanation,
      quotaRemaining: mockState.freeLimit + mockState.extra - mockState.used,
    }
  },

  async getQuota() {
    await mockDelay(100)
    return {
      freeLimit: mockState.freeLimit,
      used: mockState.used,
      extra: mockState.extra,
      remaining: mockState.freeLimit + mockState.extra - mockState.used,
    }
  },

  async purchaseQuota() {
    await mockDelay()
    mockState.extra += 10
    return this.getQuota()
  },

  async toggleSave(questionId) {
    await mockDelay(80)
    if (mockState.saved.has(questionId)) mockState.saved.delete(questionId)
    else mockState.saved.add(questionId)
    return { isSaved: mockState.saved.has(questionId) }
  },
}

// ---------------------------------------------------------------------------
// Real API (same shapes; active when USE_MOCK = false).
// ---------------------------------------------------------------------------

function authHeaders() {
  const authStore = useAuthStore()
  return { accept: '*/*', Authorization: `Bearer ${authStore.token}` }
}

async function parseEnvelope(response) {
  const payload = await response.json().catch(() => null)
  if (response.status === 402 || payload?.error === 'quota_exhausted') {
    throw new QuotaExhaustedError(payload || {})
  }
  if (!response.ok || (payload?.code && payload.code !== 200)) {
    throw new Error(payload?.message || 'So‘rov bajarilmadi.')
  }
  return payload?.data ?? payload
}

const realApi = {
  async getQuestions(filters, count) {
    const params = new URLSearchParams({ count: String(count) })
    params.set('subject', String(SUBJECT_TO_API[filters.subject] ?? 1))
    if (filters.grade !== 'all') params.set('grade', String(filters.grade))
    if (filters.difficulty !== 'all') params.set('difficulty', String(DIFFICULTY_TO_API[filters.difficulty]))
    if (filters.topic !== 'all') params.set('topic', filters.topic)
    if (filters.status !== 'all') params.set('status', filters.status)

    const response = await apiFetch(`${getTestApiBaseUrl()}/practice/questions?${params}`, {
      headers: authHeaders(),
    })
    return parseEnvelope(response)
  },

  async submitAnswer(questionId, letter) {
    const response = await apiFetch(`${getTestApiBaseUrl()}/practice/answer`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, letter }),
    })
    return parseEnvelope(response)
  },

  async getQuota() {
    const response = await apiFetch(`${getTestApiBaseUrl()}/practice/quota`, {
      headers: authHeaders(),
    })
    return parseEnvelope(response)
  },

  async purchaseQuota() {
    const response = await apiFetch(`${getTestApiBaseUrl()}/practice/quota/purchase`, {
      method: 'POST',
      headers: authHeaders(),
    })
    return parseEnvelope(response)
  },

  async toggleSave(questionId) {
    const response = await apiFetch(`${getTestApiBaseUrl()}/practice/save`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId }),
    })
    return parseEnvelope(response)
  },
}

const api = USE_MOCK ? mockApi : realApi

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePracticeStore = defineStore('practice', () => {
  const questions = ref([]) // DTOs from getQuestions (no answers inside)
  const isLoading = ref(false)
  const loadError = ref(null)
  const quota = ref({ freeLimit: 10, used: 0, extra: 0, remaining: 10 })

  const hasQuestions = computed(() => questions.value.length > 0)

  async function loadQuestions(filters, count = 12) {
    isLoading.value = true
    loadError.value = null
    try {
      questions.value = await api.getQuestions(filters, count)
      return questions.value
    } catch (error) {
      loadError.value = error?.message || 'Savollarni yuklab bo‘lmadi.'
      questions.value = []
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Returns { isCorrect, correctLetter, explanationTitle, explanation, quotaRemaining }.
  // Throws QuotaExhaustedError when the daily limit is spent.
  async function submitAnswer(questionId, letter) {
    const verdict = await api.submitAnswer(questionId, letter)
    if (typeof verdict?.quotaRemaining === 'number') {
      quota.value = { ...quota.value, remaining: verdict.quotaRemaining, used: quota.value.used + 1 }
    }
    return verdict
  }

  async function refreshQuota() {
    quota.value = await api.getQuota()
    return quota.value
  }

  async function purchaseQuota() {
    quota.value = await api.purchaseQuota()
    return quota.value
  }

  async function toggleSave(questionId) {
    const result = await api.toggleSave(questionId)
    const target = questions.value.find((q) => q.id === questionId)
    if (target) target.isSaved = result.isSaved
    return result
  }

  return {
    questions,
    isLoading,
    loadError,
    quota,
    hasQuestions,
    loadQuestions,
    submitAnswer,
    refreshQuota,
    purchaseQuota,
    toggleSave,
  }
})
