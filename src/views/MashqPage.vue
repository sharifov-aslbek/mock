<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { usePracticeStore, QuotaExhaustedError } from '@/stores/practice'

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderMath = (source) => {
  if (!source) {
    return ''
  }

  const parts = []
  let cursor = 0
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g
  let match

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > cursor) {
      parts.push(escapeHtml(source.slice(cursor, match.index)))
    }

    const expression = match[1] ?? match[2] ?? ''
    const displayMode = match[1] !== undefined

    try {
      parts.push(
        katex.renderToString(expression, {
          throwOnError: false,
          strict: 'ignore',
          displayMode,
        }),
      )
    } catch {
      parts.push(escapeHtml(match[0]))
    }

    cursor = match.index + match[0].length
  }

  if (cursor < source.length) {
    parts.push(escapeHtml(source.slice(cursor)))
  }

  return parts.join('')
}

const SUBJECT_OPTIONS = [
  { value: 'Matematika', label: 'Matematika' },
  { value: 'Tarix', label: 'Tarix' },
  { value: 'Fizika', label: 'Fizika' },
]

const GRADE_OPTIONS = [
  { value: 'all', label: 'Barcha sinflar' },
  { value: '5', label: '5-sinf' },
  { value: '6', label: '6-sinf' },
  { value: '7', label: '7-sinf' },
  { value: '8', label: '8-sinf' },
  { value: '9', label: '9-sinf' },
  { value: '10', label: '10-sinf' },
  { value: '11', label: '11-sinf' },
]

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Barcha darajalar' },
  { value: 'oson', label: 'Oson' },
  { value: 'orta', label: "O'rta" },
  { value: 'qiyin', label: 'Qiyin' },
]

// Topics are subject-specific. Hardcoded until GET /api/practice/topics ships,
// then this map is replaced by the endpoint response.
const TOPICS_BY_SUBJECT = {
  Matematika: [
    { value: 'algebra', label: 'Algebra' },
    { value: 'geometriya', label: 'Geometriya' },
    { value: 'trigonometriya', label: 'Trigonometriya' },
    { value: 'funksiyalar', label: 'Funksiyalar' },
    { value: 'ehtimollik', label: 'Ehtimollik' },
  ],
  Tarix: [
    { value: 'tarix-uzb', label: "O'zbekiston tarixi" },
    { value: 'jahon-tarixi', label: 'Jahon tarixi' },
  ],
  Fizika: [
    { value: 'mexanika', label: 'Mexanika' },
    { value: 'elektr', label: 'Elektr' },
    { value: 'optika', label: 'Optika' },
    { value: 'issiqlik', label: 'Issiqlik hodisalari' },
  ],
}

// Flat slug → label lookup for the question meta tag, regardless of subject.
const TOPIC_LABELS = Object.fromEntries(
  Object.values(TOPICS_BY_SUBJECT)
    .flat()
    .map((topic) => [topic.value, topic.label]),
)

const STATUS_OPTIONS = [
  { value: 'all', label: 'Hamma savollar' },
  { value: 'unanswered', label: 'Javob berilmagan' },
  { value: 'correct', label: "To'g'ri javob berilgan" },
  { value: 'incorrect', label: "Noto'g'ri javob berilgan" },
  { value: 'saved', label: 'Saqlangan' },
]

const filters = reactive({
  subject: { open: false, value: 'Matematika' },
  grade: { open: false, value: 'all' },
  difficulty: { open: false, value: 'all' },
  topic: { open: false, value: 'all' },
  status: { open: false, value: 'all' },
})

const resolveLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || ''

const subjectLabel = computed(() => resolveLabel(SUBJECT_OPTIONS, filters.subject.value))
const gradeBadge = computed(() =>
  filters.grade.value === 'all' ? 'Hamma' : resolveLabel(GRADE_OPTIONS, filters.grade.value),
)
const difficultyBadge = computed(() =>
  filters.difficulty.value === 'all' ? 'Hamma' : resolveLabel(DIFFICULTY_OPTIONS, filters.difficulty.value),
)
// Dropdown entries for the currently selected subject.
const topicOptions = computed(() => [
  { value: 'all', label: 'Barcha mavzular' },
  ...(TOPICS_BY_SUBJECT[filters.subject.value] || []),
])

const topicBadge = computed(() =>
  filters.topic.value === 'all' ? 'Hamma' : resolveLabel(topicOptions.value, filters.topic.value),
)
const statusBadge = computed(() =>
  filters.status.value === 'all' ? 'Hamma' : resolveLabel(STATUS_OPTIONS, filters.status.value),
)

const closeAllDropdowns = () => {
  filters.subject.open = false
  filters.grade.open = false
  filters.difficulty.open = false
  filters.topic.open = false
  filters.status.open = false
}

const toggleFilter = (key) => {
  const wasOpen = filters[key].open
  closeAllDropdowns()
  filters[key].open = !wasOpen
}

// Subject has no "all" default — it is always constraining, so always active.
const DEFAULT_FILTERS = {
  subject: null,
  grade: 'all',
  difficulty: 'all',
  topic: 'all',
  status: 'all',
}

const isFilterActive = (key) =>
  filters[key].open || filters[key].value !== DEFAULT_FILTERS[key]

const selectFilter = (key, value) => {
  filters[key].value = value
  filters[key].open = false

  // Topics are subject-specific — a subject switch invalidates the old pick.
  // Same-tick reset keeps the filter watcher to a single reload.
  if (key === 'subject') {
    filters.topic.value = 'all'
  }
}

const resetFilters = () => {
  filters.subject.value = 'Matematika'
  filters.grade.value = 'all'
  filters.difficulty.value = 'all'
  filters.topic.value = 'all'
  filters.status.value = 'all'
  closeAllDropdowns()
}

