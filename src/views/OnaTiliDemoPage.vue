<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NModal, NCard } from 'naive-ui'
import TestFloatingTools from '@/components/test/TestFloatingTools.vue'
import TestBottomBar from '@/components/test/TestBottomBar.vue'
import TestQuestionGroup from '@/components/test/TestQuestionGroup.vue'
import MathAnswerInput from '@/components/MathAnswerInput.vue'
import { onaTiliDemoTest as demoTest } from '@/data/onaTiliDemoTest'

const router = useRouter()
const { t } = useI18n()

// ——— Answers (demo draft, stored locally) ————————————————————————
const STORAGE_KEY = 'onatili-demo-answers-v2'

// Keys: question id for single answers, `${id}a` / `${id}b` for two-part ones.
const answers = reactive({})

const restoreAnswers = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    Object.assign(answers, saved)
  } catch {
    // Corrupt draft — start clean.
  }
}

let persistTimeout = null
const persistAnswers = () => {
  clearTimeout(persistTimeout)
  persistTimeout = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, 300)
}

const setAnswer = (key, value) => {
  answers[key] = value
  persistAnswers()
}

// ——— Questions mapped to the shapes the shared test components use ———
const toOptions = (question) =>
  (question.options || []).map((option) => ({ id: option.key, letter: option.key, text: option.text }))

const mcqQuestions = demoTest.questions
  .filter((question) => question.section === 'mcq')
  .map((question) => ({ ...question, options: toOptions(question) }))

const passageGroups = ['mushuklar', 'partiya', 'gazal'].map((key) => ({
  key,
  ...demoTest.groups[key],
  questions: demoTest.questions
    .filter((question) => question.group === key)
    .map((question) => ({ ...question, options: toOptions(question) })),
}))

// Matching (33–35) goes through the shared TestQuestionGroup so the popover
// dropdown behaves exactly like other tests. Numeric ids keep its Number()
// comparisons working.
const matchingBank = demoTest.groups.matching.bank.map((item, index) => ({
  id: index + 1,
  letter: item.letter,
  text: item.text,
}))

const matchingGroupQuestions = demoTest.questions
  .filter((question) => question.type === 'Matching')
  .map((question) => ({
    id: question.id,
    type: 'Matching',
    text: question.text.replace(/\n/g, ' '),
    matchingOptions: matchingBank,
  }))

const updateMatchingAnswer = (questionId, optionId) => {
  setAnswer(questionId, optionId ? Number(optionId) : '')
}

const freeQuestions = demoTest.questions.filter(
  (question) => question.section === 'written' && question.type === 'FreeAnswer',
)

const essayQuestion = demoTest.questions.find((question) => question.type === 'Essay')

// Structure rules shown exactly like they appear on the exam paper.
const essayRulesText = [
  'Esse uch tarkibiy qismdan iborat bo‘lishi lozim:',
  '',
  'I. Kirish.',
  ...essayQuestion.structure.kirish.map((rule, index) => `${index + 1}) ${rule}`),
  '',
  'II. Asosiy qism.',
  ...essayQuestion.structure.asosiy.map((rule, index) => `${index + 1}) ${rule}`),
  '',
  'III. Xulosa.',
  ...essayQuestion.structure.xulosa.map((rule, index) => `${index + 1}) ${rule}`),
  '',
  `DIQQAT! ${essayQuestion.notes.join(' ')}`,
].join('\n')

const essayText = computed(() => String(answers[essayQuestion.id] || ''))
const essayWords = computed(() => essayText.value.trim().split(/\s+/).filter(Boolean).length)
const essayParagraphs = computed(
  () => essayText.value.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean).length,
)

// Essay can be typed or handed in as photos of the handwritten version.
const ESSAY_MODE_KEY = 'onatili-demo-essay-mode'
const ESSAY_UPLOADS_KEY = 'onatili-demo-essay-uploads'
const MAX_ESSAY_PAGES = 5
// Raw upload cap — phone photos routinely hit 8–12 MB, so allow a generous
// input and let compressImage() shrink whatever lands here before we store it.
const MAX_ESSAY_FILE_MB = 25
const MAX_ESSAY_FILE_BYTES = MAX_ESSAY_FILE_MB * 1024 * 1024
// Downscale target (longest edge, px) + JPEG quality for the in-browser re-encode.
const MAX_IMAGE_EDGE = 2000
const JPEG_QUALITY = 0.82

const essayMode = ref('type')
const essayUploads = ref([]) // { id, name, dataUrl }
const essayUploadError = ref('')
const isDraggingEssay = ref(false)
const essayFileInput = ref(null)
const essayCameraInput = ref(null)
let essayUploadSeq = 0

