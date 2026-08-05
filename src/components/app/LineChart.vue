<script setup>
// The platform's progress chart, drawn as inline SVG so it adds no dependency
// and inherits the ink stroke from the design system.
//
// It measures its own container and draws in real pixels — the viewBox tracks
// the observed box 1:1. So the chart genuinely fills whatever space the layout
// gives it, and the axis type renders at its true size instead of being scaled
// down along with a fixed viewBox.
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'

// Each instance needs its own gradient id, or a second chart on the page
// silently reuses the first one's fill.
const uid = useId()

const props = defineProps({
  // [{ label: 'Dush', value: 0..100 }]
  points: { type: Array, required: true },
  minHeight: { type: Number, default: 200 },
})

const wrap = ref(null)
const w = ref(440)
const h = ref(props.minHeight)
let observer

onMounted(() => {
  if (!wrap.value || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0) w.value = Math.round(width)
      // The SVG is sized *from* the measured box rather than driving it, so this
      // settles in one pass instead of feeding back into the layout.
      h.value = Math.max(props.minHeight, Math.round(height))
    }
  })
  observer.observe(wrap.value)
})

onBeforeUnmount(() => observer?.disconnect())

const PAD_L = 40
const PAD_R = 10
const PAD_T = 14
const PAD_B = 32

const ticks = [0, 25, 50, 75, 100]
const tickY = (t) => PAD_T + (h.value - PAD_T - PAD_B) * (1 - t / 100)

const geom = computed(() => {
  const innerW = Math.max(10, w.value - PAD_L - PAD_R)
  const innerH = Math.max(10, h.value - PAD_T - PAD_B)
  const n = props.points.length
  const coords = props.points.map((p, i) => ({
    ...p,
    x: PAD_L + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1)),
    y: PAD_T + innerH * (1 - Math.min(100, Math.max(0, p.value)) / 100),
  }))
  const line = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')
  const baseline = h.value - PAD_B
  const area = `${line} L${(w.value - PAD_R).toFixed(1)} ${baseline.toFixed(1)} L${PAD_L} ${baseline.toFixed(1)} Z`
  return { coords, line, area, baseline }
})
</script>

<template>
  <div ref="wrap" class="h-full w-full">
    <svg
      :viewBox="`0 0 ${w} ${h}`"
      :width="w"
      :height="h"
      class="block"
      role="img"
      :aria-label="`Progress grafigi: ${points.map((p) => `${p.label} ${p.value}%`).join(', ')}`"
    >
      <g class="text-app-border">
        <line
          v-for="t in ticks"
          :key="`g${t}`"
          :x1="PAD_L"
          :x2="w - PAD_R"
          :y1="tickY(t)"
          :y2="tickY(t)"
          stroke="currentColor"
          stroke-width="1"
        />
      </g>

      <g class="fill-app-muted text-[12px]">
        <text v-for="t in ticks" :key="`t${t}`" :x="PAD_L - 10" :y="tickY(t) + 4" text-anchor="end">
          {{ t }}%
        </text>
      </g>

      <defs>
        <linearGradient :id="`wash-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0.16" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
      </defs>

      <path :d="geom.area" :fill="`url(#wash-${uid})`" class="text-app-ink" />
      <path
        :d="geom.line"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-app-ink"
      />

      <g>
        <circle
          v-for="(c, i) in geom.coords"
          :key="`p${i}`"
          :cx="c.x"
          :cy="c.y"
          :r="i === geom.coords.length - 1 ? 5 : 4"
          class="fill-app-ink"
          :class="i === geom.coords.length - 1 ? 'stroke-app-surface' : ''"
          :stroke-width="i === geom.coords.length - 1 ? 3 : 0"
        />
      </g>

      <g class="fill-app-muted text-[12px]">
        <text
          v-for="(c, i) in geom.coords"
          :key="`l${i}`"
          :x="c.x"
          :y="geom.baseline + 20"
          text-anchor="middle"
        >
          {{ c.label }}
        </text>
      </g>
    </svg>
  </div>
</template>
