<script setup>
// "Insho tekshirish" tab of the Ona tili page.
//
// Topics come from the backend (GET /essay-topic): the user's own topics plus
// the shared public ones. Adding a topic POSTs /essay-topic, deleting one's
// own topic DELETEs it. The essay itself is text-only (photo transcription
// needs a live test attempt, which this standalone flow doesn't have) and is
// graded via POST /essay-review/custom — the same AI pipeline the real /test
// essays use — then rendered through EssayAnalysisSection. The first reviews
// are free; once they're spent the endpoint replies 400 when the balance
// can't cover a paid one, and the top-up modal points at /pricing.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NModal, NCard } from 'naive-ui'
import EssayAnalysisSection from '@/components/onatili/EssayAnalysisSection.vue'
import EssayProcessingOverlay from '@/components/test/EssayProcessingOverlay.vue'
import { useAuthStore } from '@/stores/auth'
import { apiFetch, getTestApiBaseUrl } from '@/utils/api'

const TOPIC_META = "250–300 so'z"
// Mirror the backend limits so obvious input problems never reach the API
// (its remaining 400 is then the insufficient-balance refusal).
const MAX_TOPIC_LENGTH = 500
const MAX_ESSAY_LENGTH = 5000

const router = useRouter()
const authStore = useAuthStore()
const apiBaseUrl = getTestApiBaseUrl()

const authHeaders = () => ({
  accept: '*/*',
  Authorization: `Bearer ${authStore.token}`,
})

// ——— State ————————————————————————————————————————————————————————————
const view = ref('list') // 'list' | 'writer' | 'result'

const topics = ref([]) // { id, text, isPublic }
const topicsLoading = ref(false)
const topicsError = ref('')

const customModalOpen = ref(false)
const customText = ref('')
const customError = ref('')
const isSavingTopic = ref(false)
const deletingTopicId = ref(null)

const activeTopic = ref(null) // { id, text }
const essayText = ref('')
const submitError = ref('')
const isReviewing = ref(false)
const balanceModalOpen = ref(false)

// The review that produced the result view, plus the essay it graded (the
// analysis locates its quotes inside this text).
const review = ref(null)
const submittedEssay = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)
const loginLocation = { path: '/login', query: { redirect: '/ona-tili?tab=essay' } }

// ——— Topics (GET /essay-topic) ————————————————————————————————————————
const fetchTopics = async () => {
  if (!isAuthenticated.value || !apiBaseUrl) {
    return
  }
  topicsLoading.value = true
  topicsError.value = ''
  try {
    const response = await apiFetch(`${apiBaseUrl}/essay-topic`, { headers: authHeaders() })
    const payload = await response.json()
    if (!response.ok || payload?.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error(payload?.message || `HTTP ${response.status}`)
    }
    topics.value = payload.data
  } catch (error) {
    console.error(error)
    topicsError.value = 'Mavzularni yuklab bo‘lmadi. Sahifani yangilab ko‘ring.'
  } finally {
    topicsLoading.value = false
  }
}

onMounted(fetchTopics)

// The user's own topics first (deletable, SHAXSIY MAVZU), then the shared
// ones. `isPublic` is compared to `false` on purpose: a backend that doesn't
// send the flag yet degrades to "shared" (no delete button) instead of
// offering deletes that would 403.
const displayTopics = computed(() => [
  ...topics.value
    .filter((topic) => topic.isPublic === false)
    .map((topic) => ({ ...topic, tag: 'SHAXSIY MAVZU', meta: 'Siz qo‘shgansiz', custom: true })),
  ...topics.value
    .filter((topic) => topic.isPublic !== false)
    .map((topic) => ({ ...topic, tag: 'TAYYOR MAVZU', meta: TOPIC_META, custom: false })),
])

// ——— Add / delete a custom topic ——————————————————————————————————————
const openCustomModal = () => {
  customText.value = ''
  customError.value = ''
  customModalOpen.value = true
}

