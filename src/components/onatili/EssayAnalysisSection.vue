<script setup>
// AI insho (essay) analysis section — renders the Gemini grading response.
//
// This is the REAL integration surface for the Ona tili essay: pass the raw
// AI response as `analysis` (unchanged — see utils/essayAnalysis.js for the
// expected shape and the tolerant normalizer), the essay text the quotes
// refer to, and the overall band total from the backend.
//
//   <EssayAnalysisSection
//     :analysis="aiResponse"        // raw Gemini JSON
//     :essay-text="essayText"       // the student's essay (typed text)
//     :band-total="17"              // overall band from the backend
//     :sample="false"               // true only on the design demo
//   />
//
// Every `quote` found inside `essayText` is highlighted inline, color-coded
// by category, and cross-linked with the issue inspector on the right.
// Quotes that don't match (e.g. OCR drift) still appear in the inspector —
// they just have no inline anchor, so nothing breaks.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ESSAY_BAND_MAX, catMeta, normalizeEssayAnalysis } from '@/utils/essayAnalysis'

const props = defineProps({
  // Raw AI grading response (pass-through from the backend).
  analysis: { type: Object, required: true },
  // The essay the analysis refers to. Quotes are located inside this text.
  essayText: { type: String, required: true },
  // Overall band total (out of bandMax). Null renders an em dash.
  bandTotal: { type: Number, default: null },
  bandMax: { type: Number, default: ESSAY_BAND_MAX },
  // Design-demo mode: shows the "Namuna" badge + explanatory note.
  sample: { type: Boolean, default: false },
})

const normalized = computed(() => normalizeEssayAnalysis(props.analysis))
const flatErrors = computed(() => normalized.value.errors)
const errorCatsWithHits = computed(() => normalized.value.catsWithHits)
const cleanCats = computed(() => normalized.value.cleanCats)

const catCount = (cat) => flatErrors.value.filter((error) => error.cat === cat).length

const essayWordCount = computed(
  () => props.essayText.trim().split(/\s+/).filter(Boolean).length,
)

// ——— Category filter chips ————————————————————————————————————————————
const activeCats = ref([])
watch(
  errorCatsWithHits,
  (cats) => {
    activeCats.value = [...cats]
  },
  { immediate: true },
)

const isCatActive = (cat) => activeCats.value.includes(cat)
const allCatsActive = computed(() => activeCats.value.length === errorCatsWithHits.value.length)
const toggleCat = (cat) => {
  activeCats.value = isCatActive(cat)
    ? activeCats.value.filter((item) => item !== cat)
    : [...activeCats.value, cat]
}
const toggleAllCats = () => {
  activeCats.value = allCatsActive.value ? [] : [...errorCatsWithHits.value]
}
const visibleErrorCount = computed(
  () => flatErrors.value.filter((error) => isCatActive(error.cat)).length,
)

// Inspector groups (per category, reading order preserved inside).
const inspectorGroups = computed(() =>
  errorCatsWithHits.value.map((cat) => ({
    cat,
    meta: catMeta(cat),
    errors: flatErrors.value.filter((error) => error.cat === cat),
  })),
)