const essayModes = [
  { key: 'type', label: 'Matn yozish' },
  { key: 'upload', label: 'Qo‘lyozma yuklash' },
]

const setEssayMode = (mode) => {
  essayMode.value = mode
  localStorage.setItem(ESSAY_MODE_KEY, mode)
}

const persistEssayUploads = () => {
  try {
    localStorage.setItem(ESSAY_UPLOADS_KEY, JSON.stringify(essayUploads.value))
  } catch {
    // Photos can exceed the storage quota — keep them in memory for the session.
  }
}

// Load a picked file, downscale so the longest edge is <= MAX_IMAGE_EDGE, and
// re-encode as JPEG. This shrinks multi-megabyte phone photos to a few hundred
// KB (so five pages fit in localStorage / a future upload) and converts iOS
// HEIC to JPEG — Safari decodes HEIC into the <img>, and the canvas re-exports
// it as a portable format every backend can read.
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const longest = Math.max(img.naturalWidth, img.naturalHeight) || 1
      const scale = Math.min(1, MAX_IMAGE_EDGE / longest)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode-failed'))
    }
    img.src = url
  })

const addEssayFiles = async (fileList) => {
  essayUploadError.value = ''
  const files = [...(fileList || [])]
  if (!files.length) return

  for (const file of files) {
    // Accept anything the browser tags as an image, plus HEIC/HEIF by extension
    // (iOS sometimes reports an empty type for camera captures).
    const looksImage =
      file.type.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name || '')
    if (!looksImage) {
      essayUploadError.value = 'Faqat rasm yuklash mumkin (JPG, PNG yoki telefon rasmi).'
      continue
    }
    if (essayUploads.value.length >= MAX_ESSAY_PAGES) {
      essayUploadError.value = `Ko‘pi bilan ${MAX_ESSAY_PAGES} ta sahifa yuklash mumkin.`
      break
    }
    if (file.size > MAX_ESSAY_FILE_BYTES) {
      essayUploadError.value = `${file.name || 'Rasm'} juda katta — har bir rasm ${MAX_ESSAY_FILE_MB} MB dan oshmasligi kerak.`
      continue
    }

    try {
      const dataUrl = await compressImage(file)
      const id = `page-${++essayUploadSeq}-${file.lastModified || file.size}`
      essayUploads.value = [...essayUploads.value, { id, name: file.name || 'Sahifa', dataUrl }]
      persistEssayUploads()
    } catch {
      essayUploadError.value = `${file.name || 'Rasm'}ni ochib bo‘lmadi. Iltimos, JPG yoki PNG shaklida qayta urinib ko‘ring.`
    }
  }
}

const onEssayFilesPicked = (event) => {
  const input = event.target
  const files = [...(input.files || [])]
  input.value = '' // reset so the same photo can be re-picked later
  void addEssayFiles(files)
}

const onEssayDrop = (event) => {
  isDraggingEssay.value = false
  void addEssayFiles(event.dataTransfer?.files)
}

const removeEssayUpload = (id) => {
  essayUploads.value = essayUploads.value.filter((upload) => upload.id !== id)
  essayUploadError.value = ''
  persistEssayUploads()
}

// ——— Passage rendering ————————————————————————————————————————————
// [[n:phrase]] markers render as the printed exam shows them: [n] + bold phrase.
const MARKER_RE = /\[\[(\d+):([^\]]+)\]\]/g

const parseParagraph = (paragraph) => {
  const segments = []
  let cursor = 0
  for (const match of paragraph.matchAll(MARKER_RE)) {
    if (match.index > cursor) segments.push({ mark: false, text: paragraph.slice(cursor, match.index) })
    segments.push({ mark: true, n: match[1], text: match[2] })
    cursor = match.index + match[0].length
  }
  if (cursor < paragraph.length) segments.push({ mark: false, text: paragraph.slice(cursor) })
  return segments
}