const onOutsideClick = () => {
  closeAllDropdowns()
}

const practiceStore = usePracticeStore()
const { questions, isLoading, loadError, quota } = storeToRefs(practiceStore)

const currentQuestionIndex = ref(1)
const totalQuestions = computed(() => questions.value.length)

// Per-question session state, keyed by question ID.
// answers[id]  = { letter, correct, explanationRead, pending }
// verdicts[id] = { correctLetter, explanationTitle, explanationParagraphs } — only
// exists after the server has judged the answer; the client never knows the
// correct letter beforehand.
const answers = reactive({})
const verdicts = reactive({})
const isSubmitting = ref(false)
const submitError = ref(null)
const showLimitModal = ref(false)
const limitInfo = ref({ priceTanga: 2, grantsQuestions: 10 })
const isPurchasing = ref(false)
const purchaseError = ref(null)

const SUBJECT_LABELS = { 1: 'Matematika', 2: 'Biologiya', 3: 'Tarix', 4: 'Fizika' }
const DIFFICULTY_META = {
  1: { value: 'oson', label: 'Oson' },
  2: { value: 'orta', label: "O'rta" },
  3: { value: 'qiyin', label: 'Qiyin' },
}

const currentDto = computed(() => questions.value[currentQuestionIndex.value - 1] || null)

// Template-facing shape assembled from the answer-free DTO.
const question = computed(() => {
  const dto = currentDto.value
  if (!dto) return null
  return {
    id: dto.id,
    subject: SUBJECT_LABELS[dto.subject] || '',
    grade: dto.grade ? `${dto.grade}-sinf` : 'Umumiy',
    difficulty: DIFFICULTY_META[dto.difficulty] || DIFFICULTY_META[2],
    topic: TOPIC_LABELS[dto.topic] || dto.topic,
    text: dto.text,
    options: [
      { letter: 'A', text: dto.optionA },
      { letter: 'B', text: dto.optionB },
      { letter: 'C', text: dto.optionC },
      { letter: 'D', text: dto.optionD },
    ],
  }
})

const currentVerdict = computed(() =>
  question.value ? verdicts[question.value.id] || null : null,
)

const questionHtml = computed(() => (question.value ? renderMath(question.value.text) : ''))
const explanationHtml = computed(() =>
  (currentVerdict.value?.explanationParagraphs || []).map(renderMath),
)

const renderedOptions = computed(() => {
  if (!question.value) return []
  const verdict = currentVerdict.value
  return question.value.options.map((option) => ({
    ...option,
    html: renderMath(option.text),
    isRevealedCorrect: verdict ? option.letter === verdict.correctLetter : false,
  }))
})

const explanationOpen = ref(false)
const showNudge = ref(false)
const showSummary = ref(false)
const accuracyFillWidth = ref('0%')

const currentAnswer = computed(() =>
  question.value ? answers[question.value.id] || null : null,
)
// "answered" means the server verdict is in — a pending submit locks the
// options (see lockOptions) but doesn't show feedback yet.
const answered = computed(() => !!currentAnswer.value && !currentAnswer.value.pending)
const lockOptions = computed(() => currentAnswer.value !== null)
const selectedLetter = computed(() => currentAnswer.value?.letter ?? null)
const wasCorrect = computed(() => currentAnswer.value?.correct ?? false)
const explanationRead = computed(() => currentAnswer.value?.explanationRead ?? false)
const saved = computed(() => currentDto.value?.isSaved === true)

const correctCount = computed(
  () => Object.values(answers).filter((entry) => entry.correct).length,
)
const incorrectCount = computed(
  () => Object.values(answers).filter((entry) => !entry.correct).length,
)

const optionStateClass = (option) => {
  const entry = currentAnswer.value
  if (!entry) {
    return ''
  }

  // Waiting for the server — show the pick as selected, no verdict colors yet.
  if (entry.pending) {
    return option.letter === entry.letter ? 'selected' : ''
  }

  if (option.isRevealedCorrect) {
    return 'correct'
  }

  if (option.letter === entry.letter && !entry.correct) {
    return 'incorrect'
  }

  return ''
}

const accuracyPercent = computed(() => {
  const total = correctCount.value + incorrectCount.value
  if (!total) {
    return 0
  }

  return Math.round((correctCount.value / total) * 100)
})

const progressPercent = computed(() =>
  totalQuestions.value
    ? Math.round((currentQuestionIndex.value / totalQuestions.value) * 100)
    : 0,
)

const qstripPills = computed(() =>
  questions.value.map((dto, index) => {
    const number = index + 1
    const isCurrent = number === currentQuestionIndex.value
    const entry = answers[dto.id]
    const state = entry && !entry.pending ? (entry.correct ? 'correct' : 'incorrect') : ''
    return {
      number,
      classes: [state, isCurrent ? 'current' : ''].filter(Boolean).join(' '),
    }
  }),
)

const qSeconds = ref(14)
const sessionSeconds = ref(167)
let qInterval = null
let sessionInterval = null

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const qTimer = computed(() => formatTime(qSeconds.value))
const sessionTimer = computed(() => formatTime(sessionSeconds.value))
const summaryTime = computed(() => formatTime(sessionSeconds.value))
const averageSeconds = computed(() => {
  const total = correctCount.value + incorrectCount.value
  if (!total) {
    return '0s'
  }

  return `${Math.round(sessionSeconds.value / total)}s`
})

const startTimers = () => {
  qInterval = setInterval(() => {
    if (!answered.value) {
      qSeconds.value += 1
    }
  }, 1000)

  sessionInterval = setInterval(() => {
    sessionSeconds.value += 1
  }, 1000)
}

