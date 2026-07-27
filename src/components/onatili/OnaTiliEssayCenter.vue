<script setup>
// "Insho tekshirish" tab of the Ona tili page.
//
// Lets a student check ONLY their essay (no objective test): pick a ready-made
// topic, add their own custom topic, then write / paste / photograph an essay
// and send it for AI analysis. Custom topics persist in localStorage so they
// survive reloads. The analysis itself reuses EssayAnalysisSection — the very
// same component the real /test essay results use.
//
// AI wiring: the grading endpoint isn't live yet (see
// utils/essayAnalysisApi.js + ONA_TILI_INSHO_INTEGRATION.md). Until it lands,
// submitting shows the section in `sample` mode: the annotated essay is the
// captured demo, clearly badged "Namuna", and the student's own essay is echoed
// underneath for reference. Swapping in the real payload is a data change only.
import { computed, onMounted, ref } from 'vue'
import { NModal, NCard } from 'naive-ui'
import EssayAnalysisSection from '@/components/onatili/EssayAnalysisSection.vue'
import {
  sampleEssayAnalysis,
  sampleEssayBandTotal,
  sampleEssayText,
} from '@/data/onaTiliDemoAnalysis'

// Ready-made topics students can practise on straight away.
const PRESET_TOPICS = [
  'Kitob — bilim manbai',
  'Ona tilim — faxrim',
  "Texnologiya: do'stmi yoki dushman?",
  'Mehnat — baxt keltiradi',
]
const TOPIC_META = "250–300 so'z"

const CUSTOM_TOPICS_KEY = 'onatili-custom-topics-v1'

// ——— State ————————————————————————————————————————————————————————————
const view = ref('list') // 'list' | 'writer' | 'result'

const customTopics = ref([]) // { title, prompt }

const customModalOpen = ref(false)
const customTitle = ref('')
const customPrompt = ref('')

const activeTopic = ref('')
const activePrompt = ref('')
const mode = ref('upload') // 'upload' | 'write'
const essayText = ref('')
const uploads = ref([]) // { id, name, dataUrl }
const submitError = ref('')

// The submission that produced the current result view (kept for the reference
// echo under the analysis).
const submitted = ref(null)

// ——— Custom topics (persisted) ————————————————————————————————————————
const loadCustomTopics = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CUSTOM_TOPICS_KEY) || '[]')
    if (Array.isArray(raw)) {
      // v1 stored plain strings; v2 stores { title, prompt }. Migrate on read.
      customTopics.value = raw
        .map((item) =>
          typeof item === 'string'
            ? { title: item.trim(), prompt: '' }
            : { title: String(item?.title || '').trim(), prompt: String(item?.prompt || '') },
        )
        .filter((item) => item.title)
    }
  } catch {
    // Corrupt store — start empty.
    customTopics.value = []
  }
}
const persistCustomTopics = () => {
  try {
    localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(customTopics.value))
  } catch {
    // Storage unavailable (private mode / quota) — topics stay in-memory.
  }
}

onMounted(loadCustomTopics)

const openCustomModal = () => {
  customTitle.value = ''
  customPrompt.value = ''
  customModalOpen.value = true
}
const addCustom = () => {
  const title = customTitle.value.trim()
  if (!title) return
  // De-dupe against existing custom topics (case-insensitive).
  const exists = customTopics.value.some((item) => item.title.toLowerCase() === title.toLowerCase())
  if (!exists) {
    customTopics.value = [{ title, prompt: customPrompt.value.trim() }, ...customTopics.value]
    persistCustomTopics()
  }
  customModalOpen.value = false
}
const removeCustom = (title) => {
  customTopics.value = customTopics.value.filter((item) => item.title !== title)
  persistCustomTopics()
}

// Custom topics first (labelled SHAXSIY MAVZU), then the ready-made ones.
const topics = computed(() => [
  ...customTopics.value.map((topic) => ({
    title: topic.title,
    prompt: topic.prompt,
    tag: 'SHAXSIY MAVZU',
    meta: 'Siz qo‘shgansiz',
    custom: true,
  })),
  ...PRESET_TOPICS.map((title) => ({ title, prompt: '', tag: 'TAYYOR MAVZU', meta: TOPIC_META, custom: false })),
])

