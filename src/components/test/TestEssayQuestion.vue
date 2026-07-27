<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

// Essay (insho) question — ported from the Ona tili demo page's question 45.
// The essay can be typed (syncs to the backend through the regular
// /user-answer textAnswer flow, debounced) or handed in as photos of the
// handwritten version. Photo pages stay client-side (localStorage, keyed by
// attempt + question) until the backend upload endpoint ships — mirroring the
// proposed essay-analysis contract in utils/essayAnalysisApi.js.
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  typedValue: {
    type: String,
    default: '',
  },
  attemptId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update-typed', 'update-uploads'])

const { t } = useI18n()

const MAX_ESSAY_PAGES = 5
// Raw upload cap — phone photos routinely hit 8–12 MB, so allow a generous
// input and let compressImage() shrink whatever lands here before we store it.
const MAX_ESSAY_FILE_MB = 25
const MAX_ESSAY_FILE_BYTES = MAX_ESSAY_FILE_MB * 1024 * 1024
// Downscale target (longest edge, px) + JPEG quality for the in-browser re-encode.
const MAX_IMAGE_EDGE = 2000
const JPEG_QUALITY = 0.82

const essayMode = ref('upload')
const uploads = ref([]) // { id, name, dataUrl }
const uploadError = ref('')
const isDragging = ref(false)
const fileInput = ref(null)
const cameraInput = ref(null)
let uploadSeq = 0

const isQuestionChecked = ref(false)

const essayModes = computed(() => [
  { key: 'upload', label: t('testPage.essay.modeUpload') },
  { key: 'type', label: t('testPage.essay.modeType') },
])

// ——— Typed essay ————————————————————————————————————————————————
// The textarea edits a local draft and pushes it up debounced — the parent
// forwards every update into the /user-answer sync queue, and re-POSTing the
// whole essay on each keystroke would keep that queue busy for minutes.
const draft = ref(props.typedValue || '')

watch(
  () => props.typedValue,
  (value) => {
    const normalized = value || ''
    if (normalized !== draft.value) {
      draft.value = normalized
    }
  },
)

let emitTypedTimeout = null

const flushTypedEmit = () => {
  clearTimeout(emitTypedTimeout)
  emitTypedTimeout = null
  if (draft.value !== (props.typedValue || '')) {
    emit('update-typed', props.question.id, draft.value)
  }
}

const onDraftInput = (event) => {
  draft.value = event.target.value
  clearTimeout(emitTypedTimeout)
  emitTypedTimeout = setTimeout(flushTypedEmit, 400)
}

const essayWords = computed(() => draft.value.trim().split(/\s+/).filter(Boolean).length)
const essayParagraphs = computed(
  () => draft.value.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean).length,
)

// ——— Handwriting uploads ————————————————————————————————————————
// Keyed by attempt + question so drafts never leak between attempts (a restart
// mints a new attempt id) or between essay questions.
const storageScope = computed(() => `${props.attemptId ?? 'draft'}:${props.question.id}`)
const modeStorageKey = computed(() => `essay-mode-v1:${storageScope.value}`)
const uploadsStorageKey = computed(() => `essay-uploads-v1:${storageScope.value}`)

const persistMode = () => {
  try {
    localStorage.setItem(modeStorageKey.value, essayMode.value)
  } catch {
    // Quota / private mode — mode just won't survive a reload.
  }
}

const persistUploads = () => {
  try {
    localStorage.setItem(uploadsStorageKey.value, JSON.stringify(uploads.value))
  } catch {
    // Photos can exceed the storage quota — keep them in memory for the session.
  }
}

const setEssayMode = (mode) => {
  essayMode.value = mode
  persistMode()
}

const setUploads = (nextUploads) => {
  uploads.value = nextUploads
  persistUploads()
  emit('update-uploads', props.question.id, uploads.value)
}

const restorePersisted = () => {
  let savedMode = null
  let savedUploads = []

  try {
    savedMode = localStorage.getItem(modeStorageKey.value)
    const parsed = JSON.parse(localStorage.getItem(uploadsStorageKey.value) || '[]')
    if (Array.isArray(parsed)) {
      savedUploads = parsed
    }
  } catch {
    // Corrupt draft — start clean.
  }

  essayMode.value = savedMode === 'type' ? 'type' : 'upload'
  uploads.value = savedUploads
  uploadError.value = ''
  emit('update-uploads', props.question.id, uploads.value)
}