const stopTimers = () => {
  if (qInterval) {
    clearInterval(qInterval)
    qInterval = null
  }

  if (sessionInterval) {
    clearInterval(sessionInterval)
    sessionInterval = null
  }
}

const selectOption = async (option) => {
  if (!question.value || lockOptions.value || isSubmitting.value) {
    return
  }

  const q = question.value
  isSubmitting.value = true
  submitError.value = null
  answers[q.id] = { letter: option.letter, correct: false, explanationRead: false, pending: true }

  try {
    const verdict = await practiceStore.submitAnswer(q.id, option.letter)
    verdicts[q.id] = {
      correctLetter: verdict.correctLetter,
      explanationTitle: verdict.explanationTitle || '',
      explanationParagraphs: (verdict.explanation || '').split('\n\n').filter(Boolean),
    }
    answers[q.id] = {
      letter: option.letter,
      correct: verdict.isCorrect === true,
      explanationRead: false,
    }
  } catch (error) {
    // Roll back the pick — the answer was not consumed.
    delete answers[q.id]

    if (error instanceof QuotaExhaustedError) {
      limitInfo.value = { priceTanga: error.priceTanga, grantsQuestions: error.grantsQuestions }
      purchaseError.value = null
      showLimitModal.value = true
    } else {
      submitError.value = error?.message || "Javobni yuborib bo'lmadi. Qayta urinib ko'ring."
    }
  } finally {
    isSubmitting.value = false
  }
}

const selectOptionByIndex = (index) => {
  const option = question.value?.options[index]

  if (option) {
    selectOption(option)
  }
}

const toggleExplanation = () => {
  if (!answered.value) {
    return
  }

  explanationOpen.value = !explanationOpen.value

  if (explanationOpen.value) {
    if (currentAnswer.value) {
      currentAnswer.value.explanationRead = true
    }
    showNudge.value = false
  }
}

const toggleSaved = () => {
  if (!question.value) {
    return
  }

  practiceStore.toggleSave(question.value.id).catch(() => {
    // Save toggle is non-critical; DTO state stays as the server last confirmed.
  })
}

const goPrev = () => {
  if (currentQuestionIndex.value <= 1) {
    return
  }

  currentQuestionIndex.value -= 1
}

const goNext = () => {
  if (answered.value && !wasCorrect.value && !explanationRead.value) {
    showNudge.value = true
    return
  }

  if (currentQuestionIndex.value >= totalQuestions.value) {
    finishSession()
    return
  }

  currentQuestionIndex.value += 1
}

const skipNudge = () => {
  showNudge.value = false
  if (currentAnswer.value) {
    currentAnswer.value.explanationRead = true
  }
}

const readExplanationFromNudge = () => {
  showNudge.value = false

  if (!explanationOpen.value) {
    toggleExplanation()
  }
}

const finishSession = () => {
  showSummary.value = true
  nextTick(() => {
    accuracyFillWidth.value = `${accuracyPercent.value}%`
  })
}

const closeSummary = () => {
  showSummary.value = false
  accuracyFillWidth.value = '0%'
}

const resetSessionState = () => {
  for (const key of Object.keys(answers)) {
    delete answers[key]
  }
  for (const key of Object.keys(verdicts)) {
    delete verdicts[key]
  }
  currentQuestionIndex.value = 1
  qSeconds.value = 0
  sessionSeconds.value = 0
  explanationOpen.value = false
  showNudge.value = false
  submitError.value = null
}

const activeFilters = () => ({
  subject: filters.subject.value,
  grade: filters.grade.value,
  difficulty: filters.difficulty.value,
  topic: filters.topic.value,
  status: filters.status.value,
})

const loadSession = async () => {
  resetSessionState()
  try {
    await practiceStore.loadQuestions(activeFilters())
  } catch {
    // loadError is surfaced by the store; the template shows the error state.
  }
}

// Any filter change starts a fresh batch.
watch(
  () => [
    filters.subject.value,
    filters.grade.value,
    filters.difficulty.value,
    filters.topic.value,
    filters.status.value,
  ],
  () => {
    loadSession()
  },
)

const startNewSession = () => {
  closeSummary()
  loadSession()
}

const purchaseMore = async () => {
  isPurchasing.value = true
  purchaseError.value = null
  try {
    await practiceStore.purchaseQuota()
    showLimitModal.value = false
  } catch (error) {
    purchaseError.value =
      error?.message || "To'lov amalga oshmadi. Balansingizni tekshirib ko'ring."
  } finally {
    isPurchasing.value = false
  }
}

const closeLimitModal = () => {
  showLimitModal.value = false
}

const onKeyDown = (event) => {
  const target = event.target
  if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    return
  }

  if (showSummary.value || showLimitModal.value || !question.value) {
    return
  }

  const key = event.key.toLowerCase()

  if (['1', '2', '3', '4'].includes(key)) {
    event.preventDefault()
    selectOptionByIndex(Number(key) - 1)
    return
  }

  if (['a', 'b', 'c', 'd'].includes(key)) {
    event.preventDefault()
    selectOptionByIndex(key.charCodeAt(0) - 'a'.charCodeAt(0))
    return
  }

  if (event.key === 'ArrowRight' || event.key === 'Enter') {
    event.preventDefault()
    goNext()
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goPrev()
    return
  }

  if (key === 'e') {
    event.preventDefault()
    toggleExplanation()
    return
  }

  if (key === 's') {
    event.preventDefault()
    toggleSaved()
  }
}

watch(currentQuestionIndex, () => {
  // answered / selectedLetter / wasCorrect are derived from `answers`,
  // so revisiting a question restores its state automatically.
  explanationOpen.value = false
  showNudge.value = false
  submitError.value = null
  qSeconds.value = 0
})