const addCustom = async () => {
  const text = customText.value.trim()
  if (!text || isSavingTopic.value) return
  if (text.length > MAX_TOPIC_LENGTH) {
    customError.value = `Mavzu ${MAX_TOPIC_LENGTH} belgidan oshmasligi kerak.`
    return
  }

  isSavingTopic.value = true
  customError.value = ''
  try {
    const response = await apiFetch(`${apiBaseUrl}/essay-topic?text=${encodeURIComponent(text)}`, {
      method: 'POST',
      headers: authHeaders(),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || payload?.code !== 200) {
      throw new Error(payload?.message || `HTTP ${response.status}`)
    }
    customModalOpen.value = false
    await fetchTopics()
  } catch (error) {
    console.error(error)
    customError.value = error?.message || 'Mavzuni saqlab bo‘lmadi. Qayta urinib ko‘ring.'
  } finally {
    isSavingTopic.value = false
  }
}

const removeCustom = async (topic) => {
  if (deletingTopicId.value) return
  deletingTopicId.value = topic.id
  try {
    const response = await apiFetch(`${apiBaseUrl}/essay-topic?topicId=${encodeURIComponent(topic.id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || payload?.code !== 200) {
      throw new Error(payload?.message || `HTTP ${response.status}`)
    }
    topics.value = topics.value.filter((item) => item.id !== topic.id)
  } catch (error) {
    console.error(error)
    topicsError.value = 'Mavzuni o‘chirib bo‘lmadi. Qayta urinib ko‘ring.'
  } finally {
    deletingTopicId.value = null
  }
}

// ——— Writer ————————————————————————————————————————————————————————————
const startTopic = (topic) => {
  activeTopic.value = { id: topic.id, text: topic.text }
  essayText.value = ''
  submitError.value = ''
  view.value = 'writer'
}
const backToList = () => {
  view.value = 'list'
}

const wordCount = computed(() =>
  essayText.value.trim() ? essayText.value.trim().split(/\s+/).filter(Boolean).length : 0,
)
const charCount = computed(() => essayText.value.length)
const textareaPlaceholder = 'Inshoingizni shu yerda yozing…'

// ——— Submit (POST /essay-review/custom) ————————————————————————————————
const submit = async () => {
  if (isReviewing.value) return

  const text = essayText.value.trim()
  if (!text) {
    submitError.value = 'Tekshirish uchun avval inshoingizni kiriting.'
    return
  }
  if (text.length > MAX_ESSAY_LENGTH) {
    submitError.value = `Insho ${MAX_ESSAY_LENGTH} belgidan oshmasligi kerak.`
    return
  }

  submitError.value = ''
  isReviewing.value = true
  try {
    const query = `topicId=${encodeURIComponent(activeTopic.value.id)}&essay=${encodeURIComponent(text)}`
    const response = await apiFetch(`${apiBaseUrl}/essay-review/custom?${query}`, {
      method: 'POST',
      headers: authHeaders(),
    })
    const payload = await response.json().catch(() => null)

    // Empty/too-long essays are caught above, so a 400 here is the endpoint's
    // insufficient-balance refusal: the free reviews are spent.
    if (response.status === 400) {
      balanceModalOpen.value = true
      return
    }
    if (!response.ok || payload?.code !== 200 || !payload?.data) {
      throw new Error(payload?.message || `HTTP ${response.status}`)
    }

    review.value = payload.data
    submittedEssay.value = text
    view.value = 'result'
  } catch (error) {
    console.error(error)
    submitError.value = 'Tekshirishda xatolik yuz berdi. Qayta urinib ko‘ring.'
  } finally {
    isReviewing.value = false
  }
}

const goToPricing = () => {
  balanceModalOpen.value = false
  router.push('/pricing')
}

const writeAnother = () => {
  review.value = null
  submittedEssay.value = ''
  view.value = 'list'
}

// ——— Result (same evaluationJson handling as ExplanationPage) ——————————
// The backend passes Gemini's grading JSON through as `evaluationJson` (a
// string) — parse it back to the object EssayAnalysisSection expects, falling
// back to the flattened columns so the header still renders if the raw JSON
// is ever missing or unparseable.
const reviewAnalysis = computed(() => {
  const current = review.value
  if (!current) {
    return null
  }

  const raw = current.evaluationJson
  let parsed = null
  if (typeof raw === 'string' && raw.trim()) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Malformed JSON — drop to the flattened fallback below.
    }
  } else if (raw && typeof raw === 'object') {
    parsed = raw
  }

  if (parsed && typeof parsed === 'object') {
    if (!parsed.global_notes && current.globalNotes) {
      return { ...parsed, global_notes: current.globalNotes }
    }
    return parsed
  }

  return {
    on_topic: current.onTopic !== false,
    copied_suspected: current.copiedSuspected === true,
    global_notes: current.globalNotes || '',
  }
})

const reviewBandTotal = computed(() => {
  const total = Number(review.value?.totalScore)
  return Number.isFinite(total) ? total : null
})

const SKELETON_COUNT = 6
</script>

<template>
  <div>
    <!-- ═══════════════ 1. Topic list ═══════════════ -->
    <template v-if="view === 'list'">
      <!-- Login gate: every essay-centre endpoint needs a session. -->
      <div
        v-if="!isAuthenticated"
        class="rounded-[28px] border border-dashed border-[#d8d3ca] bg-white/70 px-6 py-16 text-center shadow-[0_10px_30px_rgba(26,24,20,0.05)] backdrop-blur-sm"
      >
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] text-[#8a857c]">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" />
          </svg>
        </div>
        <p class="font-medium text-[#1a1814]">Insho tekshirish uchun avval tizimga kiring</p>
        <RouterLink
          :to="loginLocation"
          class="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1a1814] px-7 py-3 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]"
        >
          Kirish
        </RouterLink>
      </div>

      <template v-else>
        <!-- Non-fatal error banner (delete failed / refetch failed over stale list) -->
        <div
          v-if="topicsError && displayTopics.length"
          class="mb-4 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm font-medium text-red-600"
        >
          {{ topicsError }}
        </div>

        <!-- Skeletons -->
        <div v-if="topicsLoading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="n in SKELETON_COUNT"
            :key="`topic-skeleton-${n}`"
            class="flex min-h-[200px] animate-pulse flex-col rounded-[24px] border border-[#e0ddd7] bg-white/60 p-6"
          >
            <div class="mb-4 h-11 w-11 rounded-2xl bg-[#ece8e1]"></div>
            <div class="mb-2 h-5 w-3/4 rounded-lg bg-[#ece8e1]"></div>
            <div class="h-5 w-24 rounded-full bg-[#ece8e1]"></div>
            <div class="mt-auto h-10 w-28 self-end rounded-full bg-[#ece8e1]"></div>
          </div>
        </div>

        <!-- Fatal error (nothing to show) -->
        <div
          v-else-if="topicsError && !displayTopics.length"
          class="rounded-[28px] border border-dashed border-red-200 bg-red-50/80 px-6 py-16 text-center shadow-sm backdrop-blur-sm"
        >
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-500">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 9v4m0 4h.01M10.3 3.86l-8.5 14.7A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.73-3L13.7 3.86a2 2 0 0 0-3.4 0Z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="mb-5 font-medium text-red-600">{{ topicsError }}</p>
          <button
            type="button"
            @click="fetchTopics"
            class="inline-flex items-center gap-2 rounded-full bg-[#1a1814] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]"
          >
            Qayta urinish
          </button>
        </div>

        <!-- Cards grid -->
        <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            v-for="topic in displayTopics"
            :key="topic.id"
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
                @click="removeCustom(topic)"
                :disabled="deletingTopicId === topic.id"
                aria-label="O‘chirish"
                class="flex h-8 w-8 items-center justify-center rounded-full border border-[#e0ddd7] text-[#a39e94] transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <h3 class="line-clamp-3 text-[16px] font-bold leading-snug tracking-[-0.01em] text-[#1a1814]" :title="topic.text">
              {{ topic.text }}
            </h3>

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
        <h2 class="mt-2.5 max-w-3xl whitespace-pre-line text-2xl font-bold leading-snug tracking-[-0.01em] text-[#1a1814]">
          {{ activeTopic?.text }}
        </h2>

        <textarea
          v-model="essayText"
          :placeholder="textareaPlaceholder"
          class="mt-6 min-h-[340px] w-full resize-y rounded-[20px] border border-[#d8d3ca] bg-[#faf9f6] p-6 text-[15.5px] leading-[1.8] text-[#1a1814] outline-none transition focus:border-[#1a1814] focus:bg-white"
        ></textarea>

        <p v-if="submitError" class="mt-4 text-sm font-medium text-red-600">{{ submitError }}</p>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span class="text-[13.5px] text-[#8a857c]">
            <span class="font-semibold text-[#1a1814]">{{ wordCount }}</span> so‘z
            <template v-if="charCount > MAX_ESSAY_LENGTH * 0.9">
              · <span :class="charCount > MAX_ESSAY_LENGTH ? 'font-semibold text-red-600' : ''">{{ charCount }}/{{ MAX_ESSAY_LENGTH }} belgi</span>
            </template>
          </span>

          <button
            type="button"
            @click="submit"
            :disabled="isReviewing"
            class="inline-flex items-center gap-2 rounded-full bg-[#1a1814] px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(26,24,20,0.18)] transition hover:-translate-y-0.5 hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
          <h2 class="mt-1.5 max-w-2xl truncate text-xl font-bold tracking-[-0.01em] text-[#1a1814]">{{ activeTopic?.text }}</h2>
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
        v-if="reviewAnalysis"
        :analysis="reviewAnalysis"
        :essay-text="submittedEssay"
        :band-total="reviewBandTotal"
      />
    </template>

    <!-- ═══════════════ AI-checking takeover ═══════════════ -->
    <EssayProcessingOverlay v-if="isReviewing" mode="checking" />

    <!-- ═══════════════ Insufficient balance ═══════════════ -->
    <NModal v-model:show="balanceModalOpen">
      <div class="w-[calc(100vw-2rem)] max-w-md">
        <NCard :bordered="false" size="large" class="!rounded-[28px]">
          <div class="space-y-6 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] text-[#1a1814]">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M9.5 9.5h3.25a1.75 1.75 0 0 1 0 3.5H11a1.75 1.75 0 0 0 0 3.5h3.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <h4 class="text-xl font-bold tracking-tight text-black">Bepul tekshiruvlar tugadi</h4>
              <p class="mt-2 text-sm leading-6 text-gray-500">
                Sizning <span class="font-semibold text-black">2 ta bepul</span> insho tekshiruvingiz tugadi.
                Davom etish uchun hisobingizni to‘ldiring.
              </p>
            </div>

            <div class="space-y-3">
              <button
                type="button"
                @click="goToPricing"
                class="inline-flex h-12 w-full items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
              >
                Hisobni to‘ldirish
              </button>
              <button
                type="button"
                class="text-sm font-medium text-gray-400 transition hover:text-black"
                @click="balanceModalOpen = false"
              >
                Yopish
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>

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
                Mavzu matni
              </label>
              <textarea
                v-model="customText"
                rows="4"
                :maxlength="MAX_TOPIC_LENGTH"
                placeholder="Masalan: Kitob — bilim manbai"
                class="w-full resize-y rounded-2xl border border-[#d8d3ca] bg-[#faf9f6] p-4 text-[14.5px] leading-relaxed text-[#1a1814] outline-none transition focus:border-[#1a1814] focus:bg-white"
              ></textarea>
              <p class="mt-1.5 text-right text-[12px] text-[#bcb6a9]">{{ customText.length }}/{{ MAX_TOPIC_LENGTH }}</p>
            </div>

            <p v-if="customError" class="text-sm font-medium text-red-600">{{ customError }}</p>

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
                :disabled="!customText.trim() || isSavingTopic"
                class="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-full bg-[#1a1814] px-6 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {{ isSavingTopic ? 'Saqlanmoqda…' : 'Qo‘shish' }}
              </button>
            </div>
          </div>
        </NCard>
      </div>
    </NModal>
  </div>
</template>
