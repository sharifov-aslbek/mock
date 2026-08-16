<script setup>
// Biology open-response AI review — renders what get-results returns under
// `biologyReviews`, one card per AI-graded question (the image-only open
// responses, e.g. 41–43).
//
//   <BiologyReviewSection
//     :reviews="biologyReviews"                    // raw backend array
//     :resolve-question-label="fn(questionId)"     // → "41"
//     :resolve-answer-images="fn(questionId)"      // → [imageUrl, …]
//   />
//
// Each card shows the grade, how it splits across the three score buckets, the
// AI's overall note, and the full criterion-by-criterion breakdown (weight,
// verdict, reasoning and the quote from the student's work it is based on).
import { computed } from 'vue'
import { formatScore, normalizeBiologyReviews, readScore } from '@/utils/biologyReview'

const props = defineProps({
  reviews: { type: Array, default: () => [] },
  resolveQuestionLabel: { type: Function, default: () => '' },
  resolveAnswerImages: { type: Function, default: () => [] },
})

const normalizedReviews = computed(() => normalizeBiologyReviews(props.reviews))

// Header total across every AI-graded question on the attempt.
const earnedTotal = computed(() =>
  normalizedReviews.value.reduce((total, review) => total + (readScore(review.totalScore) ?? 0), 0),
)
const maxTotal = computed(() =>
  normalizedReviews.value.reduce((total, review) => total + (readScore(review.maxScore) ?? 0), 0),
)

const questionLabel = (review) => {
  const label = props.resolveQuestionLabel(review.questionId)
  return label ? `${label}-topshiriq` : 'Ochiq javob'
}

const answerImages = (review) => {
  const images = props.resolveAnswerImages(review.questionId)
  return Array.isArray(images) ? images : []
}

// Bucket width as a share of the question's maximum, so the three segments plus
// the grey remainder always read as one "out of maxScore" bar.
const bucketPercent = (review, bucket) => {
  const max = readScore(review.maxScore)
  if (!max) {
    return 0
  }
  return Math.max(0, Math.min(100, ((readScore(bucket.value) ?? 0) / max) * 100))
}

const VERDICT_TONES = {
  ok: 'border-[#cfe0d2] bg-[#f2f7f2] text-[#4f7a55]',
  warn: 'border-[#e8d8b4] bg-[#fdf8ef] text-[#a8752c]',
  bad: 'border-red-200 bg-red-50 text-red-600',
}

const verdictClass = (review) => VERDICT_TONES[review.verdict.tone] || VERDICT_TONES.ok
</script>