onMounted(() => {
  startTimers()
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('click', onOutsideClick)
  practiceStore.refreshQuota().catch(() => {
    // Non-fatal: the chip just keeps its defaults until the next answer syncs it.
  })
  loadSession()
})

onBeforeUnmount(() => {
  stopTimers()
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('click', onOutsideClick)
})
</script>

<template>
  <main class="mashq-page">
    <div class="page">
      <div class="crumb">Mashq markazi</div>
      <h1>Savollar bo'yicha mashq qiling</h1>
      <p class="subtitle">
        Filtrlardan foydalanib o'zingizga mos savollarni tanlang, javob bering va xatolaringizni
        darhol tahlil qiling.
      </p>

      <!-- Filter bar -->
      <div class="filter-bar" @click.stop>
        <div class="filter">
          <button
            type="button"
            class="filter-btn"
            :class="{ active: isFilterActive('subject') }"
            @click="toggleFilter('subject')"
          >
            <span class="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </span>
            <span class="label">{{ subjectLabel }}</span>
            <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="dropdown" :class="{ open: filters.subject.open }">
            <div
              v-for="option in SUBJECT_OPTIONS"
              :key="option.value"
              class="dropdown-item"
              :class="{ selected: filters.subject.value === option.value }"
              @click="selectFilter('subject', option.value)"
            >
              {{ option.label }}
              <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

        <div class="filter-divider" />

        <div class="filter">
          <button
            type="button"
            class="filter-btn"
            :class="{ active: isFilterActive('grade') }"
            @click="toggleFilter('grade')"
          >
            <span class="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            <span class="label">Sinf</span>
            <span class="badge">{{ gradeBadge }}</span>
            <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="dropdown" :class="{ open: filters.grade.open }">
            <div
              v-for="option in GRADE_OPTIONS"
              :key="option.value"
              class="dropdown-item"
              :class="{ selected: filters.grade.value === option.value }"
              @click="selectFilter('grade', option.value)"
            >
              {{ option.label }}
              <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

        <div class="filter">
          <button
            type="button"
            class="filter-btn"
            :class="{ active: isFilterActive('difficulty') }"
            @click="toggleFilter('difficulty')"
          >
            <span class="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="20" x2="3" y2="10" />
                <line x1="9" y1="20" x2="9" y2="4" />
                <line x1="15" y1="20" x2="15" y2="14" />
                <line x1="21" y1="20" x2="21" y2="8" />
              </svg>
            </span>
            <span class="label">Qiyinlik</span>
            <span class="badge">{{ difficultyBadge }}</span>
            <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="dropdown" :class="{ open: filters.difficulty.open }">
            <div
              v-for="option in DIFFICULTY_OPTIONS"
              :key="option.value"
              class="dropdown-item"
              :class="{ selected: filters.difficulty.value === option.value }"
              @click="selectFilter('difficulty', option.value)"
            >
              {{ option.label }}
              <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

        <div class="filter">
          <button
            type="button"
            class="filter-btn"
            :class="{ active: isFilterActive('topic') }"
            @click="toggleFilter('topic')"
          >
            <span class="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </span>
            <span class="label">Mavzu</span>
            <span class="badge">{{ topicBadge }}</span>
            <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="dropdown" :class="{ open: filters.topic.open }">
            <div
              v-for="option in topicOptions"
              :key="option.value"
              class="dropdown-item"
              :class="{ selected: filters.topic.value === option.value }"
              @click="selectFilter('topic', option.value)"
            >
              {{ option.label }}
              <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

        <div class="filter">
          <button
            type="button"
            class="filter-btn"
            :class="{ active: isFilterActive('status') }"
            @click="toggleFilter('status')"
          >
            <span class="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
            <span class="label">Holat</span>
            <span class="badge">{{ statusBadge }}</span>
            <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div class="dropdown" :class="{ open: filters.status.open }">
            <div
              v-for="option in STATUS_OPTIONS"
              :key="option.value"
              class="dropdown-item"
              :class="{ selected: filters.status.value === option.value }"
              @click="selectFilter('status', option.value)"
            >
              {{ option.label }}
              <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>

        <button type="button" class="reset-btn" @click="resetFilters">Tozalash</button>
      </div>

      <!-- Loading / error / empty states -->
      <div v-if="isLoading" class="state-block">
        <div class="state-spinner" />
        <p>Savollar yuklanmoqda…</p>
      </div>

      <div v-else-if="loadError" class="state-block">
        <p class="state-title">Xatolik yuz berdi</p>
        <p>{{ loadError }}</p>
        <button type="button" class="btn btn-primary" @click="loadSession">Qayta urinish</button>
      </div>

      <div v-else-if="!question" class="state-block">
        <p class="state-title">Savol topilmadi</p>
        <p>Tanlangan filtrlarga mos savollar yo'q. Filtrlarni o'zgartirib ko'ring.</p>
        <button type="button" class="btn btn-outline" @click="resetFilters">Filtrlarni tozalash</button>
      </div>

      <template v-else>
      <!-- Progress + timers -->
      <div class="progress-row">
        <div class="progress-meta">
          <div class="qid">
            <span class="qid-dot" />
            Savol ID #{{ question.id }}
          </div>
          <span style="color: var(--ink-mute)">•</span>
          <span>
            <strong style="color: var(--ink)">{{ currentQuestionIndex }}</strong>
            / {{ totalQuestions }}
          </span>
        </div>
        <div class="timers">
          <div class="timer quota-chip" :class="{ low: quota.remaining <= 2 }">
            <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span class="lbl">Bugun</span>
            <span class="val">{{ quota.remaining }}</span>
          </div>
          <div class="timer">
            <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span class="lbl">Savol</span>
            <span class="val">{{ qTimer }}</span>
          </div>
          <div class="timer">
            <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            <span class="lbl">Jami</span>
            <span class="val">{{ sessionTimer }}</span>
          </div>
        </div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
      </div>

      <!-- Numbered question strip -->
      <div class="qstrip-wrap">
        <span class="qstrip-label">Savollar</span>
        <div class="qstrip">
          <div
            v-for="pill in qstripPills"
            :key="pill.number"
            class="qpill"
            :class="pill.classes"
            @click="currentQuestionIndex = pill.number"
          >
            {{ pill.number }}
          </div>
        </div>
      </div>

      <!-- Question card -->
      <div class="question-wrap">
        <div class="q-head">
          <div class="q-num">
            <div class="q-num-circle">{{ currentQuestionIndex }}</div>
            <div class="q-meta">
              <div class="q-meta-tags">
                <span class="tag tag-subject">{{ question.subject }}</span>
                <span class="tag tag-grade">{{ question.grade }}</span>
                <span class="tag" :class="`tag-diff-${question.difficulty.value}`">
                  <span class="dot" />{{ question.difficulty.label }}
                </span>
              </div>
              <span class="q-meta-value">{{ question.topic }}</span>
            </div>
          </div>
          <div class="q-actions">
            <button
              type="button"
              class="icon-btn"
              :class="{ saved }"
              title="Saqlash (S)"
              @click="toggleSaved"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button type="button" class="icon-btn" title="Xato haqida xabar berish">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        <div class="q-text" v-html="questionHtml" />

        <div class="options" :class="{ locked: lockOptions }">
          <div
            v-for="(option, index) in renderedOptions"
            :key="option.letter"
            class="option"
            :class="optionStateClass(option)"
            @click="selectOption(option)"
          >
            <div class="option-letter">{{ option.letter }}</div>
            <div class="option-text" v-html="option.html" />
            <span class="option-shortcut">{{ index + 1 }}</span>
            <svg
              class="option-mark"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <polyline v-if="option.isRevealedCorrect" points="20 6 9 17 4 12" />
              <template v-else>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </template>
            </svg>
          </div>
        </div>

        <div v-if="submitError" class="nudge show">
          <svg class="nudge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>{{ submitError }}</div>
        </div>

        <div
          v-if="answered"
          class="feedback show"
          :class="wasCorrect ? 'correct' : 'incorrect'"
        >
          <div class="feedback-icon">
            <svg
              v-if="wasCorrect"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg
              v-else
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <div class="feedback-title">
              {{ wasCorrect ? "To'g'ri javob!" : "Javob noto'g'ri" }}
            </div>
            <div class="feedback-text">
              {{
                wasCorrect
                  ? "Ajoyib, javobingiz to'g'ri. Keyingi savolga o'tishingiz mumkin."
                  : "Izohni ko'rish orqali yechimni o'rganishingiz mumkin."
              }}
            </div>
          </div>
        </div>

        <div v-if="showNudge" class="nudge show">
          <svg class="nudge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Izohni o'qimadingiz.</strong>
            Xatoni tushunish uchun yechimni ko'rib chiqishni tavsiya qilamiz.
          </div>
          <div class="nudge-actions">
            <button type="button" class="nudge-btn" @click="skipNudge">O'tkazib yuborish</button>
            <button type="button" class="nudge-btn primary" @click="readExplanationFromNudge">
              Izohni o'qish
            </button>
          </div>
        </div>

        <div v-if="explanationOpen" class="explanation show">
          <div class="exp-head">
            <span class="exp-label">Yechim va izoh</span>
            <div class="exp-divider" />
          </div>
          <div class="exp-title">{{ currentVerdict?.explanationTitle }}</div>
          <div class="exp-correct-answer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            To'g'ri javob: {{ currentVerdict?.correctLetter }}
          </div>
          <div class="exp-body">
            <p v-for="(paragraph, index) in explanationHtml" :key="index" v-html="paragraph" />
          </div>
        </div>

        <div class="action-bar">
          <div class="action-left">
            <button type="button" class="btn btn-outline" @click="goPrev" :disabled="currentQuestionIndex <= 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Oldingi
            </button>
            <button type="button" class="btn btn-danger" @click="finishSession">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Mashqni tugatish
            </button>
          </div>
          <div class="action-right">
            <span class="kbd-hint">
              <span class="kbd-key">1–4</span> tanlash ·
              <span class="kbd-key">→</span> keyingi ·
              <span class="kbd-key">E</span> izoh
            </span>
            <button
              type="button"
              class="btn btn-ghost"
              :disabled="!answered"
              @click="toggleExplanation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {{ explanationOpen ? "Izohni yashirish" : "Izohni ko'rish" }}
              <span class="kbd">E</span>
            </button>
            <button type="button" class="btn btn-primary" @click="goNext">
              {{ answered ? 'Keyingi savol' : "O'tkazib yuborish" }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span class="kbd">→</span>
            </button>
          </div>
        </div>
      </div>
      </template>
    </div>

    <!-- Session summary -->
    <Teleport to="body">
      <div
        v-if="showSummary"
        class="modal-backdrop show"
        @click.self="closeSummary"
      >
        <div class="modal">
          <div class="modal-header">
            <div class="modal-trophy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <h2 class="modal-title">Mashq tugadi!</h2>
            <p class="modal-sub">Quyida natijangiz va statistikangiz keltirilgan.</p>
          </div>

          <div class="accuracy-row">
            <div class="accuracy-row-top">
              <span class="lbl">Aniqlik</span>
              <span class="val">{{ accuracyPercent }}%</span>
            </div>
            <div class="accuracy-bar">
              <div class="accuracy-bar-fill" :style="{ width: accuracyFillWidth }" />
            </div>
          </div>

          <div class="score-grid">
            <div class="score-card">
              <div class="score-label">To'g'ri</div>
              <div class="score-value green">{{ correctCount }}</div>
            </div>
            <div class="score-card">
              <div class="score-label">Noto'g'ri</div>
              <div class="score-value red">{{ incorrectCount }}</div>
            </div>
            <div class="score-card">
              <div class="score-label">Jami vaqt</div>
              <div class="score-value">{{ summaryTime }}</div>
            </div>
            <div class="score-card">
              <div class="score-label">O'rtacha vaqt</div>
              <div class="score-value">{{ averageSeconds }}</div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" style="flex: 1; justify-content: center" @click="closeSummary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Ko'rib chiqish
            </button>
            <button type="button" class="btn btn-primary" style="flex: 1; justify-content: center" @click="startNewSession">
              Yangi mashq
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Daily limit reached -->
    <Teleport to="body">
      <div
        v-if="showLimitModal"
        class="modal-backdrop show"
        @click.self="closeLimitModal"
      >
        <div class="modal">
          <div class="modal-header">
            <div class="limit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h2 class="modal-title">Bugungi bepul savollar tugadi</h2>
            <p class="modal-sub">
              Har kuni {{ quota.freeLimit }} ta savol bepul. Davom etish uchun
              {{ limitInfo.priceTanga }} tanga evaziga yana {{ limitInfo.grantsQuestions }} ta
              savol oching — yoki ertaga bepul davom eting.
            </p>
          </div>

          <div v-if="purchaseError" class="limit-error">{{ purchaseError }}</div>

          <div class="modal-actions">
            <button
              type="button"
              class="btn btn-outline"
              style="flex: 1; justify-content: center"
              @click="closeLimitModal"
            >
              Ertaga qaytaman
            </button>
            <button
              type="button"
              class="btn btn-primary"
              style="flex: 1; justify-content: center"
              :disabled="isPurchasing"
              @click="purchaseMore"
            >
              {{ isPurchasing
                ? 'Ochilmoqda…'
                : `${limitInfo.priceTanga} tanga — +${limitInfo.grantsQuestions} savol` }}
            </button>
          </div>

          <p class="limit-topup">
            Balans yetarli emasmi?
            <RouterLink to="/pricing">Hisobni to'ldirish</RouterLink>
          </p>
        </div>
      </div>
    </Teleport>

    <button type="button" class="help-fab">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
      Yordam
    </button>
  </main>
</template>

<style scoped>
.mashq-page {
  --bg: #f5f3ef;
  --surface: #ffffff;
  --ink: #1a1814;
  --ink-soft: #6b6760;
  --ink-mute: #a39e94;
  --line: #e0ddd7;
  --line-soft: #f0ece4;
  --green: #16a34a;
  --green-soft: #dcfce7;
  --green-ring: #86efac;
  --red: #dc2626;
  --red-soft: #fee2e2;
  --red-ring: #fca5a5;
  --yellow: #f59e0b;
  --yellow-soft: #fef3c7;
  --blue: #1a1814;
  --blue-soft: #ece8e0;
  --radius: 16px;
  --radius-sm: 10px;
  --shadow-sm: 0 1px 2px rgba(26, 24, 20, 0.04);
  --shadow-md: 0 4px 20px rgba(26, 24, 20, 0.06);
  --shadow-lg: 0 12px 40px rgba(26, 24, 20, 0.08);

  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}

.page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 48px 80px;
}

