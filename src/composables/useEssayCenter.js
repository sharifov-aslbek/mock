// The essay-checking flow, for the platform's Essay tekshirish screen.
//
// Same backend as the public Ona tili essay centre:
//   GET    /essay-topic                    the user's own topics + shared ones
//   POST   /essay-topic?text=              add one of your own
//   DELETE /essay-topic?topicId=           remove one of your own
//   POST   /essay-review/custom            grade a typed essay
//   POST   /essay-review/custom/images     OCR photographed pages, then grade
//   GET    /essay-submission               the OCR transcription, for highlights
//
// This is a separate implementation from components/onatili/OnaTiliEssayCenter.vue
// on purpose. That component runs the live, paid essay flow for students today
// and the brief puts the essay feature off limits, so it is left untouched
// rather than refactored into a shared composable. The endpoints, limits and
// error handling here mirror it deliberately; if the two ever disagree, that
// component is the authority.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiFetch, getTestApiBaseUrl, isNetworkError } from '@/utils/api'
import { ESSAY_BAND_MAX } from '@/utils/essayAnalysis'
import { saveEssayChecking } from '@/utils/essayCheckingStorage'

// Mirror the backend limits so obvious input problems never reach the API —
// its remaining 400 is then the insufficient-balance refusal.
export const MAX_TOPIC_LENGTH = 500
export const MAX_ESSAY_LENGTH = 5000
export const MAX_IMAGE_COUNT = 5
const MAX_IMAGE_SIZE_MB = 10
const MAX_TOTAL_SIZE_MB = 15
const IMAGE_EXTENSION_RE = /\.(jpe?g|png|webp)$/i
const TOPIC_META = "250–300 so'z"

