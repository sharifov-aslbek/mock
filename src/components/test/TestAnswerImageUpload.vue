<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

// The answer box for an AI-reviewed open-response question (Biology 41–43):
// there is no typed input — photo(s) of the handwritten solution and drawings
// ARE the answer. The parent collects them and pushes the whole set to
// POST /user-answer/images, which REPLACES whatever that question had stored.
//
// Generalized from the Biology demo's BiologyDrawingUpload so the live /test
// page can use it for any subject, with every string coming from i18n.
const props = defineProps({
  questionId: { type: [Number, String], required: true },
  uploads: { type: Array, default: () => [] },
  // Images already stored against this question server-side (a resumed attempt).
  // Shown read-only: uploading anything new replaces the whole set.
  remoteImageUrls: { type: Array, default: () => [] },
})

const emit = defineEmits(['update-uploads'])

const { t } = useI18n()

const MAX_IMAGES = 6
// Raw upload cap — phone photos routinely hit 8–12 MB; compressImage() shrinks
// whatever lands here before we hold on to it.
const MAX_FILE_MB = 25
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024
// Downscale target (longest edge, px) + JPEG quality for the in-browser re-encode.
const MAX_IMAGE_EDGE = 2000
const JPEG_QUALITY = 0.82

const uploadError = ref('')
const isDragging = ref(false)
const fileInput = ref(null)
const cameraInput = ref(null)
let uploadSeq = 0

// Downscale so the longest edge is <= MAX_IMAGE_EDGE and re-encode as JPEG.
// This turns multi-megabyte phone photos into a few hundred KB and converts iOS
// HEIC to a format every backend can read (Safari decodes HEIC into the <img>,
// the canvas re-exports it).
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

const addFiles = async (fileList) => {
  uploadError.value = ''
  const files = [...(fileList || [])]
  if (!files.length) return

  for (const file of files) {
    // Accept anything the browser tags as an image, plus HEIC/HEIF by extension
    // (iOS sometimes reports an empty type for camera captures).
    const looksImage =
      file.type.startsWith('image/') || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name || '')

    if (!looksImage) {
      uploadError.value = t('testPage.aiReview.errorOnlyImages')
      continue
    }

    if (props.uploads.length >= MAX_IMAGES) {
      uploadError.value = t('testPage.aiReview.errorMaxImages', { max: MAX_IMAGES })
      break
    }

    if (file.size > MAX_FILE_BYTES) {
      uploadError.value = t('testPage.aiReview.errorTooLarge', {
        name: file.name || t('testPage.aiReview.fileFallbackName'),
        mb: MAX_FILE_MB,
      })
      continue
    }

    try {
      const dataUrl = await compressImage(file)
      const id = `answer-image-${++uploadSeq}-${file.lastModified || file.size}`
      emit('update-uploads', props.questionId, [
        ...props.uploads,
        { id, name: file.name || t('testPage.aiReview.fileFallbackName'), dataUrl },
      ])
    } catch {
      uploadError.value = t('testPage.aiReview.errorDecodeFailed', {
        name: file.name || t('testPage.aiReview.fileFallbackName'),
      })
    }
  }
}

const onFilesPicked = (event) => {
  const input = event.target
  const files = [...(input.files || [])]
  input.value = '' // reset so the same photo can be re-picked later
  void addFiles(files)
}

const onDrop = (event) => {
  isDragging.value = false
  void addFiles(event.dataTransfer?.files)
}

const removeUpload = (id) => {
  uploadError.value = ''
  emit(
    'update-uploads',
    props.questionId,
    props.uploads.filter((upload) => upload.id !== id),
  )
}
</script>