.crumb {
  color: var(--ink-mute);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 10px;
}

h1 {
  font-size: 44px;
  letter-spacing: -0.025em;
  font-weight: 700;
  margin-bottom: 12px;
}

.subtitle {
  color: var(--ink-soft);
  font-size: 17px;
  max-width: 640px;
  margin-bottom: 32px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  background: var(--surface);
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  margin-bottom: 28px;
  position: relative;
}

.filter {
  position: relative;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px 9px 12px;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 999px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.filter-btn:hover {
  background: var(--line);
}

.filter-btn.active {
  background: var(--ink);
  color: #fff;
}

.filter-btn .ic {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  color: var(--ink-soft);
}

.filter-btn.active .ic {
  color: #fff;
}

.filter-btn .chev {
  width: 12px;
  height: 12px;
  color: var(--ink-mute);
}

.filter-btn.active .chev {
  color: rgba(255, 255, 255, 0.6);
}

.filter-btn .badge {
  background: rgba(0, 0, 0, 0.06);
  color: var(--ink);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.filter-btn.active .badge {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 20;
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 0.15s, transform 0.15s;
}

.dropdown.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 7px;
  font-size: 14px;
  cursor: pointer;
  color: var(--ink);
  transition: background 0.12s;
}

.dropdown-item:hover {
  background: var(--line-soft);
}

.dropdown-item.selected {
  background: var(--line-soft);
  font-weight: 600;
}

.dropdown-item .check {
  width: 14px;
  height: 14px;
  color: var(--ink);
  opacity: 0;
}

.dropdown-item.selected .check {
  opacity: 1;
}

.filter-divider {
  width: 1px;
  height: 24px;
  background: var(--line);
  margin: 0 4px;
}

.reset-btn {
  margin-left: auto;
  padding: 9px 14px;
  background: transparent;
  border: none;
  color: var(--ink-soft);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 999px;
  transition: all 0.15s;
}

.reset-btn:hover {
  background: var(--line-soft);
  color: var(--ink);
}

.progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.progress-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: var(--ink-soft);
  flex-wrap: wrap;
}