watch(storageScope, restorePersisted, { immediate: true })

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
  uploadError.value = ''
  const files = [...(fileList || [])]
  if (!files.length) return

  for (const file of files) {
    // Accept anything the browser tags as an image, plus HEIC/HEIF by extension
    // (iOS sometimes reports an empty type for camera captures).
    const looksImage =
      file.type.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name || '')
    if (!looksImage) {
      uploadError.value = t('testPage.essay.errorOnlyImages')
      continue
    }
    if (uploads.value.length >= MAX_ESSAY_PAGES) {
      uploadError.value = t('testPage.essay.errorMaxPages', { max: MAX_ESSAY_PAGES })
      break
    }
    if (file.size > MAX_ESSAY_FILE_BYTES) {
      uploadError.value = t('testPage.essay.errorTooLarge', {
        name: file.name || t('testPage.essay.fileFallbackName'),
        mb: MAX_ESSAY_FILE_MB,
      })
      continue
    }

    try {
      const dataUrl = await compressImage(file)
      const id = `page-${++uploadSeq}-${file.lastModified || file.size}`
      setUploads([
        ...uploads.value,
        { id, name: file.name || t('testPage.essay.pageFallbackName'), dataUrl },
      ])
    } catch {
      uploadError.value = t('testPage.essay.errorDecodeFailed', {
        name: file.name || t('testPage.essay.fileFallbackName'),
      })
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
  isDragging.value = false
  void addEssayFiles(event.dataTransfer?.files)
}

const removeEssayUpload = (id) => {
  uploadError.value = ''
  setUploads(uploads.value.filter((upload) => upload.id !== id))
}

onBeforeUnmount(() => {
  flushTypedEmit()
})
</script>