<template>
  <div class="space-y-2.5 sm:space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <label class="font-mono-custom block text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
        {{ t('testPage.aiReview.imagesLabel') }}
      </label>
      <span class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.14em] text-[#8a857c] sm:text-[11px]">
        {{ uploads.length }} / {{ MAX_IMAGES }}
      </span>
    </div>

    <!-- A resumed attempt already has images stored for this question. They stay
         read-only here; picking new photos replaces the whole set server-side. -->
    <div
      v-if="remoteImageUrls.length && !uploads.length"
      class="space-y-2.5 rounded-2xl border border-[#e0ddd7] bg-[#faf8f4] p-3 sm:p-3.5"
    >
      <p class="font-mono-custom text-[10px] font-normal uppercase tracking-[0.16em] text-[#8a857c] sm:text-[11px]">
        {{ t('testPage.aiReview.uploaded') }}
      </p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          v-for="(imageUrl, index) in remoteImageUrls"
          :key="imageUrl"
          class="relative overflow-hidden rounded-[18px] border border-[#e0ddd7] bg-white"
        >
          <img :src="imageUrl" :alt="t('testPage.aiReview.imageBadge', { n: index + 1 })" class="h-40 w-full object-cover" />
          <span class="font-mono-custom absolute left-2 top-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
            {{ t('testPage.aiReview.imageBadge', { n: index + 1 }) }}
          </span>
        </div>
      </div>
      <p class="text-[12px] leading-snug text-[#8a857c] sm:text-[13px]">
        {{ t('testPage.aiReview.replaceHint') }}
      </p>
    </div>

    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      class="rounded-2xl border-2 border-dashed bg-white p-6 text-center transition-all duration-150 sm:p-7"
      :class="isDragging ? 'border-[#1a1814] bg-[#faf8f4]' : 'border-[#e0ddd7]'"
    >
      <div class="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#e0ddd7] bg-[#faf8f4] text-[#8a857c]">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9" r="1.3" />
          <path d="m3 15 5-4 4 3 3-2 6 5" />
        </svg>
      </div>

      <p class="text-[14px] font-medium text-[#1a1814] sm:text-[15px]">
        {{ t('testPage.aiReview.dropTitle') }}
      </p>

      <div class="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
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
          {{ t('testPage.aiReview.takePhoto') }}
        </button>
        <button
          type="button"
          @click="fileInput?.click()"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d1cec7] bg-white px-6 text-sm font-semibold text-[#1a1814] transition duration-200 hover:border-black active:scale-[0.98]"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 16V4m0 0 4 4m-4-4-4 4" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          {{ t('testPage.aiReview.pickPhoto') }}
        </button>
      </div>

      <p class="font-mono-custom mt-3.5 text-[10px] font-normal uppercase tracking-[0.14em] text-[#9b958c]">
        {{ t('testPage.aiReview.dropHint', { max: MAX_IMAGES }) }}
      </p>

      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onFilesPicked" />
      <input ref="cameraInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onFilesPicked" />
    </div>

    <p v-if="uploadError" class="text-[13.5px] font-medium text-red-600">{{ uploadError }}</p>

    <div v-if="uploads.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div
        v-for="(upload, index) in uploads"
        :key="upload.id"
        class="group relative overflow-hidden rounded-[18px] border border-[#e0ddd7] bg-[#faf8f4]"
      >
        <img :src="upload.dataUrl" :alt="upload.name" class="h-40 w-full object-cover" />
        <span class="font-mono-custom absolute left-2 top-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
          {{ t('testPage.aiReview.imageBadge', { n: index + 1 }) }}
        </span>
        <button
          type="button"
          @click="removeUpload(upload.id)"
          class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#e0ddd7] bg-white text-[#6b6760] shadow-[0_2px_8px_rgba(15,23,42,0.12)] transition hover:border-black hover:text-black"
          :aria-label="t('testPage.aiReview.removeImage')"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <button
        v-if="uploads.length < MAX_IMAGES"
        type="button"
        @click="fileInput?.click()"
        class="flex h-40 flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[#e0ddd7] bg-white text-[#8a857c] transition hover:border-[#1a1814] hover:text-[#1a1814]"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span class="text-[13px] font-medium">{{ t('testPage.aiReview.addImage') }}</span>
      </button>
    </div>
  </div>
</template>