.qid {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--ink);
  color: #fff;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.qid-dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.timers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.timer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--line);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  box-shadow: var(--shadow-sm);
}

.timer .ic {
  width: 15px;
  height: 15px;
  color: var(--ink);
}

.timer .val {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.timer .lbl {
  font-size: 10.5px;
  color: var(--ink-mute);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.progress-bar {
  height: 6px;
  background: var(--line);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: var(--ink);
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.qstrip-wrap {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 14px 18px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.qstrip-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-mute);
  font-weight: 600;
  white-space: nowrap;
}

.qstrip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px;
  scrollbar-width: thin;
}

.qstrip::-webkit-scrollbar {
  height: 6px;
}

.qstrip::-webkit-scrollbar-thumb {
  background: var(--line);
  border-radius: 3px;
}

.qpill {
  flex-shrink: 0;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 9px;
  border: 1.5px solid var(--line);
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s;
  font-variant-numeric: tabular-nums;
}

.qpill:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.qpill.current {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
  transform: scale(1.05);
}

.qpill.correct {
  background: var(--green-soft);
  border-color: var(--green);
  color: #166534;
}

.qpill.incorrect {
  background: var(--red-soft);
  border-color: var(--red);
  color: #991b1b;
}

.qpill.current.correct {
  background: var(--green);
  color: #fff;
}

.qpill.current.incorrect {
  background: var(--red);
  color: #fff;
}

.question-wrap {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 44px;
  box-shadow: var(--shadow-md);
}

.q-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 20px;
  flex-wrap: wrap;
}