// ——— Inline highlighting: locate every quote inside the essay text ———————
// Quotes and essay may mix apostrophe variants (’ ‘ ʻ ` ´ vs '); all of those
// are single UTF-16 units, so a 1:1 normalization keeps indices valid.
const normalizeApos = (value) => String(value).replace(/[’‘ʻ`´]/g, "'")

const segmentedParagraphs = computed(() => {
  const paragraphs = props.essayText
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return paragraphs.map((paragraph) => {
    const normalizedText = normalizeApos(paragraph)
    const found = []
    for (const error of flatErrors.value) {
      const index = normalizedText.indexOf(normalizeApos(error.quote))
      if (index !== -1) {
        found.push({ ...error, start: index, end: index + error.quote.length })
      }
    }

    const blocks = found
      .filter((range) => catMeta(range.cat).block)
      .sort((a, b) => a.start - b.start)
    const inlines = found.filter((range) => !catMeta(range.cat).block)

    const inlineParts = (from, to) => {
      const within = inlines
        .filter((range) => range.start >= from && range.end <= to)
        .sort((a, b) => a.start - b.start)
      const parts = []
      let cursor = from
      for (const range of within) {
        if (range.start > cursor) parts.push({ mark: false, text: paragraph.slice(cursor, range.start) })
        parts.push({ mark: true, id: range.id, cat: range.cat, text: paragraph.slice(range.start, range.end) })
        cursor = range.end
      }
      if (cursor < to) parts.push({ mark: false, text: paragraph.slice(cursor, to) })
      return parts
    }

    const segments = []
    let cursor = 0
    for (const block of blocks) {
      if (block.start > cursor) segments.push({ block: false, parts: inlineParts(cursor, block.start) })
      segments.push({ block: true, id: block.id, cat: block.cat, parts: inlineParts(block.start, block.end) })
      cursor = block.end
    }
    if (cursor < paragraph.length) segments.push({ block: false, parts: inlineParts(cursor, paragraph.length) })
    return segments
  })
})

// ——— Essay ↔ inspector cross-highlight ————————————————————————————————
const activeErrorId = ref('')
let flashTimeout = null

const markEls = {}
const issueEls = {}
const registerMark = (id) => (el) => {
  if (el) markEls[id] = el
}
const registerIssue = (id) => (el) => {
  if (el) issueEls[id] = el
}

const setActiveError = (id) => {
  activeErrorId.value = id
}
const clearActiveError = (id) => {
  if (activeErrorId.value === id) activeErrorId.value = ''
}
const flashError = (id) => {
  clearTimeout(flashTimeout)
  activeErrorId.value = id
  flashTimeout = setTimeout(() => {
    if (activeErrorId.value === id) activeErrorId.value = ''
  }, 1500)
}
const jumpToIssue = (id) => {
  if (!isCatActive(flatErrors.value.find((error) => error.id === id)?.cat)) return
  issueEls[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  flashError(id)
}
const jumpToMark = (id) => {
  markEls[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  flashError(id)
}

onBeforeUnmount(() => clearTimeout(flashTimeout))

// ——— Inline styles (colors are data-driven, so Tailwind can't carry them) ——
const markStyle = (part) => {
  if (!isCatActive(part.cat)) return {}
  const color = catMeta(part.cat).color
  const active = activeErrorId.value === part.id
  return {
    backgroundColor: color + (active ? '4d' : '26'),
    boxShadow: `inset 0 -2px 0 0 ${color}`,
    borderRadius: '3px',
    cursor: 'pointer',
  }
}
const blockStyle = (segment) => {
  if (!isCatActive(segment.cat)) return {}
  const color = catMeta(segment.cat).color
  const active = activeErrorId.value === segment.id
  return {
    backgroundColor: color + (active ? '2e' : '14'),
    boxShadow: `inset 3px 0 0 0 ${color}`,
    borderRadius: '0 6px 6px 0',
    padding: '2px 4px 2px 8px',
    cursor: 'pointer',
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
  }
}
const issueStyle = (error) => {
  const color = catMeta(error.cat).color
  const active = activeErrorId.value === error.id
  return {
    borderLeft: `3px solid ${color}`,
    ...(active
      ? { boxShadow: `0 12px 26px -14px ${color}99`, transform: 'translateY(-1px)' }
      : {}),
  }
}
const quoteMarkStyle = (error) => {
  const color = catMeta(error.cat).color
  return {
    backgroundColor: color + '26',
    boxShadow: `inset 0 -2px 0 0 ${color}`,
    borderRadius: '2px',
  }
}
</script>

<template>
  <section class="mt-12">
    <!-- Section header with the essay stats as one quiet typographic strip -->
    <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-mono-custom text-[11px] font-semibold tracking-[0.18em] text-[#bcb6a9]">IV</span>
          <h2 class="text-xl font-bold tracking-[-0.01em] text-[#1a1814]">Insho tahlili</h2>
          <span class="font-mono-custom rounded-full border border-[#d8d3ca] bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">
            AI tekshiruvi<template v-if="sample"> &bull; Namuna</template>
          </span>
        </div>
        <p v-if="sample" class="mt-2 max-w-3xl text-[13px] leading-relaxed text-[#8a857c]">
          Demo rejimida tahlil namunaviy insho ustida ko‘rsatilmoqda — haqiqiy imtihonda AI aynan shu ko‘rinishda sizning inshoingizni tekshiradi.
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span class="flex items-center gap-1.5 text-[12px] font-medium text-[#6b6760]">
            <svg v-if="normalized.onTopic" class="h-3.5 w-3.5 text-[#4f7a55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="h-3.5 w-3.5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
            {{ normalized.onTopic ? 'Mavzuga mos' : 'Mavzudan chetlashgan' }}
          </span>
          <span class="flex items-center gap-1.5 text-[12px] font-medium text-[#6b6760]">
            <svg v-if="!normalized.copiedSuspected" class="h-3.5 w-3.5 text-[#4f7a55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="h-3.5 w-3.5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
            {{ normalized.copiedSuspected ? 'Ko‘chirma gumoni bor' : 'Ko‘chirmakashlik aniqlanmadi' }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-5 sm:gap-7">
        <div>
          <p class="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">
            {{ bandTotal ?? '—' }}<span class="text-[16px] font-semibold text-[#a39e94]">/{{ bandMax }}</span>
          </p>
          <p class="font-mono-custom mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Insho balli</p>
        </div>
        <span class="h-9 w-px bg-[#d8d3ca]"></span>
        <div>
          <p class="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">{{ essayWordCount }}</p>
          <p class="font-mono-custom mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">So‘z</p>
        </div>
        <span class="h-9 w-px bg-[#d8d3ca]"></span>
        <div>
          <p class="text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">{{ flatErrors.length }}</p>
          <p class="font-mono-custom mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Xato</p>
        </div>
      </div>
    </div>

    <!-- Error analysis -->
    <div class="mb-4 flex flex-wrap items-baseline gap-3">
      <h3 class="text-[16px] font-bold tracking-[-0.01em] text-[#1a1814]">Xatolar tahlili</h3>
      <span class="text-[11.5px] font-medium tabular-nums text-[#a39e94]">{{ visibleErrorCount }} ta xato ko‘rsatilmoqda</span>
    </div>

    <!-- Filter chips -->
    <div class="mb-3 flex flex-wrap gap-2">
      <button
        type="button"
        @click="toggleAllCats"
        class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition active:scale-[0.98]"
        :class="allCatsActive
          ? 'border-[#1a1814] bg-[#1a1814] text-white'
          : 'border-[#d8d3ca] bg-white text-[#6b6760] hover:border-[#1a1814] hover:text-[#1a1814]'"
      >
        Barchasi
        <span class="tabular-nums" :class="allCatsActive ? 'text-white/60' : 'text-[#bcb6a9]'">{{ flatErrors.length }}</span>
      </button>
      <button
        v-for="cat in errorCatsWithHits"
        :key="cat"
        type="button"
        @click="toggleCat(cat)"
        :aria-pressed="isCatActive(cat)"
        class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition active:scale-[0.98]"
        :class="isCatActive(cat)
          ? 'border-[#d8d3ca] bg-white text-[#3a362f]'
          : 'border-[#e5e2dc] bg-transparent text-[#b3ada2] opacity-70'"
      >
        <span
          class="inline-block h-2.5 w-2.5 rounded-[3px]"
          :style="{ backgroundColor: isCatActive(cat) ? catMeta(cat).color : '#d8d3ca' }"
        ></span>
        {{ catMeta(cat).label }}
        <span class="tabular-nums text-[#bcb6a9]">{{ catCount(cat) }}</span>
      </button>
    </div>

    <!-- Clean criteria note -->
    <p v-if="cleanCats.length" class="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#a39e94]">
      <svg class="h-3.5 w-3.5 text-[#4f7a55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
        <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Xato topilmadi:
      <span class="font-semibold text-[#8a857c]">{{ cleanCats.map((cat) => catMeta(cat).label).join(', ') }}</span>
    </p>

    <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <!-- Annotated essay -->
      <article class="rounded-[22px] bg-white p-6 ring-1 ring-[#eeeae2] shadow-[0_26px_54px_-26px_rgba(26,24,20,0.22)] sm:p-8">
        <h4 class="text-[16px] font-bold tracking-[-0.01em] text-[#1a1814]">O‘quvchi inshosi</h4>
        <p class="font-mono-custom mb-5 mt-1 text-[10px] font-normal uppercase tracking-[0.14em] text-[#a39e94]">
          Belgilangan joyni bosing — o‘ngdagi izoh bilan bog‘lanadi
        </p>
        <div class="space-y-3 text-[15px] leading-[2] text-[#3a362f]">
          <p v-for="(segments, pIndex) in segmentedParagraphs" :key="pIndex">
            <template v-for="(segment, sIndex) in segments" :key="sIndex">
              <!-- Sentence-level (structure) block -->
              <span
                v-if="segment.block"
                :ref="registerMark(segment.id)"
                :style="blockStyle(segment)"
                @mouseenter="isCatActive(segment.cat) && setActiveError(segment.id)"
                @mouseleave="clearActiveError(segment.id)"
                @click="isCatActive(segment.cat) && jumpToIssue(segment.id)"
              >
                <template v-for="(part, tIndex) in segment.parts" :key="tIndex">
                  <span
                    v-if="part.mark"
                    :ref="registerMark(part.id)"
                    :style="markStyle(part)"
                    @mouseenter.stop="isCatActive(part.cat) && setActiveError(part.id)"
                    @mouseleave.stop="clearActiveError(part.id)"
                    @click.stop="isCatActive(part.cat) && jumpToIssue(part.id)"
                  >{{ part.text }}</span>
                  <span v-else>{{ part.text }}</span>
                </template>
              </span>
              <!-- Plain run (may contain inline marks) -->
              <template v-else>
                <template v-for="(part, tIndex) in segment.parts" :key="tIndex">
                  <span
                    v-if="part.mark"
                    :ref="registerMark(part.id)"
                    :style="markStyle(part)"
                    @mouseenter="isCatActive(part.cat) && setActiveError(part.id)"
                    @mouseleave="clearActiveError(part.id)"
                    @click="isCatActive(part.cat) && jumpToIssue(part.id)"
                  >{{ part.text }}</span>
                  <span v-else>{{ part.text }}</span>
                </template>
              </template>
            </template>
          </p>
        </div>
      </article>

      <!-- Issue inspector -->
      <aside class="flex flex-col gap-2 lg:sticky lg:top-6">
        <div v-for="group in inspectorGroups" :key="group.cat" v-show="isCatActive(group.cat)">
          <div class="mb-2 mt-1.5 flex items-center gap-2 px-0.5">
            <span class="inline-block h-2.5 w-2.5 rounded-[3px]" :style="{ backgroundColor: group.meta.color }"></span>
            <span class="text-[12px] font-bold text-[#1a1814]">{{ group.meta.label }}</span>
            <span class="text-[11px] font-semibold tabular-nums text-[#a39e94]">{{ group.errors.length }}</span>
          </div>
          <button
            v-for="error in group.errors"
            :key="error.id"
            type="button"
            :ref="registerIssue(error.id)"
            :style="issueStyle(error)"
            @mouseenter="setActiveError(error.id)"
            @mouseleave="clearActiveError(error.id)"
            @click="jumpToMark(error.id)"
            class="mb-2.5 block w-full rounded-[14px] bg-white px-4 py-3.5 text-left ring-1 ring-[#eeeae2] shadow-[0_10px_30px_rgba(26,24,20,0.05)] transition duration-150"
          >
            <p class="text-[13px] font-semibold leading-[1.5] text-[#1a1814]">
              <span :style="quoteMarkStyle(error)" class="px-0.5">{{ error.quote.length > 90 ? `${error.quote.slice(0, 90)}…` : error.quote }}</span>
            </p>
            <p class="mt-2 flex gap-2 text-[12px] leading-[1.55] text-[#6b6760]">
              <svg class="mt-0.5 h-3.5 w-3.5 shrink-0" :style="{ color: catMeta(error.cat).color }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 3h.01" stroke-linecap="round" />
              </svg>
              <span>{{ error.issue }}</span>
            </p>
          </button>
        </div>
      </aside>
    </div>

    <!-- Page-specific extras (e.g. the student's own submission) -->
    <slot />
  </section>
</template>
