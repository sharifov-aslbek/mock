<script setup>
// One saved essay checking on the Natijalar page (Insholar tab) — the essay
// analogue of MathTestCard. Minimal card: topic, when it was checked, how it
// was submitted, and the overall band with a thin progress bar. The whole card
// opens the full analysis; delete surfaces on hover.
import { computed } from 'vue'
import { ESSAY_BAND_MAX } from '@/utils/essayAnalysis'

const props = defineProps({
  entry: { type: Object, required: true },
})

const emit = defineEmits(['open', 'remove'])

const UZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
]

const formattedDate = computed(() => {
  const date = new Date(props.entry.savedAt)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}, ${date.getFullYear()}`
})

const bandMax = computed(() => props.entry.bandMax || ESSAY_BAND_MAX)
const bandTotal = computed(() =>
  typeof props.entry.bandTotal === 'number' ? props.entry.bandTotal : null,
)
const scorePercent = computed(() => {
  if (bandTotal.value == null || !bandMax.value) return 0
  return Math.max(0, Math.min(100, Math.round((bandTotal.value / bandMax.value) * 100)))
})

const modeLabel = computed(() => (props.entry.mode === 'upload' ? 'Rasm' : 'Yozma'))
const pageCount = computed(() => props.entry.uploads?.length || 0)

const metaLine = computed(() => {
  const parts = [formattedDate.value, modeLabel.value]
  if (props.entry.mode === 'upload' && pageCount.value) {
    parts.push(`${pageCount.value} sahifa`)
  }
  return parts.filter(Boolean).join('  ·  ')
})
</script>

<template>
  <article
    role="button"
    tabindex="0"
    @click="emit('open', entry.id)"
    @keydown.enter="emit('open', entry.id)"
    @keydown.space.prevent="emit('open', entry.id)"
    class="group relative flex cursor-pointer flex-col rounded-[22px] border border-[#eae6df] bg-white p-6 transition duration-300 hover:border-[#d8d3ca] hover:shadow-[0_14px_40px_rgba(26,24,20,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1814]/20"
  >
    <!-- Eyebrow -->
    <div class="mb-4 flex items-center gap-2">
      <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b0a99d]">
        Insho
      </span>
      <span
        v-if="entry.sample"
        class="font-mono-custom inline-flex items-center rounded-full bg-[#f5f2ec] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#a39e94]"
      >
        Namuna
      </span>
    </div>

    <!-- Topic -->
    <h3 class="line-clamp-2 text-[15.5px] font-semibold leading-[1.45] tracking-[-0.01em] text-[#1a1814]">
      {{ entry.topic }}
    </h3>

    <!-- Meta -->
    <p class="mt-2 text-[12.5px] text-[#a39e94]">{{ metaLine }}</p>

    <!-- Score + thin progress bar -->
    <div class="mt-6">
      <div class="flex items-baseline justify-between">
        <div class="flex items-baseline gap-1.5">
          <span class="text-[26px] font-bold leading-none tracking-[-0.03em] tabular-nums text-[#1a1814]">
            {{ bandTotal ?? '—' }}
          </span>
          <span class="text-[13px] font-medium text-[#a39e94]">/ {{ bandMax }} ball</span>
        </div>

        <span class="inline-flex items-center gap-1.5 rounded-full bg-[#f3efe8] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#1a1814] transition duration-300 group-hover:bg-[#1a1814] group-hover:text-white">
          Ko‘rish
          <svg class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M5 12h14m-6-6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>

      <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#efeae2]">
        <div
          class="h-full rounded-full bg-[#1a1814] transition-[width] duration-500 ease-out"
          :style="{ width: scorePercent + '%' }"
        ></div>
      </div>
    </div>
  </article>
</template>
