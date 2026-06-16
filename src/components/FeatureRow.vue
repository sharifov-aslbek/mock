<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import FeatureMock from './FeatureMock.vue'

const props = defineProps<{
  index: number
  iconKey: string
  title: string
  description: string
  tag: string
  reversed?: boolean
}>()

const numberLabel = computed(() => String(props.index + 1).padStart(2, '0'))

const el = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.value = true
          observer?.disconnect()
        }
      }
    },
    { threshold: 0.2 },
  )
  if (el.value) observer.observe(el.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="el"
    class="feature-row grid items-center gap-10 md:grid-cols-2 lg:gap-20"
    :class="{ 'is-visible': visible }"
  >
    <!-- Text -->
    <div
      class="text-side"
      :class="reversed ? 'md:order-2' : 'md:order-1'"
    >
      <div class="mb-5 flex items-center gap-3">
        <span class="font-mono-custom text-[11px] font-semibold tracking-[0.22em] text-[#bcb6a9]">{{ numberLabel }}</span>
        <span class="h-px w-7 bg-[#d8d3ca]"></span>
        <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ tag }}</span>
      </div>

      <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e8e3da] bg-white text-[#1a1814] shadow-[0_4px_14px_rgba(26,24,20,0.05)]">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <template v-if="iconKey === 'exam'">
            <path d="M9 4h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2V5a1 1 0 0 1 1-1z" stroke-linejoin="round" /><path d="m9 13 2 2 4-4" />
          </template>
          <template v-else-if="iconKey === 'practice'">
            <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" />
          </template>
          <template v-else>
            <path d="M3 21h18" /><path d="M6 21v-6M11 21V8M16 21v-9M21 21V5" />
          </template>
        </svg>
      </div>

      <h3 class="text-2xl font-bold leading-tight tracking-[-0.02em] text-[#1a1814] sm:text-[1.75rem]">
        {{ title }}
      </h3>
      <p class="mt-3 max-w-md text-[15px] leading-7 text-[#6b6760] sm:text-base">
        {{ description }}
      </p>
    </div>

    <!-- Visual -->
    <div
      class="mock-side"
      :class="reversed ? 'md:order-1' : 'md:order-2'"
    >
      <FeatureMock :variant="iconKey" />
    </div>
  </div>
</template>

<style scoped>
.text-side,
.mock-side {
  opacity: 0;
  transition:
    opacity 0.7s ease-out,
    transform 0.6s ease-out;
}
.text-side {
  transform: translateY(24px);
}
.mock-side {
  transform: translateY(24px) scale(0.98);
}
.feature-row.is-visible .text-side {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.05s;
}
.feature-row.is-visible .mock-side {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition-delay: 0.15s;
}

@media (prefers-reduced-motion: reduce) {
  .text-side,
  .mock-side {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
