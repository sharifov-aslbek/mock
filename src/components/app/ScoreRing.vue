<script setup>
// A score as a ring. Used in the dashboard's activity list, where a bare "85%"
// gave no sense of how close to full marks that is — the arc does that at a
// glance, before the number is read.
//
// Colour comes from the tone scale, never chosen by eye: pass the tone from
// toneForScore() in ./score.js so a pass mark means the same green everywhere.
import { computed } from 'vue'

const props = defineProps({
  percent: { type: Number, required: true },
  size: { type: Number, default: 44 },
  stroke: { type: Number, default: 4 },
  tone: {
    type: String,
    default: 'good',
    validator: (v) => ['good', 'bad', 'info', 'neutral'].includes(v),
  },
})

const clamped = computed(() => Math.max(0, Math.min(100, Number(props.percent) || 0)))

// Geometry: the stroke straddles the path, so the radius has to sit half a
// stroke inside the box or the arc clips at the edges.
const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dash = computed(() => (clamped.value / 100) * circumference.value)

const strokeClass = computed(
  () =>
    ({
      good: 'stroke-app-good',
      bad: 'stroke-app-bad',
      info: 'stroke-app-info',
      neutral: 'stroke-app-muted',
    })[props.tone],
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="shrink-0 -rotate-90"
    role="img"
    :aria-label="`${clamped}%`"
  >
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      fill="none"
      :stroke-width="stroke"
      class="stroke-current opacity-20"
    />
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      fill="none"
      :stroke-width="stroke"
      stroke-linecap="round"
      :stroke-dasharray="`${dash} ${circumference}`"
      :class="strokeClass"
    />
  </svg>
</template>