<template>
  <section class="mt-12">
    <!-- Section header — mirrors the Ona tili insho analysis strip -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-mono-custom text-[11px] font-semibold tracking-[0.18em] text-[#bcb6a9]">IV</span>
          <h2 class="text-xl font-bold tracking-[-0.01em] text-[#1a1814]">Ochiq javob tahlili</h2>
          <span class="font-mono-custom rounded-full border border-[#d8d3ca] bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">
            AI tekshiruvi
          </span>
        </div>
        <p class="mt-2 max-w-3xl text-[13px] leading-relaxed text-[#8a857c]">
          Yuklagan yechimingiz sun’iy intellekt tomonidan mezonlar bo‘yicha baholandi. Har bir mezon
          uchun izoh va yechimingizdan olingan iqtibos ko‘rsatilgan.
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-5 sm:gap-7">
        <div>
          <p class="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">
            {{ formatScore(earnedTotal) }}<span class="text-[16px] font-semibold text-[#a39e94]">/{{ formatScore(maxTotal) }}</span>
          </p>
          <p class="font-mono-custom mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Umumiy ball</p>
        </div>
        <span class="h-9 w-px bg-[#d8d3ca]"></span>
        <div>
          <p class="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">{{ normalizedReviews.length }}</p>
          <p class="font-mono-custom mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Topshiriq</p>
        </div>
      </div>
    </div>

    <div class="space-y-5">
      <article
        v-for="review in normalizedReviews"
        :key="review.id ?? review.questionId"
        class="rounded-[22px] bg-white p-5 ring-1 ring-[#eeeae2] shadow-[0_26px_54px_-26px_rgba(26,24,20,0.22)] sm:p-7"
      >
        <!-- Question header: number, problem type, verdict, score -->
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="font-mono-custom rounded-full bg-[#1a1814] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
                {{ questionLabel(review) }}
              </span>
              <span
                class="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                :class="verdictClass(review)"
              >
                {{ review.verdict.label }}
              </span>
            </div>
            <p v-if="review.problemType" class="mt-2.5 text-[13.5px] font-medium leading-snug text-[#6b6760]">
              {{ review.problemType }}
            </p>
          </div>

          <div class="shrink-0 text-right">
            <p class="text-[26px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">
              {{ formatScore(review.totalScore) }}<span class="text-[15px] font-semibold text-[#a39e94]">/{{ formatScore(review.maxScore) }}</span>
            </p>
            <p v-if="review.percent !== null" class="font-mono-custom mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">
              {{ review.percent }}%
            </p>
          </div>
        </div>

        <!-- Score split across the three buckets, drawn against maxScore -->
        <div class="mt-5">
          <div class="flex h-2.5 w-full overflow-hidden rounded-full bg-[#f0ece4]">
            <div
              v-for="bucket in review.buckets"
              :key="bucket.key"
              class="h-full"
              :style="{ width: `${bucketPercent(review, bucket)}%`, backgroundColor: bucket.color }"
            ></div>
          </div>
          <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <span
              v-for="bucket in review.buckets"
              :key="bucket.key"
              class="flex items-center gap-2 text-[12px] font-medium text-[#6b6760]"
            >
              <span class="inline-block h-2.5 w-2.5 rounded-[3px]" :style="{ backgroundColor: bucket.color }"></span>
              {{ bucket.label }}
              <span class="font-semibold tabular-nums text-[#1a1814]">{{ formatScore(bucket.value) }}</span>
            </span>
          </div>
        </div>

        <!-- Blocking problems that explain a heavily reduced score -->
        <div v-if="review.flags.length || review.methodBlockVoided" class="mt-5 flex flex-wrap gap-2">
          <span
            v-for="flag in review.flags"
            :key="flag.key"
            class="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-semibold text-red-600"
          >
            <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4m0 4h.01M10.3 3.86l-8.5 14.7A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.73-3L13.7 3.86a2 2 0 0 0-3.4 0Z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ flag.label }}
          </span>
          <span
            v-if="review.methodBlockVoided"
            class="inline-flex items-center gap-1.5 rounded-full border border-[#e8d8b4] bg-[#fdf8ef] px-3 py-1.5 text-[12px] font-semibold text-[#a8752c]"
          >
            Metodika bloki bekor qilindi
          </span>
        </div>

        <!-- The AI's overall note -->
        <div v-if="review.globalNotes" class="mt-5 rounded-[18px] bg-[#faf8f4] px-5 py-4 ring-1 ring-[#eeeae2]">
          <p class="font-mono-custom mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Umumiy xulosa</p>
          <p class="text-[13.5px] leading-relaxed text-[#3a362f]">{{ review.globalNotes }}</p>
        </div>

        <!-- Criterion-by-criterion breakdown -->
        <details v-if="review.groups.length" class="group mt-5 overflow-hidden rounded-[18px] ring-1 ring-[#eeeae2]">
          <summary class="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#faf8f4]">
            <span class="text-[14px] font-semibold text-[#1a1814]">Mezonlar bo‘yicha tahlil</span>
            <span class="flex items-center gap-3">
              <span class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium tabular-nums text-[#a39e94]">
                <span>{{ review.counts.total }} mezon</span>
                <span class="text-[#4f7a55]">{{ review.counts.full }} to‘liq</span>
                <span v-if="review.counts.partial" class="text-[#c08a3e]">{{ review.counts.partial }} qisman</span>
                <span v-if="review.counts.zero" class="text-[#c25d52]">{{ review.counts.zero }} bajarilmagan</span>
              </span>
              <svg class="h-4 w-4 shrink-0 text-[#8a857c] transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </summary>

          <div class="space-y-6 border-t border-[#f3f0ea] px-5 py-5">
            <div v-for="group in review.groups" :key="group.key">
              <div class="mb-3 flex items-center gap-2">
                <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#bcb6a9]">
                  {{ group.key === 'other' ? '•' : group.key.toUpperCase() }}
                </span>
                <span class="text-[13px] font-bold text-[#1a1814]">{{ group.label }}</span>
              </div>

              <div class="space-y-2.5">
                <div
                  v-for="element in group.elements"
                  :key="element.code"
                  class="rounded-[14px] bg-[#fffdfa] px-4 py-3.5 ring-1 ring-[#f0ece4]"
                  :style="{ borderLeft: `3px solid ${element.verdict.color}` }"
                  :class="element.applicable ? '' : 'opacity-60'"
                >
                  <div class="flex flex-wrap items-center gap-2.5">
                    <span class="font-mono-custom rounded-md bg-[#f0ece4] px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#6b6760]">
                      {{ element.label }}
                    </span>
                    <span class="text-[11.5px] font-semibold" :style="{ color: element.verdict.color }">
                      {{ element.verdict.label }}
                    </span>
                    <span v-if="element.weight !== null" class="font-mono-custom text-[10.5px] font-medium tabular-nums text-[#a39e94]">
                      {{ formatScore(element.weight) }} ball
                    </span>
                  </div>

                  <p v-if="element.reasoning" class="mt-2 text-[12.5px] leading-[1.6] text-[#3a362f]">
                    {{ element.reasoning }}
                  </p>

                  <p
                    v-if="element.quote"
                    class="mt-2 border-l-2 border-[#e0ddd7] pl-3 text-[12px] italic leading-[1.55] text-[#8a857c]"
                  >
                    {{ element.quote }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </details>

        <!-- The photos the student handed in for this question -->
        <details v-if="answerImages(review).length" class="group mt-4 overflow-hidden rounded-[18px] ring-1 ring-[#eeeae2]">
          <summary class="flex cursor-pointer items-center justify-between px-5 py-4 text-[14px] font-semibold text-[#1a1814] transition hover:bg-[#faf8f4]">
            <span>Sizning javobingiz ({{ answerImages(review).length }} ta rasm)</span>
            <svg class="h-4 w-4 text-[#8a857c] transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </summary>
          <div class="grid grid-cols-1 gap-3 border-t border-[#f3f0ea] px-5 py-5 sm:grid-cols-2">
            <a
              v-for="(imageUrl, index) in answerImages(review)"
              :key="imageUrl"
              :href="imageUrl"
              target="_blank"
              rel="noopener"
              class="block overflow-hidden rounded-[14px] ring-1 ring-[#eeeae2] transition hover:ring-[#1a1814]"
            >
              <img :src="imageUrl" :alt="`Yechim rasmi ${index + 1}`" class="w-full object-contain" />
            </a>
          </div>
        </details>
      </article>
    </div>
  </section>
</template>