const passageParagraphs = (group) =>
  (group.text || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(parseParagraph)

// ——— Progress ————————————————————————————————————————————————————
const totalQuestions = demoTest.questions.length

const isAnswered = (question) => {
  if (question.parts) {
    return question.parts.some((part) => String(answers[`${question.id}${part.key}`] || '').trim())
  }
  const value = answers[question.id]
  if (question.type === 'Essay') {
    return Boolean(String(value || '').trim()) || essayUploads.value.length > 0
  }
  if (question.type === 'FreeAnswer') return Boolean(String(value || '').trim())
  return Boolean(value)
}

const answeredCount = computed(() => demoTest.questions.filter(isAnswered).length)

// ——— Timer ————————————————————————————————————————————————————————
const remainingSeconds = ref(demoTest.durationMinutes * 60)
let timerInterval = null

// ——— Submit (demo) ————————————————————————————————————————————————
// The submission moves to its own localStorage key so the results page
// (/ona-tili-demo-natija) can grade and display it after the draft is wiped.
const SUBMISSION_KEY = 'onatili-demo-submission-v1'
const showSubmitModal = ref(false)

const confirmSubmitTest = () => {
  const submission = {
    submittedAt: new Date().toISOString(),
    answers: { ...answers },
    essayMode: essayMode.value,
    essayUploads: essayUploads.value,
  }
  try {
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submission))
  } catch {
    // Photo pages can blow the quota — retry keeping everything but the images.
    try {
      localStorage.setItem(SUBMISSION_KEY, JSON.stringify({ ...submission, essayUploads: [] }))
    } catch {
      // Still too big — the results page will show its empty state.
    }
  }
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ESSAY_UPLOADS_KEY)
  localStorage.removeItem(ESSAY_MODE_KEY)
  showSubmitModal.value = false
  router.push('/ona-tili-demo-natija')
}

// Bookmark buttons — same local-only behaviour as the shared components.
const checkedQuestions = reactive({})

onMounted(() => {
  restoreAnswers()
  const savedMode = localStorage.getItem(ESSAY_MODE_KEY)
  if (savedMode === 'type' || savedMode === 'upload') essayMode.value = savedMode
  try {
    const savedUploads = JSON.parse(localStorage.getItem(ESSAY_UPLOADS_KEY) || '[]')
    if (Array.isArray(savedUploads)) essayUploads.value = savedUploads
  } catch {
    // Corrupt draft — start clean.
  }
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) remainingSeconds.value -= 1
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timerInterval)
  clearTimeout(persistTimeout)
})
</script>