// ——— Writer ————————————————————————————————————————————————————————————
const startTopic = (topic) => {
  activeTopic.value = topic.title
  activePrompt.value = topic.prompt || ''
  mode.value = 'upload'
  essayText.value = ''
  uploads.value = []
  submitError.value = ''
  view.value = 'writer'
}
const backToList = () => {
  view.value = 'list'
}
const setMode = (next) => {
  mode.value = next
  submitError.value = ''
}

const wordCount = computed(() =>
  essayText.value.trim() ? essayText.value.trim().split(/\s+/).filter(Boolean).length : 0,
)
const showTextarea = computed(() => mode.value !== 'upload')
const textareaPlaceholder = 'Inshoingizni shu yerda yozing…'

// ——— Photo upload ——————————————————————————————————————————————————————
const fileInput = ref(null)
const isDragging = ref(false)
const openFilePicker = () => fileInput.value?.click()

const readFiles = (fileList) => {
  const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'))
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => {
      uploads.value = [
        ...uploads.value,
        { id: `${file.name}-${file.size}-${uploads.value.length}`, name: file.name, dataUrl: String(reader.result) },
      ]
    }
    reader.readAsDataURL(file)
  })
  submitError.value = ''
}
const onFileChange = (event) => {
  readFiles(event.target.files)
  event.target.value = '' // allow re-selecting the same file
}
const onDrop = (event) => {
  isDragging.value = false
  readFiles(event.dataTransfer?.files)
}
const removeUpload = (id) => {
  uploads.value = uploads.value.filter((upload) => upload.id !== id)
}

// ——— Submit ————————————————————————————————————————————————————————————
const canSubmit = computed(() =>
  mode.value === 'upload' ? uploads.value.length > 0 : essayText.value.trim().length > 0,
)
const submit = () => {
  if (!canSubmit.value) {
    submitError.value =
      mode.value === 'upload'
        ? 'Tekshirish uchun kamida bitta rasm yuklang.'
        : 'Tekshirish uchun avval inshoingizni kiriting.'
    return
  }
  submitted.value = {
    topic: activeTopic.value,
    mode: mode.value,
    essayText: mode.value === 'upload' ? '' : essayText.value.trim(),
    uploads: [...uploads.value],
  }
  view.value = 'result'
}
const writeAnother = () => {
  submitted.value = null
  view.value = 'list'
}

// Reference echo shown under the analysis.
const hasUserEssay = computed(
  () => Boolean(submitted.value?.essayText) || (submitted.value?.uploads?.length ?? 0) > 0,
)
</script>