.q-num {
  display: flex;
  align-items: center;
  gap: 14px;
}

.q-num-circle {
  width: 44px;
  height: 44px;
  background: var(--ink);
  color: #fff;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 17px;
}

.q-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.q-meta-tags {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.tag-subject {
  background: var(--line-soft);
  color: var(--ink);
}

.tag-grade {
  background: var(--line-soft);
  color: var(--ink-soft);
}

.tag-diff-oson {
  background: var(--green-soft);
  color: #166534;
}

.tag-diff-orta {
  background: var(--yellow-soft);
  color: #92400e;
}

.tag-diff-qiyin {
  background: var(--red-soft);
  color: #991b1b;
}

.tag .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.tag-diff-oson .dot {
  background: var(--green);
}

.tag-diff-orta .dot {
  background: var(--yellow);
}

.tag-diff-qiyin .dot {
  background: var(--red);
}

.q-meta-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.q-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 10px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--ink-soft);
}

.icon-btn:hover {
  background: #fff;
  color: var(--ink);
  border-color: var(--ink-mute);
}

.icon-btn.saved {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.q-text {
  font-size: 19px;
  line-height: 1.65;
  color: var(--ink);
  margin-bottom: 32px;
  letter-spacing: -0.005em;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  user-select: none;
}

.option:hover {
  border-color: var(--ink);
  background: var(--line-soft);
}

.option-letter {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--line);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--ink-soft);
  flex-shrink: 0;
  background: #fff;
  transition: all 0.18s;
}

.option-shortcut {
  margin-left: auto;
  font-size: 11px;
  color: var(--ink-mute);
  padding: 3px 7px;
  border: 1px solid var(--line);
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.18s;
}

.option:hover .option-letter {
  border-color: var(--ink);
  color: var(--ink);
}

.option-text {
  font-size: 16px;
  color: var(--ink);
  font-weight: 500;
}

.option-mark {
  opacity: 0;
  transition: opacity 0.18s;
  margin-left: 8px;
}

.option.selected {
  border-color: var(--ink);
  background: #fafbfc;
}

.option.selected .option-letter {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.option.correct {
  border-color: var(--green);
  background: var(--green-soft);
}

.option.correct .option-letter {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}

.option.correct .option-mark {
  opacity: 1;
  color: var(--green);
}

.option.incorrect {
  border-color: var(--red);
  background: var(--red-soft);
}

.option.incorrect .option-letter {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}

.option.incorrect .option-mark {
  opacity: 1;
  color: var(--red);
}

.options.locked .option {
  cursor: default;
}

.options.locked .option:not(.correct):not(.incorrect):hover {
  border-color: var(--line);
  background: #fff;
}

.options.locked .option-shortcut {
  opacity: 0.3;
}

.feedback {
  border-radius: 14px;
  padding: 20px 24px;
  margin-bottom: 28px;
  display: none;
  align-items: flex-start;
  gap: 14px;
  animation: slideIn 0.3s ease;
}

.feedback.show {
  display: flex;
}

.feedback.correct {
  background: var(--green-soft);
  border: 1px solid var(--green-ring);
}

.feedback.incorrect {
  background: var(--red-soft);
  border: 1px solid var(--red-ring);
}

.feedback-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.feedback.correct .feedback-icon {
  background: var(--green);
  color: #fff;
}

.feedback.incorrect .feedback-icon {
  background: var(--red);
  color: #fff;
}

.feedback-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
}

.feedback.correct .feedback-title {
  color: #166534;
}

.feedback.incorrect .feedback-title {
  color: #991b1b;
}

.feedback-text {
  font-size: 14px;
  color: var(--ink-soft);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.explanation {
  background: #fafbfc;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 28px;
  display: none;
  animation: slideIn 0.3s ease;
}

.explanation.show {
  display: block;
}

.exp-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.exp-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-mute);
  font-weight: 600;
}

.exp-divider {
  flex: 1;
  height: 1px;
  background: var(--line);
}

.exp-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}

.exp-correct-answer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--green-soft);
  color: #166534;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.exp-body {
  font-size: 15.5px;
  line-height: 1.7;
  color: var(--ink-soft);
}

.exp-body :deep(strong) {
  color: var(--ink);
  font-weight: 600;
}