<template>
  <main class="font-sans-custom min-h-screen bg-[#f5f3ef] pb-[190px] pt-2 text-black selection:bg-black selection:text-white sm:pb-[220px] sm:pt-6">
    <TestFloatingTools :remaining-seconds="remainingSeconds" />

    <div class="mx-auto max-w-[1280px] px-3 py-2 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
      <div class="mx-auto max-w-[1040px]">
        <div
          class="mx-auto min-h-[calc(100vh-11rem)] max-w-[920px] overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white px-4 pb-14 pt-5 shadow-[0_14px_40px_rgba(26,24,20,0.06)] ring-1 ring-[#ebe7e0] sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-16 lg:pb-20 lg:pt-12"
        >
          <!-- Header -->
          <div class="border-b border-[#e0ddd7] pb-5 sm:pb-8">
            <h1 class="font-serif-custom text-[2rem] font-normal leading-[0.96] tracking-[0.01em] text-[#1a1814] sm:text-[2.55rem] lg:text-4xl">
              {{ demoTest.title }}
            </h1>
            <p class="font-mono-custom mt-3 text-[11px] font-normal uppercase tracking-[0.18em] text-[#8a857c] sm:text-sm">
              {{ demoTest.durationMinutes }} {{ t('testPage.minutes') }} &bull; {{ totalQuestions }} {{ t('testPage.questionsLabel') }}
            </p>
          </div>

          <!-- ——— 1-qism: test savollari (1–17) ——— -->
          <div class="my-6 flex items-center gap-3 sm:my-10 sm:gap-4">
            <div class="h-px flex-1 bg-[#e0ddd7]"></div>
            <p class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.22em] text-[#8a857c] sm:text-xs">
              {{ t('testPage.sectionTitle') }}
            </p>
            <div class="h-px flex-1 bg-[#e0ddd7]"></div>
          </div>

          <div class="space-y-8 pb-3 sm:space-y-10 sm:pb-4">
            <div v-for="question in mcqQuestions" :key="question.id" class="question-block">
              <div class="flex items-start gap-3 sm:gap-4">
                <span class="font-mono-custom pt-[3.9px] mr-1 min-w-[22px] shrink-0 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
                  {{ question.id }}.
                </span>

                <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
                  <h2 class="max-w-full text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]">
                    {{ question.text }}
                  </h2>

                  <p
                    v-if="question.body"
                    class="max-w-full whitespace-pre-line text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]"
                  >{{ question.body }}</p>

                  <!-- Same look as TestOptionButtons, minus the math parser
                       (it mangles the exam's to‘q//qizil spelling notation). -->
                  <div class="space-y-2.5">
                    <button
                      v-for="option in question.options"
                      :key="option.id"
                      type="button"
                      @click="setAnswer(question.id, option.id)"
                      class="group flex w-full min-w-0 items-start gap-3 rounded-[16px] border px-3.5 py-3 text-left transition sm:items-center sm:gap-4 sm:rounded-none sm:border-transparent sm:px-0 sm:py-0"
                      :class="
                        answers[question.id] === option.id
                          ? 'border-black/90 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:bg-transparent sm:shadow-none'
                          : 'border-black/8 bg-[#faf8f4] hover:border-black/20 hover:bg-white sm:bg-transparent sm:hover:border-transparent sm:hover:bg-transparent'
                      "
                    >
                      <span
                        class="font-mono-custom flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black text-[14px] font-medium transition-all duration-200 sm:text-[15px]"
                        :class="
                          answers[question.id] === option.id
                            ? 'bg-black text-white'
                            : 'bg-white text-black group-hover:bg-black group-hover:text-white'
                        "
                      >
                        {{ option.letter }}
                      </span>
                      <p class="min-w-0 flex-1 pt-0.5 text-[15px] font-medium leading-[1.55] text-[#1a1814] sm:pt-0 sm:text-[16px] sm:leading-[1.7]">
                        {{ option.text }}
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  class="mt-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1e5dc] bg-white shadow-[0_3px_10px_rgba(26,24,20,0.06)] transition hover:border-[#bcc7b5] hover:bg-[#fbfdf8] sm:mt-0.5"
                  :class="checkedQuestions[question.id] ? 'text-[#1a1814]' : 'text-[#7f8a78]'"
                  aria-label="Save question"
                  @click.stop="checkedQuestions[question.id] = !checkedQuestions[question.id]"
                >
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z"
                      :fill="checkedQuestions[question.id] ? 'currentColor' : 'none'"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- ——— Matn bilan ishlash (18–32) ——— -->
            <template v-for="group in passageGroups" :key="group.key">
              <div class="question-block">
                <div class="rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6">
                  <!-- Instruction + passage, styled like other grouped tasks -->
                  <div class="border-l-[3px] border-[#5b5750] pl-3.5 sm:pl-4">
                    <p class="text-[14px] font-semibold leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]">
                      {{ group.instruction }}
                    </p>
                  </div>

                  <div class="mt-4 rounded-[18px] border border-black/10 bg-[#faf8f4] p-4 sm:mt-5 sm:rounded-[22px] sm:p-6">
                    <p class="text-center text-[15px] font-semibold text-[#1a1814] sm:text-[16px]">
                      {{ group.title }}<span v-if="group.author"> ({{ group.author }})</span>
                    </p>

                    <!-- Prose passage -->
                    <template v-if="group.kind === 'prose'">
                      <p
                        v-for="(paragraph, pIndex) in passageParagraphs(group)"
                        :key="pIndex"
                        class="mt-3 text-[14px] font-normal leading-[1.75] text-[#1a1814] sm:text-[15px] sm:leading-[1.85]"
                      >
                        <template v-for="(segment, sIndex) in paragraph" :key="sIndex">
                          <span v-if="!segment.mark">{{ segment.text }}</span>
                          <strong v-else class="font-semibold">[{{ segment.n }}]{{ segment.text }}</strong>
                        </template>
                      </p>
                      <p
                        v-if="group.credit"
                        class="mt-4 text-right text-[13px] italic text-[#8a857c]"
                      >
                        {{ group.credit }}
                      </p>
                    </template>

                    <!-- Poem -->
                    <template v-else>
                      <div class="mt-4 space-y-3 text-center">
                        <p
                          v-for="(couplet, cIndex) in group.couplets"
                          :key="cIndex"
                          class="text-[14px] font-normal italic leading-[1.75] text-[#1a1814] sm:text-[15px] sm:leading-[1.85]"
                        >
                          {{ couplet[0] }}<br />{{ couplet[1] }}
                        </p>
                      </div>
                      <p class="mt-4 text-[13px] leading-[1.7] text-[#6b6760]">
                        <span class="font-semibold text-[#1a1814]">Lug‘at:</span>
                        <template v-for="(entry, gIndex) in group.glossary" :key="entry.term">
                          {{ entry.term }} — {{ entry.meaning }}<span v-if="gIndex < group.glossary.length - 1">, </span>
                        </template>
                      </p>
                    </template>
                  </div>

                  <!-- The group's questions, numbered like the rest of the sheet -->
                  <div class="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
                    <div v-for="question in group.questions" :key="question.id" class="flex items-start gap-3 sm:gap-4">
                      <span class="font-mono-custom mr-1 min-w-[22px] shrink-0 pt-[3.9px] text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
                        {{ question.id }}.
                      </span>

                      <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
                        <h2 class="max-w-full text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]">
                          {{ question.text }}
                        </h2>

                        <p
                          v-if="question.body"
                          class="max-w-full whitespace-pre-line text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]"
                        >{{ question.body }}</p>

                        <div class="space-y-2.5">
                          <button
                            v-for="option in question.options"
                            :key="option.id"
                            type="button"
                            @click="setAnswer(question.id, option.id)"
                            class="group flex w-full min-w-0 items-start gap-3 rounded-[16px] border px-3.5 py-3 text-left transition sm:items-center sm:gap-4 sm:rounded-none sm:border-transparent sm:px-0 sm:py-0"
                            :class="
                              answers[question.id] === option.id
                                ? 'border-black/90 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:bg-transparent sm:shadow-none'
                                : 'border-black/8 bg-[#faf8f4] hover:border-black/20 hover:bg-white sm:bg-transparent sm:hover:border-transparent sm:hover:bg-transparent'
                            "
                          >
                            <span
                              class="font-mono-custom flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black text-[14px] font-medium transition-all duration-200 sm:text-[15px]"
                              :class="
                                answers[question.id] === option.id
                                  ? 'bg-black text-white'
                                  : 'bg-white text-black group-hover:bg-black group-hover:text-white'
                              "
                            >
                              {{ option.letter }}
                            </span>
                            <p class="min-w-0 flex-1 pt-0.5 text-[15px] font-medium leading-[1.55] text-[#1a1814] sm:pt-0 sm:text-[16px] sm:leading-[1.7]">
                              {{ option.text }}
                            </p>
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        class="mt-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1e5dc] bg-white shadow-[0_3px_10px_rgba(26,24,20,0.06)] transition hover:border-[#bcc7b5] hover:bg-[#fbfdf8] sm:mt-0.5"
                        :class="checkedQuestions[question.id] ? 'text-[#1a1814]' : 'text-[#7f8a78]'"
                        aria-label="Save question"
                        @click.stop="checkedQuestions[question.id] = !checkedQuestions[question.id]"
                      >
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z"
                            :fill="checkedQuestions[question.id] ? 'currentColor' : 'none'"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ——— Moslashtirish (33–35) — shared group component ——— -->
            <div class="question-block">
              <!-- Plain wording: digits/parens in the exam's original phrasing
                   trip the shared math renderer into italics. -->
              <TestQuestionGroup
                title="Berilgan gaplar va sintaktik tahlilga oid izohlarni o‘zaro to‘g‘ri moslashtiring."
                order-label="33-35"
                :option-bank="matchingBank"
                :questions="matchingGroupQuestions"
                :selected-answers="answers"
                :resolve-free-answer="() => ''"
                :image-alt="t('testPage.imageAlt')"
                :option-bank-label="t('testPage.optionBank')"
                :select-option-label="t('testPage.selectOption')"
                :free-answer-label="t('testPage.freeAnswerLabel')"
                :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
                @update-matching-answer="updateMatchingAnswer"
              />
            </div>

            <!-- ——— Yozma javoblar (36–44) ——— -->
            <template v-for="question in freeQuestions" :key="question.id">
              <!-- Single free answer — same group-card + accent-bar shell as the
                   a/b tasks below (and the shared TestQuestionGroup the real tests
                   use), so the whole "Yozma javoblar" block reads uniformly. -->
              <div v-if="!question.parts" class="question-block">
                <div class="rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6">
                  <div class="border-l-[3px] border-[#5b5750] pl-3.5 sm:pl-4">
                    <div class="flex items-start gap-3 sm:gap-4">
                      <span class="font-mono-custom min-w-[40px] shrink-0 pt-0.5 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[46px] sm:text-[17px]">
                        {{ question.id }}
                      </span>
                      <div class="min-w-0 flex-1 space-y-2">
                        <p class="text-[14px] font-normal leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]">
                          {{ question.text }}
                        </p>
                        <p
                          v-if="question.body"
                          class="whitespace-pre-line text-[14px] font-normal leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]"
                        >{{ question.body }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="mt-5 sm:mt-6">
                    <div class="flex items-start gap-3 sm:gap-4">
                      <div class="min-w-0 flex-1">
                        <div class="max-w-[620px] space-y-2.5 sm:space-y-3">
                          <label class="font-mono-custom block text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
                            {{ t('testPage.freeAnswerLabel') }}
                          </label>
                          <MathAnswerInput
                            :model-value="answers[question.id] || ''"
                            :placeholder="t('testPage.freeAnswerPlaceholder')"
                            @update:model-value="setAnswer(question.id, $event)"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        class="mt-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1e5dc] bg-white shadow-[0_3px_10px_rgba(26,24,20,0.06)] transition hover:border-[#bcc7b5] hover:bg-[#fbfdf8] sm:mt-0.5"
                        :class="checkedQuestions[question.id] ? 'text-[#1a1814]' : 'text-[#7f8a78]'"
                        aria-label="Save question"
                        @click.stop="checkedQuestions[question.id] = !checkedQuestions[question.id]"
                      >
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z"
                            :fill="checkedQuestions[question.id] ? 'currentColor' : 'none'"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- a) / b) questions — group card like other tests use for multi-part tasks -->
              <div v-else class="question-block">
                <div class="rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4 shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6">
                  <div class="border-l-[3px] border-[#5b5750] pl-3.5 sm:pl-4">
                    <div class="flex items-start gap-3 sm:gap-4">
                      <span class="font-mono-custom min-w-[40px] shrink-0 pt-0.5 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[46px] sm:text-[17px]">
                        {{ question.id }}
                      </span>
                      <div class="min-w-0 flex-1 space-y-2">
                        <p class="text-[14px] font-normal leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]">
                          {{ question.text }}
                        </p>
                        <p
                          v-if="question.body"
                          class="whitespace-pre-line text-[14px] font-normal leading-[1.7] text-[#1a1814] sm:text-[16px] sm:leading-[1.85]"
                        >{{ question.body }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="mt-5 space-y-5 sm:mt-6 sm:space-y-6">
                    <div v-for="part in question.parts" :key="part.key" class="flex items-start gap-3 sm:gap-4">
                      <span class="font-mono-custom mr-1 min-w-[22px] shrink-0 pt-[3.9px] text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
                        {{ part.key }}.
                      </span>

                      <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
                        <h2 class="max-w-full text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]">
                          {{ part.text }}
                        </h2>

                        <div class="max-w-[620px] space-y-2.5 sm:space-y-3">
                          <label class="font-mono-custom block text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
                            {{ t('testPage.freeAnswerLabel') }}
                          </label>
                          <MathAnswerInput
                            :model-value="answers[`${question.id}${part.key}`] || ''"
                            :placeholder="t('testPage.freeAnswerPlaceholder')"
                            @update:model-value="setAnswer(`${question.id}${part.key}`, $event)"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        class="mt-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1e5dc] bg-white shadow-[0_3px_10px_rgba(26,24,20,0.06)] transition hover:border-[#bcc7b5] hover:bg-[#fbfdf8] sm:mt-0.5"
                        :class="checkedQuestions[`${question.id}${part.key}`] ? 'text-[#1a1814]' : 'text-[#7f8a78]'"
                        aria-label="Save question"
                        @click.stop="checkedQuestions[`${question.id}${part.key}`] = !checkedQuestions[`${question.id}${part.key}`]"
                      >
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z"
                            :fill="checkedQuestions[`${question.id}${part.key}`] ? 'currentColor' : 'none'"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ——— Esse (45) ——— -->
            <div class="question-block">
              <div class="flex items-start gap-3 sm:gap-4">
                <span class="font-mono-custom pt-[3.9px] mr-1 min-w-[22px] shrink-0 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
                  45.
                </span>

                <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
                  <h2 class="max-w-full text-[15px] font-semibold leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]">
                    ESSE. {{ essayQuestion.text }}
                  </h2>

                  <div class="rounded-[18px] border border-black/10 bg-[#faf8f4] p-4 sm:rounded-[22px] sm:p-5">
                    <p class="text-[14px] font-normal leading-[1.75] text-[#1a1814] sm:text-[15px] sm:leading-[1.85]">
                      {{ essayQuestion.body }}
                    </p>
                    <ul class="mt-3 space-y-1">
                      <li
                        v-for="requirement in essayQuestion.requirements"
                        :key="requirement"
                        class="text-[13.5px] leading-[1.7] text-[#1a1814] sm:text-[14px]"
                      >
                        &bull; {{ requirement }}
                      </li>
                    </ul>
                    <p class="mt-3 whitespace-pre-line text-[13px] leading-[1.7] text-[#6b6760] sm:text-[13.5px]">{{ essayRulesText }}</p>
                  </div>

                </div>

                <button
                  type="button"
                  class="mt-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1e5dc] bg-white shadow-[0_3px_10px_rgba(26,24,20,0.06)] transition hover:border-[#bcc7b5] hover:bg-[#fbfdf8] sm:mt-0.5"
                  :class="checkedQuestions[45] ? 'text-[#1a1814]' : 'text-[#7f8a78]'"
                  aria-label="Save question"
                  @click.stop="checkedQuestions[45] = !checkedQuestions[45]"
                >
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z"
                      :fill="checkedQuestions[45] ? 'currentColor' : 'none'"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <!-- Full-width writing area — the essay answer breaks out of the number
                   gutter and gets the whole card width (it's the biggest task). -->
              <div class="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
                <!-- Emphasized method chooser: type the essay, or upload photos of a
                     handwritten one. A labelled segmented control, not easy-to-miss pills. -->
                <div class="flex flex-col gap-3 rounded-2xl border border-[#e0ddd7] bg-[#faf8f4] p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-4">
                  <div class="min-w-0">
                    <p class="text-[13.5px] font-semibold text-[#1a1814] sm:text-[15px]">Insho javobini qanday topshirasiz?</p>
                    <p class="mt-0.5 text-[12px] leading-snug text-[#8a857c] sm:text-[13px]">Matn sifatida yozing yoki qo‘lyozmangiz rasmlarini yuklang.</p>
                  </div>
                  <div class="inline-flex shrink-0 rounded-full border border-[#d1cec7] bg-white p-1 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
                    <button
                      v-for="mode in essayModes"
                      :key="mode.key"
                      type="button"
                      @click="setEssayMode(mode.key)"
                      class="inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition duration-200 active:scale-[0.98] sm:h-10 sm:px-5 sm:text-sm"
                      :class="essayMode === mode.key
                        ? 'bg-black text-white shadow-[0_3px_10px_rgba(15,23,42,0.18)]'
                        : 'text-[#6b6760] hover:text-black'"
                    >
                      <svg v-if="mode.key === 'type'" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="6" width="18" height="12" rx="2" />
                        <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
                      </svg>
                      <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
                        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                      </svg>
                      {{ mode.label }}
                    </button>
                  </div>
                </div>

                  <!-- Typing mode -->
                  <div v-if="essayMode === 'type'" class="space-y-2.5 sm:space-y-3">
                    <div class="flex items-center justify-between">
                      <label class="font-mono-custom block text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
                        {{ t('testPage.freeAnswerLabel') }}
                      </label>
                      <span class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.14em] text-[#8a857c] sm:text-[11px]">
                        {{ essayWords }} so‘z &bull; {{ essayParagraphs }} xatboshi
                      </span>
                    </div>
                    <textarea
                      :value="essayText"
                      @input="setAnswer(essayQuestion.id, $event.target.value)"
                      rows="14"
                      placeholder="Inshoni shu yerga yozing. Har bir xatboshini yangi qatordan boshlang…"
                      class="essay-ruled min-h-[420px] w-full resize-y rounded-2xl border border-[#e0ddd7] bg-white text-[16px] text-[#1a1814] shadow-[0_2px_8px_rgba(15,23,42,0.04)] outline-none transition-all duration-150 placeholder:text-[#9b958c] hover:border-[#bcb7ad] focus:border-[#1a1814] focus:shadow-[0_4px_14px_rgba(15,23,42,0.08)] focus:outline-none"
                    ></textarea>
                  </div>

                  <!-- Handwriting upload mode -->
                  <div v-else class="space-y-2.5 sm:space-y-3">
                    <div class="flex items-center justify-between">
                      <label class="font-mono-custom block text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
                        Qo‘lyozma sahifalari
                      </label>
                      <span class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.14em] text-[#8a857c] sm:text-[11px]">
                        {{ essayUploads.length }} / {{ MAX_ESSAY_PAGES }} sahifa
                      </span>
                    </div>

                    <div
                      @dragover.prevent="isDraggingEssay = true"
                      @dragleave.prevent="isDraggingEssay = false"
                      @drop.prevent="onEssayDrop"
                      class="rounded-2xl border-2 border-dashed bg-white p-7 text-center transition-all duration-150 sm:p-9"
                      :class="isDraggingEssay ? 'border-[#1a1814] bg-[#faf8f4]' : 'border-[#e0ddd7]'"
                    >
                      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#e0ddd7] bg-[#faf8f4] text-[#8a857c]">
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
                          <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                        </svg>
                      </div>
                      <p class="text-[15px] font-medium text-[#1a1814]">
                        Qo‘lyozma inshoingiz rasmini oling yoki shu yerga tashlang
                      </p>
                      <div class="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                        <!-- Camera: on a phone `capture` opens the rear camera straight away;
                             on desktop the attribute is ignored and it falls back to a picker. -->
                        <button
                          type="button"
                          @click="essayCameraInput?.click()"
                          class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
                        >
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2Z" />
                            <circle cx="12" cy="13" r="3.4" />
                          </svg>
                          Rasm olish
                        </button>
                        <button
                          type="button"
                          @click="essayFileInput?.click()"
                          class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d1cec7] bg-white px-6 text-sm font-semibold text-[#1a1814] transition duration-200 hover:border-black active:scale-[0.98]"
                        >
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <circle cx="8.5" cy="9" r="1.3" />
                            <path d="m3 15 5-4 4 3 3-2 6 5" />
                          </svg>
                          Rasm tanlash
                        </button>
                      </div>
                      <p class="font-mono-custom mt-4 text-[10px] font-normal uppercase tracking-[0.14em] text-[#9b958c]">
                        JPG, PNG yoki HEIC &bull; rasmlar avtomatik siqiladi &bull; ko‘pi bilan {{ MAX_ESSAY_PAGES }} sahifa
                      </p>
                      <input
                        ref="essayFileInput"
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="onEssayFilesPicked"
                      />
                      <input
                        ref="essayCameraInput"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        class="hidden"
                        @change="onEssayFilesPicked"
                      />
                    </div>

                    <p v-if="essayUploadError" class="text-[13.5px] font-medium text-red-600">
                      {{ essayUploadError }}
                    </p>

                    <div v-if="essayUploads.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div
                        v-for="(upload, index) in essayUploads"
                        :key="upload.id"
                        class="group relative overflow-hidden rounded-[18px] border border-[#e0ddd7] bg-[#faf8f4]"
                      >
                        <img :src="upload.dataUrl" :alt="upload.name" class="h-40 w-full object-cover" />
                        <span class="font-mono-custom absolute left-2 top-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                          {{ index + 1 }}-sahifa
                        </span>
                        <button
                          type="button"
                          @click="removeEssayUpload(upload.id)"
                          class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#e0ddd7] bg-white text-[#6b6760] shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition hover:border-black hover:text-black"
                          aria-label="Sahifani o‘chirish"
                        >
                          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                            <path d="M6 6l12 12M18 6 6 18" />
                          </svg>
                        </button>
                      </div>

                      <button
                        v-if="essayUploads.length < MAX_ESSAY_PAGES"
                        type="button"
                        @click="essayFileInput?.click()"
                        class="flex h-40 flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[#e0ddd7] bg-white text-[#8a857c] transition hover:border-[#1a1814] hover:text-[#1a1814]"
                      >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span class="text-[13px] font-medium">Sahifa qo‘shish</span>
                      </button>
                    </div>
                  </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <TestBottomBar
      :answered-count="answeredCount"
      :total-questions="totalQuestions"
      :answered-label="t('testPage.answered')"
      :submit-label="t('testPage.finish')"
      @submit="showSubmitModal = true"
    />

    <NModal v-model:show="showSubmitModal">
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div class="space-y-2">
              <h4 class="text-xl font-bold tracking-tight text-black">
                {{ t('testPage.submitConfirmTitle') }}
              </h4>
              <p class="text-sm text-[#6b6760]">
                Bu dizayn namoyishi — javoblar serverga yuborilmaydi.
              </p>
            </div>

            <div class="flex justify-center gap-3">
              <button
                type="button"
                @click="showSubmitModal = false"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition duration-200 hover:bg-black hover:text-white active:scale-[0.98]"
              >
                {{ t('testPage.submitConfirmNo') }}
              </button>

              <button
                type="button"
                @click="confirmSubmitTest"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
              >
                {{ t('testPage.submitConfirmYes') }}
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>
  </main>
</template>

<style scoped>
/* Notebook ruling for the essay, like an ona tili exercise daftar: dark ink
   rules. All vertical metrics are whole pixels (36px period = line-height =
   padding-top) so every rule lands on a device pixel — fractional rem values
   made alternating lines render lighter. background-attachment: local keeps
   the ruling scrolling with the text. */
.essay-ruled {
  line-height: 36px;
  padding: 36px 24px 24px 24px;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 35px,
    rgba(26, 24, 20, 0.6) 35px,
    rgba(26, 24, 20, 0.6) 36px
  );
  background-attachment: local;
}
</style>
