<script setup>
// Saved essay-checking analysis (opened from the Natijalar page → Insholar tab).
// Loads one persisted checking by :id and renders it with the same
// EssayAnalysisSection the live essay result and the demo page use, plus the
// student's own submission (text / photographed pages) echoed underneath.
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EssayAnalysisSection from '@/components/onatili/EssayAnalysisSection.vue'
import { getEssayChecking } from '@/utils/essayCheckingStorage'

const route = useRoute()
const router = useRouter()

const entry = ref(getEssayChecking(route.params.id))

const hasEntry = computed(() => Boolean(entry.value))
const hasUserEssay = computed(
  () => Boolean(entry.value?.essayText) || (entry.value?.uploads?.length ?? 0) > 0,
)

const UZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
]
const formattedDate = computed(() => {
  if (!entry.value?.savedAt) return ''
  const date = new Date(entry.value.savedAt)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}, ${date.getFullYear()}`
})

const goBack = () => router.push('/result-exam?view=essays')
</script>

<template>
  <main class="relative min-h-screen w-full overflow-hidden bg-[#f5f3ef] font-sans-custom">
    <!-- Ambient background — matches the analysis/result pages -->
    <div class="math-dots pointer-events-none absolute inset-0 -z-20"></div>
    <div class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#f5f3ef]/30 via-[#f5f3ef]/70 to-[#f5f3ef]"></div>
    <div class="math-blob pointer-events-none absolute -left-20 top-10 -z-10 h-[360px] w-[360px] rounded-full bg-[#e6e1d7]/50 blur-3xl"></div>
    <div class="math-blob pointer-events-none absolute -right-24 top-40 -z-10 h-[320px] w-[320px] rounded-full bg-[#ebe7e0]/60 blur-3xl"></div>
    <div class="math-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

    <div class="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <!-- Breadcrumb -->
      <div class="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <div class="flex items-center gap-1.5 text-xs text-[#a39e94]">
          <RouterLink to="/" class="cursor-pointer transition-colors hover:text-[#8a857c]">Bosh sahifa</RouterLink>
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <RouterLink to="/result-exam?view=essays" class="cursor-pointer transition-colors hover:text-[#8a857c]">Natijalar</RouterLink>
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-[#6b6760]">Insho tahlili</span>
        </div>
      </div>

      <!-- ═══ Not found (bad / cleared id) ═══ -->
      <div
        v-if="!hasEntry"
        class="rounded-[28px] border border-dashed border-[#d8d3ca] bg-white/70 px-6 py-16 text-center shadow-[0_10px_30px_rgba(26,24,20,0.05)] backdrop-blur-sm"
      >
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] text-[#8a857c]">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 12h6m-6 4h6M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="font-medium text-[#8a857c]">Bu insho tahlili topilmadi.</p>
        <button
          type="button"
          @click="goBack"
          class="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#1a1814] px-7 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.98]"
        >
          Natijalarga qaytish
        </button>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <button
              type="button"
              @click="goBack"
              class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#8a857c] transition hover:text-[#1a1814]"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5m6-6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Natijalarga qaytish
            </button>
            <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a39e94]">Insho mavzusi</p>
            <h1 class="mt-1.5 max-w-2xl text-[clamp(20px,4vw,28px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#1a1814]">
              {{ entry.topic }}
            </h1>
            <p v-if="formattedDate" class="mt-1.5 text-sm text-[#a39e94]">Tekshirilgan: {{ formattedDate }}</p>
          </div>
        </div>

        <p
          v-if="entry.uploadsDropped"
          class="mb-6 rounded-2xl border border-[#ebe8e0] bg-[#faf9f6] px-4 py-3 text-[13px] text-[#8a857c]"
        >
          Bu inshoning rasm sahifalari joy tejash uchun saqlanmagan — tahlil va natija saqlanib qolgan.
        </p>

        <EssayAnalysisSection
          :analysis="entry.analysis"
          :essay-text="entry.analyzedText"
          :band-total="entry.bandTotal"
          :band-max="entry.bandMax || undefined"
          :sample="Boolean(entry.sample)"
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
              <p v-if="entry.essayText" class="whitespace-pre-line text-[14px] leading-[1.8] text-[#3a362f]">{{ entry.essayText }}</p>
              <div v-if="entry.uploads?.length" class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div v-for="(upload, index) in entry.uploads" :key="upload.id" class="relative overflow-hidden rounded-[14px] border border-[#e0ddd7] bg-[#faf9f6]">
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
    </div>
  </main>
</template>

<style scoped>
.math-dots {
  background-image: radial-gradient(circle, #d8d3ca 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 30%, transparent 80%);
  mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 30%, transparent 80%);
  opacity: 0.5;
}

.math-grain {
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>