export function useEssayCenter() {
  const router = useRouter()
  const authStore = useAuthStore()
  const apiBaseUrl = getTestApiBaseUrl()

  const authHeaders = () => ({
    accept: '*/*',
    Authorization: `Bearer ${authStore.token}`,
  })

  const view = ref('list') // 'list' | 'writer' | 'result'

  const topics = ref([])
  const topicsLoading = ref(false)
  const topicsError = ref('')
  const deletingTopicId = ref(null)
  const isSavingTopic = ref(false)

  const activeTopic = ref(null)
  const mode = ref('upload') // 'upload' | 'write'
  const essayText = ref('')
  const uploads = ref([])
  const submitError = ref('')
  const isReviewing = ref(false)
  const needsTopUp = ref(false)

  const review = ref(null)
  const submittedEssay = ref('')
  const submittedUploads = ref([])

  // ——— Topics ————————————————————————————————————————————————————————
  async function fetchTopics() {
    if (!authStore.isAuthenticated || !apiBaseUrl) return
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
      topicsError.value = isNetworkError(error)
        ? 'Internetda uzilish bor. Ulanishni tekshiring.'
        : 'Mavzularni yuklab bo‘lmadi. Sahifani yangilab ko‘ring.'
    } finally {
      topicsLoading.value = false
    }
  }

  // Own topics first — they are deletable and the student just added them.
  // `isPublic` is compared to false on purpose: a backend that stops sending
  // the flag degrades to "shared" (no delete) rather than offering deletes
  // that would 403.
  const displayTopics = computed(() => [
    ...topics.value
      .filter((topic) => topic.isPublic === false)
      .map((topic) => ({ ...topic, tag: 'SHAXSIY MAVZU', meta: 'Siz qo‘shgansiz', own: true })),
    ...topics.value
      .filter((topic) => topic.isPublic !== false)
      .map((topic) => ({ ...topic, tag: 'TAYYOR MAVZU', meta: TOPIC_META, own: false })),
  ])

  async function addTopic(text) {
    const value = String(text || '').trim()
    if (!value || isSavingTopic.value) return { ok: false, message: '' }
    if (value.length > MAX_TOPIC_LENGTH) {
      return { ok: false, message: `Mavzu ${MAX_TOPIC_LENGTH} belgidan oshmasligi kerak.` }
    }

    isSavingTopic.value = true
    try {
      const response = await apiFetch(
        `${apiBaseUrl}/essay-topic?text=${encodeURIComponent(value)}`,
        { method: 'POST', headers: authHeaders() },
      )
      const payload = await response.json().catch(() => null)
      if (!response.ok || payload?.code !== 200) {
        throw new Error(payload?.message || `HTTP ${response.status}`)
      }
      await fetchTopics()
      return { ok: true, message: '' }
    } catch (error) {
      console.error(error)
      return { ok: false, message: error?.message || 'Mavzuni saqlab bo‘lmadi.' }
    } finally {
      isSavingTopic.value = false
    }
  }

  async function removeTopic(topic) {
    if (deletingTopicId.value) return
    deletingTopicId.value = topic.id
    try {
      const response = await apiFetch(
        `${apiBaseUrl}/essay-topic?topicId=${encodeURIComponent(topic.id)}`,
        { method: 'DELETE', headers: authHeaders() },
      )
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

  // ——— Writer ————————————————————————————————————————————————————————
  function startTopic(topic) {
    activeTopic.value = { id: topic.id, text: topic.text }
    mode.value = 'upload'
    essayText.value = ''
    uploads.value = []
    submitError.value = ''
    review.value = null
    view.value = 'writer'
  }

  function backToList() {
    view.value = 'list'
  }

  function addFiles(fileList) {
    submitError.value = ''
    for (const file of Array.from(fileList || [])) {
      if (uploads.value.length >= MAX_IMAGE_COUNT) {
        submitError.value = `Ko‘pi bilan ${MAX_IMAGE_COUNT} ta rasm yuklash mumkin.`
        break
      }
      if (!file.type.startsWith('image/') || !IMAGE_EXTENSION_RE.test(file.name)) {
        submitError.value = 'Faqat JPG, PNG yoki WEBP rasmlar qabul qilinadi.'
        continue
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        submitError.value = `Har bir rasm ${MAX_IMAGE_SIZE_MB}MB dan oshmasligi kerak.`
        continue
      }
      const id = `${file.name}-${file.size}-${Date.now()}-${uploads.value.length}`
      const reader = new FileReader()
      reader.onload = () => {
        uploads.value = [...uploads.value, { id, name: file.name, file, dataUrl: String(reader.result) }]
      }
      reader.readAsDataURL(file)
    }
  }

  const removeUpload = (id) => {
    uploads.value = uploads.value.filter((upload) => upload.id !== id)
  }

  // The image flow's response carries no transcription — pull it from the
  // submission history so the highlights have text to anchor into.
  async function fetchSubmissionText(submissionId) {
    try {
      const response = await apiFetch(`${apiBaseUrl}/essay-submission`, { headers: authHeaders() })
      const payload = await response.json()
      if (!response.ok || payload?.code !== 200 || !Array.isArray(payload.data)) return ''
      const submission = payload.data.find((item) => Number(item?.id) === Number(submissionId))
      return typeof submission?.essayText === 'string' ? submission.essayText : ''
    } catch (error) {
      console.error(error)
      return ''
    }
  }

  // ——— Result shape (same handling as ExplanationPage) ————————————————
  // The backend passes the grading JSON through as `evaluationJson`, a string.
  // Parse it back to the object EssayAnalysisSection expects, falling back to
  // the flattened columns so the header still renders if it is unparseable.
  const reviewAnalysis = computed(() => {
    const current = review.value
    if (!current) return null

    const raw = current.evaluationJson
    let parsed = null
    if (typeof raw === 'string' && raw.trim()) {
      try {
        parsed = JSON.parse(raw)
      } catch {
        // Malformed — drop to the flattened fallback below.
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

  async function submit() {
    if (isReviewing.value || !activeTopic.value) return

    const isUpload = mode.value === 'upload'
    const text = essayText.value.trim()

    if (isUpload) {
      if (!uploads.value.length) {
        submitError.value = 'Tekshirish uchun kamida bitta rasm yuklang.'
        return
      }
      const totalSize = uploads.value.reduce((sum, upload) => sum + upload.file.size, 0)
      if (totalSize > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
        submitError.value = `Rasmlarning umumiy hajmi ${MAX_TOTAL_SIZE_MB}MB dan oshmasligi kerak.`
        return
      }
    } else {
      if (!text) {
        submitError.value = 'Tekshirish uchun avval inshoingizni kiriting.'
        return
      }
      if (text.length > MAX_ESSAY_LENGTH) {
        submitError.value = `Insho ${MAX_ESSAY_LENGTH} belgidan oshmasligi kerak.`
        return
      }
    }

    submitError.value = ''
    isReviewing.value = true
    try {
      let response
      if (isUpload) {
        const formData = new FormData()
        uploads.value.forEach((upload) => formData.append('images', upload.file, upload.name))
        // No Content-Type header — the browser sets the multipart boundary.
        response = await apiFetch(
          `${apiBaseUrl}/essay-review/custom/images?topicId=${encodeURIComponent(activeTopic.value.id)}`,
          { method: 'POST', headers: authHeaders(), body: formData },
        )
      } else {
        const query = `topicId=${encodeURIComponent(activeTopic.value.id)}&essay=${encodeURIComponent(text)}`
        response = await apiFetch(`${apiBaseUrl}/essay-review/custom?${query}`, {
          method: 'POST',
          headers: authHeaders(),
        })
      }
      const payload = await response.json().catch(() => null)

      if (response.status === 400) {
        // Input problems are validated above, so a bare 400 is the
        // insufficient-balance refusal — but the images endpoint also 400s on
        // bad files, so surface those messages instead of the top-up prompt.
        const message = String(payload?.message || '')
        if (!message || /balance/i.test(message)) needsTopUp.value = true
        else submitError.value = message
        return
      }
      if (!response.ok || payload?.code !== 200 || !payload?.data) {
        throw new Error(payload?.message || `HTTP ${response.status}`)
      }

      review.value = payload.data
      submittedEssay.value = isUpload
        ? await fetchSubmissionText(payload.data.essaySubmissionId)
        : text
      submittedUploads.value = isUpload ? [...uploads.value] : []

      // Persist so it lists on Natijalar the way finished mocks do. Only
      // serializable fields: the File objects go, their data URLs stay.
      saveEssayChecking({
        topic: activeTopic.value?.text || '',
        mode: mode.value,
        essayText: submittedEssay.value,
        uploads: submittedUploads.value.map((upload) => ({
          id: upload.id,
          name: upload.name,
          dataUrl: upload.dataUrl,
        })),
        analysis: reviewAnalysis.value,
        analyzedText: submittedEssay.value,
        bandTotal: reviewBandTotal.value,
        bandMax: ESSAY_BAND_MAX,
        sample: false,
      })

      view.value = 'result'
    } catch (error) {
      console.error(error)
      submitError.value = isNetworkError(error)
        ? 'Internetda uzilish bor. Ulanishni tekshiring va qayta yuboring.'
        : 'Tekshirishda xatolik yuz berdi. Qayta urinib ko‘ring.'
    } finally {
      isReviewing.value = false
    }
  }

  function writeAnother() {
    review.value = null
    submittedEssay.value = ''
    submittedUploads.value = []
    view.value = 'list'
  }

  const goToTopUp = async () => {
    needsTopUp.value = false
    // Signed-in flow, so straight to the platform's own pricing screen.
    await router.push('/tanga')
  }

  const wordCount = computed(() =>
    essayText.value.trim() ? essayText.value.trim().split(/\s+/).filter(Boolean).length : 0,
  )

  return {
    view,
    topics,
    displayTopics,
    topicsLoading,
    topicsError,
    deletingTopicId,
    isSavingTopic,
    fetchTopics,
    addTopic,
    removeTopic,
    activeTopic,
    mode,
    essayText,
    wordCount,
    uploads,
    addFiles,
    removeUpload,
    submitError,
    isReviewing,
    needsTopUp,
    submit,
    startTopic,
    backToList,
    writeAnother,
    goToTopUp,
    submittedEssay,
    submittedUploads,
    reviewAnalysis,
    reviewBandTotal,
  }
}