<template>
  <div>
    <div class="flex items-start gap-3 sm:gap-4">
      <span class="font-mono-custom pt-[3.9px] mr-1 min-w-[22px] shrink-0 text-[15px] font-semibold leading-none text-[#1a1814] sm:min-w-[24px] sm:text-[17px]">
        {{ question.showOrder ? `${question.displayOrder}.` : '' }}
      </span>

      <div class="min-w-0 flex-1 space-y-3 sm:space-y-4">
        <!-- Plain text on purpose: the math parser mangles the exam's Uzbek
             spelling notation, and essay prompts arrive as multi-line text. -->
        <h2 class="max-w-full whitespace-pre-line text-[15px] font-normal leading-[1.65] text-[#1a1814] sm:text-[16px] sm:leading-[1.8]">
          {{ question.text }}
        </h2>

        <div
          v-if="question.imageUrl"
          class="rounded-[18px] border border-black/10 bg-[#faf8f4] p-2.5 sm:rounded-[22px] sm:p-3"
        >
          <img
            :src="question.imageUrl"
            :alt="t('testPage.imageAlt')"
            class="max-h-[420px] w-full object-contain"
          />
        </div>
      </div>

      <button
        type="button"
        class="mt-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1e5dc] bg-white shadow-[0_3px_10px_rgba(26,24,20,0.06)] transition hover:border-[#bcc7b5] hover:bg-[#fbfdf8] sm:mt-0.5"
        :class="isQuestionChecked ? 'text-[#1a1814]' : 'text-[#7f8a78]'"
        aria-label="Save question"
        @click.stop="isQuestionChecked = !isQuestionChecked"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z"
            :fill="isQuestionChecked ? 'currentColor' : 'none'"
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
          <p class="text-[13.5px] font-semibold text-[#1a1814] sm:text-[15px]">{{ t('testPage.essay.modeTitle') }}</p>
          <p class="mt-0.5 text-[12px] leading-snug text-[#8a857c] sm:text-[13px]">{{ t('testPage.essay.modeHint') }}</p>
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
            {{ essayWords }} {{ t('testPage.essay.words') }} &bull; {{ essayParagraphs }} {{ t('testPage.essay.paragraphs') }}
          </span>
        </div>
        <textarea
          :value="draft"
          @input="onDraftInput"
          @blur="flushTypedEmit"
          rows="14"
          :placeholder="t('testPage.essay.typedPlaceholder')"
          class="essay-ruled min-h-[420px] w-full resize-y rounded-2xl border border-[#e0ddd7] bg-white text-[16px] text-[#1a1814] shadow-[0_2px_8px_rgba(15,23,42,0.04)] outline-none transition-all duration-150 placeholder:text-[#9b958c] hover:border-[#bcb7ad] focus:border-[#1a1814] focus:shadow-[0_4px_14px_rgba(15,23,42,0.08)] focus:outline-none"
        ></textarea>
      </div>

      <!-- Handwriting upload mode -->
      <div v-else class="space-y-2.5 sm:space-y-3">
        <div class="flex items-center justify-between">
          <label class="font-mono-custom block text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
            {{ t('testPage.essay.uploadsLabel') }}
          </label>
          <span class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.14em] text-[#8a857c] sm:text-[11px]">
            {{ uploads.length }} / {{ MAX_ESSAY_PAGES }} {{ t('testPage.essay.pagesSuffix') }}
          </span>
        </div>

        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onEssayDrop"
          class="rounded-2xl border-2 border-dashed bg-white p-7 text-center transition-all duration-150 sm:p-9"
          :class="isDragging ? 'border-[#1a1814] bg-[#faf8f4]' : 'border-[#e0ddd7]'"
        >
          <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#e0ddd7] bg-[#faf8f4] text-[#8a857c]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <p class="text-[15px] font-medium text-[#1a1814]">
            {{ t('testPage.essay.dropTitle') }}
          </p>
          <div class="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <!-- Camera: on a phone `capture` opens the rear camera straight away;
                 on desktop the attribute is ignored and it falls back to a picker. -->
            <button
              type="button"
              @click="cameraInput?.click()"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2Z" />
                <circle cx="12" cy="13" r="3.4" />
              </svg>
              {{ t('testPage.essay.takePhoto') }}
            </button>
            <button
              type="button"
              @click="fileInput?.click()"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d1cec7] bg-white px-6 text-sm font-semibold text-[#1a1814] transition duration-200 hover:border-black active:scale-[0.98]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9" r="1.3" />
                <path d="m3 15 5-4 4 3 3-2 6 5" />
              </svg>
              {{ t('testPage.essay.pickPhoto') }}
            </button>
          </div>
          <p class="font-mono-custom mt-4 text-[10px] font-normal uppercase tracking-[0.14em] text-[#9b958c]">
            {{ t('testPage.essay.dropHint', { max: MAX_ESSAY_PAGES }) }}
          </p>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onEssayFilesPicked"
          />
          <input
            ref="cameraInput"
            type="file"
            accept="image/*"
            capture="environment"
            class="hidden"
            @change="onEssayFilesPicked"
          />
        </div>

        <p v-if="uploadError" class="text-[13.5px] font-medium text-red-600">
          {{ uploadError }}
        </p>

        <div v-if="uploads.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div
            v-for="(upload, index) in uploads"
            :key="upload.id"
            class="group relative overflow-hidden rounded-[18px] border border-[#e0ddd7] bg-[#faf8f4]"
          >
            <img :src="upload.dataUrl" :alt="upload.name" class="h-40 w-full object-cover" />
            <span class="font-mono-custom absolute left-2 top-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
              {{ t('testPage.essay.pageBadge', { n: index + 1 }) }}
            </span>
            <button
              type="button"
              @click="removeEssayUpload(upload.id)"
              class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#e0ddd7] bg-white text-[#6b6760] shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition hover:border-black hover:text-black"
              :aria-label="t('testPage.essay.removePage')"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <button
            v-if="uploads.length < MAX_ESSAY_PAGES"
            type="button"
            @click="fileInput?.click()"
            class="flex h-40 flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[#e0ddd7] bg-white text-[#8a857c] transition hover:border-[#1a1814] hover:text-[#1a1814]"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span class="text-[13px] font-medium">{{ t('testPage.essay.addPage') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
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