<template>
  <div>
    <!-- ═══════════════ 1. Topic list ═══════════════ -->
    <template v-if="view === 'list'">
      <!-- Cards grid -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <!-- Add your own topic (dashed) — opens the modal -->
        <button
          type="button"
          @click="openCustomModal"
          class="group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[#c9c4b8] bg-white/50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#1a1814] hover:bg-white"
        >
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1814] text-white transition-transform duration-300 group-hover:scale-105">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <div>
            <p class="text-[15px] font-semibold text-[#1a1814]">O‘z mavzuingizni qo‘shing</p>
            <p class="mx-auto mt-1 max-w-[220px] text-[12.5px] leading-snug text-[#8a857c]">
              Internetdan topgan yoki o‘zingiz tuzgan mavzu bo‘yicha yozing
            </p>
          </div>
        </button>

        <!-- Topic cards -->
        <div
          v-for="topic in topics"
          :key="topic.tag + topic.title"
          class="group relative flex min-h-[200px] flex-col rounded-[24px] border border-[#e0ddd7] bg-white p-6 shadow-[0_10px_30px_rgba(26,24,20,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#d8d3ca] hover:shadow-[0_18px_44px_rgba(26,24,20,0.1)]"
        >
          <div class="mb-4 flex items-start justify-between">
            <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a1814] text-white shadow-[0_8px_20px_rgba(26,24,20,0.2)] transition-transform duration-300 group-hover:scale-105">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                <path d="M12 20h9" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <button
              v-if="topic.custom"
              type="button"
              @click="removeCustom(topic.title)"
              aria-label="O‘chirish"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0ddd7] text-[#a39e94] transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <h3 class="line-clamp-2 text-[16px] font-bold leading-snug tracking-[-0.01em] text-[#1a1814]">{{ topic.title }}</h3>

          <span
            class="font-mono-custom mt-2.5 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
            :class="topic.custom ? 'bg-[#1a1814] text-white' : 'border border-[#ebe8e0] bg-[#faf9f6] text-[#8a857c]'"
          >
            {{ topic.tag }}
          </span>

          <div class="mt-auto flex items-center justify-between pt-5">
            <span class="text-[12.5px] text-[#8a857c]">{{ topic.meta }}</span>
            <button
              type="button"
              @click="startTopic(topic)"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#1a1814] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-black active:scale-[0.98]"
            >
              Boshlash
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════ 2. Writer ═══════════════ -->
    <template v-else-if="view === 'writer'">
      <button
        type="button"
        @click="backToList"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8a857c] transition hover:text-[#1a1814]"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5m6-6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Mavzularga qaytish
      </button>

      <div class="rounded-[28px] border border-[#e0ddd7] bg-white/80 p-6 shadow-[0_10px_30px_rgba(26,24,20,0.06)] backdrop-blur-sm sm:p-8 lg:p-10">
        <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a39e94]">Insho mavzusi</p>
        <h2 class="mt-2.5 max-w-3xl text-2xl font-bold leading-snug tracking-[-0.01em] text-[#1a1814]">
          {{ activeTopic }}
        </h2>
        <p v-if="activePrompt" class="mt-3 max-w-3xl whitespace-pre-line text-[14px] leading-relaxed text-[#6b6760]">
          {{ activePrompt }}
        </p>

        <!-- Mode segmented control -->
        <div class="mt-7 inline-flex flex-wrap gap-1.5 rounded-full bg-[#ece8e0] p-1.5">
          <button
            v-for="m in [
              { id: 'upload', label: 'Rasm joylash' },
              { id: 'write', label: 'Yozish' },
            ]"
            :key="m.id"
            type="button"
            @click="setMode(m.id)"
            class="rounded-full px-4 py-2 text-[13px] font-semibold transition active:scale-[0.98]"
            :class="mode === m.id ? 'bg-[#1a1814] text-white shadow-[0_6px_16px_rgba(26,24,20,0.18)]' : 'text-[#6b6760] hover:text-[#1a1814]'"
          >
            {{ m.label }}
          </button>
        </div>

        <!-- Textarea (write / paste) -->
        <textarea
          v-if="showTextarea"
          v-model="essayText"
          :placeholder="textareaPlaceholder"
          class="mt-6 min-h-[340px] w-full resize-y rounded-[20px] border border-[#d8d3ca] bg-[#faf9f6] p-6 text-[15.5px] leading-[1.8] text-[#1a1814] outline-none transition focus:border-[#1a1814] focus:bg-white"
        ></textarea>

        <!-- Upload dropzone -->
        <div v-else class="mt-6">
          <div
            @click="openFilePicker"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            class="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed bg-[#faf9f6] px-6 py-10 text-center transition"
            :class="isDragging ? 'border-[#1a1814] bg-white' : 'border-[#c9c4b8] hover:border-[#1a1814] hover:bg-white'"
          >
            <span class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1814] text-white">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                <path d="M12 16V4m0 0-4 4m4-4 4 4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <p class="text-[15px] font-semibold text-[#1a1814]">Insho rasmini shu yerga tashlang</p>
            <p class="mt-1 text-[13px] text-[#8a857c]">yoki fayl tanlash uchun bosing · JPG, PNG</p>
          </div>
          <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />

          <!-- Thumbnails -->
          <div v-if="uploads.length" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div
              v-for="(upload, index) in uploads"
              :key="upload.id"
              class="group/thumb relative overflow-hidden rounded-[14px] border border-[#e0ddd7] bg-white"
            >
              <img :src="upload.dataUrl" :alt="upload.name" class="h-36 w-full object-cover" />
              <span class="font-mono-custom absolute left-2 top-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                {{ index + 1 }}-sahifa
              </span>
              <button
                type="button"
                @click.stop="removeUpload(upload.id)"
                aria-label="O‘chirish"
                class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white opacity-0 transition group-hover/thumb:opacity-100"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                  <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p v-if="submitError" class="mt-4 text-sm font-medium text-red-600">{{ submitError }}</p>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span v-if="showTextarea" class="text-[13.5px] text-[#8a857c]">
            <span class="font-semibold text-[#1a1814]">{{ wordCount }}</span> so‘z
          </span>
          <span v-else class="text-[13.5px] text-[#8a857c]">
            <span class="font-semibold text-[#1a1814]">{{ uploads.length }}</span> sahifa yuklandi
          </span>

          <button
            type="button"
            @click="submit"
            class="inline-flex items-center gap-2 rounded-full bg-[#1a1814] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(26,24,20,0.18)] transition hover:-translate-y-0.5 hover:bg-black active:scale-[0.98]"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Tekshirishga yuborish
          </button>
        </div>
      </div>
    </template>

    <!-- ═══════════════ 3. Result (AI analysis) ═══════════════ -->
    <template v-else>
      <div class="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a39e94]">Insho mavzusi</p>
          <h2 class="mt-1.5 max-w-2xl truncate text-xl font-bold tracking-[-0.01em] text-[#1a1814]">{{ submitted.topic }}</h2>
        </div>
        <button
          type="button"
          @click="writeAnother"
          class="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#1a1814] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#1a1814] backdrop-blur-sm transition hover:bg-[#1a1814] hover:text-white active:scale-[0.98]"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Yangi insho
        </button>
      </div>

      <EssayAnalysisSection
        :analysis="sampleEssayAnalysis"
        :essay-text="sampleEssayText"
        :band-total="sampleEssayBandTotal"
        sample
      >
        <!-- The student's own submission, echoed for reference. -->
        <details v-if="hasUserEssay" class="group mt-8 overflow-hidden rounded-[18px] bg-white ring-1 ring-[#eeeae2] shadow-[0_10px_30px_rgba(26,24,20,0.05)]">
          <summary class="flex cursor-pointer items-center justify-between px-5 py-4 text-[14px] font-semibold text-[#1a1814] transition hover:bg-[#faf8f4]">
            <span>Siz yuborgan insho</span>
            <svg class="h-4 w-4 text-[#8a857c] transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </summary>
          <div class="border-t border-[#f3f0ea] px-5 py-4">
            <p v-if="submitted.essayText" class="whitespace-pre-line text-[14px] leading-[1.8] text-[#3a362f]">{{ submitted.essayText }}</p>
            <div v-if="submitted.uploads.length" class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div v-for="(upload, index) in submitted.uploads" :key="upload.id" class="relative overflow-hidden rounded-[14px] border border-[#e0ddd7] bg-[#faf9f6]">
                <img :src="upload.dataUrl" :alt="upload.name" class="h-36 w-full object-cover" />
                <span class="font-mono-custom absolute left-2 top-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                  {{ index + 1 }}-sahifa
                </span>
              </div>
            </div>
          </div>
        </details>
      </EssayAnalysisSection>
    </template>
    <!-- ═══════════════ Add custom topic modal ═══════════════ -->
    <NModal v-model:show="customModalOpen">
      <div class="w-[calc(100vw-2rem)] max-w-lg">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-xl font-bold tracking-[-0.01em] text-[#1a1814]">Yangi insho mavzusi</h3>
                <p class="mt-1 text-sm leading-relaxed text-[#8a857c]">
                  Internetdan topgan yoki o‘zingiz tuzgan mavzu bo‘yicha insho yozib, tekshirtiring.
                </p>
              </div>
              <button
                type="button"
                @click="customModalOpen = false"
                aria-label="Yopish"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e0ddd7] text-[#8a857c] transition hover:border-[#1a1814] hover:text-[#1a1814]"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <div>
              <label class="font-mono-custom mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">
                Mavzu sarlavhasi
              </label>
              <input
                v-model="customTitle"
                @keyup.enter="addCustom"
                type="text"
                placeholder="Masalan: Kitob — bilim manbai"
                class="w-full rounded-2xl border border-[#d8d3ca] bg-[#faf9f6] px-4 py-3 text-[15px] text-[#1a1814] outline-none transition focus:border-[#1a1814] focus:bg-white"
              />
            </div>

            <div>
              <label class="font-mono-custom mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">
                Savol / ko‘rsatma <span class="normal-case tracking-normal text-[#bcb6a9]">(ixtiyoriy)</span>
              </label>
              <textarea
                v-model="customPrompt"
                rows="5"
                placeholder="Insho savoli yoki to‘liq ko‘rsatmani shu yerga yozing…"
                class="w-full resize-y rounded-2xl border border-[#d8d3ca] bg-[#faf9f6] p-4 text-[14.5px] leading-relaxed text-[#1a1814] outline-none transition focus:border-[#1a1814] focus:bg-white"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="customModalOpen = false"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full border border-[#1a1814] bg-white px-6 text-sm font-semibold text-[#1a1814] transition hover:bg-[#1a1814] hover:text-white active:scale-[0.98]"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                @click="addCustom"
                :disabled="!customTitle.trim()"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full bg-[#1a1814] px-6 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Qo‘shish
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>
  </div>
</template>