.exp-body p {
  margin-bottom: 10px;
}

.exp-body p:last-child {
  margin-bottom: 0;
}

.exp-body :deep(.katex) {
  font-size: 1.05em;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-top: 28px;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;
}

.action-left,
.action-right {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  border: 1.5px solid transparent;
  background: #fff;
  color: var(--ink);
  white-space: nowrap;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-ghost {
  background: transparent;
  color: var(--ink-soft);
}

.btn-ghost:hover {
  background: var(--line-soft);
  color: var(--ink);
}

.btn-outline {
  background: #fff;
  border-color: var(--line);
  color: var(--ink);
}

.btn-outline:hover {
  border-color: var(--ink);
}

.btn-outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--ink);
  color: #fff;
}

.btn-primary:hover {
  background: #1a2942;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-danger {
  background: #fff;
  color: var(--red);
  border-color: var(--red-ring);
}

.btn-danger:hover {
  background: var(--red-soft);
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  margin-left: 4px;
}

.btn-outline .kbd,
.btn-ghost .kbd {
  background: var(--line-soft);
  color: var(--ink-soft);
}

.nudge {
  background: var(--yellow-soft);
  border: 1px solid #fcd34d;
  color: #92400e;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: none;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  animation: slideIn 0.3s ease;
}

.nudge.show {
  display: flex;
}

.nudge-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--yellow);
}

.nudge-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.nudge-btn {
  background: #fff;
  border: 1px solid #fcd34d;
  color: #92400e;
  padding: 6px 12px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.nudge-btn:hover {
  background: var(--yellow-soft);
}

.nudge-btn.primary {
  background: #92400e;
  color: #fff;
  border-color: #92400e;
}

.help-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: var(--ink);
  color: #fff;
  padding: 12px 20px 12px 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  border: none;
  font-family: inherit;
  transition: transform 0.15s;
  z-index: 40;
}

.help-fab:hover {
  transform: translateY(-2px);
}

.kbd-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 12px;
  color: var(--ink-mute);
}

.kbd-hint .kbd-key {
  background: #fff;
  border: 1px solid var(--line);
  padding: 2px 7px;
  border-radius: 5px;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  color: var(--ink-soft);
  font-weight: 600;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 40, 0.55);
  backdrop-filter: blur(4px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
  animation: fadeIn 0.25s ease;
}

.modal-backdrop.show {
  display: flex;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #fff;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  padding: 40px;
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.modal-trophy {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
}

.modal-trophy svg {
  width: 36px;
  height: 36px;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.modal-sub {
  color: var(--ink-soft);
  font-size: 15px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.score-card {
  background: var(--bg);
  border-radius: 14px;
  padding: 18px;
  border: 1px solid var(--line);
}

.score-label {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mute);
  font-weight: 600;
  margin-bottom: 6px;
}

.score-value {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.score-value.green {
  color: var(--green);
}

.score-value.red {
  color: var(--red);
}

.accuracy-row {
  background: #fafbfc;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 24px;
  border: 1px solid var(--line);
}

.accuracy-row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.accuracy-row-top .lbl {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft);
}

.accuracy-row-top .val {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.accuracy-bar {
  height: 8px;
  background: var(--line);
  border-radius: 999px;
  overflow: hidden;
}

.accuracy-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green) 0%, #4ade80 100%);
  border-radius: 999px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.state-block {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 56px 24px;
  text-align: center;
  color: var(--ink-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.state-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.state-spinner {
  width: 34px;
  height: 34px;
  border: 3px solid var(--line);
  border-top-color: var(--ink);
  border-radius: 50%;
  animation: state-spin 0.8s linear infinite;
}

@keyframes state-spin {
  to { transform: rotate(360deg); }
}

.quota-chip .ic {
  color: var(--yellow);
}

.quota-chip.low {
  border-color: var(--red-ring);
  background: var(--red-soft);
}

.quota-chip.low .val {
  color: var(--red);
}

.limit-icon {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
}

.limit-icon svg {
  width: 34px;
  height: 34px;
}

.limit-error {
  background: var(--red-soft);
  border: 1px solid var(--red-ring);
  color: #991b1b;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13.5px;
  margin-bottom: 16px;
  text-align: center;
}

.limit-topup {
  margin-top: 16px;
  text-align: center;
  font-size: 13.5px;
  color: var(--ink-soft);
}

.limit-topup a {
  color: var(--ink);
  font-weight: 600;
}

@media (max-width: 900px) {
  .page {
    padding: 24px 20px 60px;
  }

  h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 15px;
  }

  .question-wrap {
    padding: 24px 20px;
    border-radius: 18px;
  }

  .q-text {
    font-size: 17px;
  }

  .q-num-circle {
    width: 38px;
    height: 38px;
    font-size: 15px;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-left,
  .action-right {
    width: 100%;
    justify-content: space-between;
  }

  .action-right .btn {
    flex: 1;
    justify-content: center;
  }

  .option-shortcut {
    display: none;
  }

  .kbd-hint {
    display: none;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-bar .filter,
  .filter-bar .reset-btn {
    width: 100%;
  }

  .filter-btn {
    width: 100%;
    justify-content: flex-start;
  }

  .filter-btn .chev {
    margin-left: auto;
  }

  .filter-divider {
    display: none;
  }

  .dropdown {
    left: 0;
    right: 0;
  }

  .progress-row {
    gap: 10px;
  }

  .timer {
    padding: 6px 10px;
    font-size: 12px;
  }

  .modal {
    padding: 28px 20px;
  }

  .modal-title {
    font-size: 22px;
  }

  .score-grid {
    grid-template-columns: 1fr;
  }
}
</style>
