<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  icon: string
  title: string
  description: string
  index?: number
}>()

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
          // Stagger each card so they reveal in sequence.
          window.setTimeout(() => {
            visible.value = true
          }, (props.index ?? 0) * 120)
          observer?.disconnect()
        }
      }
    },
    { threshold: 0.15 },
  )

  if (el.value) {
    observer.observe(el.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="el"
    class="feature-card flex items-start space-x-4 rounded-2xl border border-gray-300 p-4 sm:space-x-5 sm:rounded-3xl sm:p-6 lg:space-x-6 lg:p-8"
    :class="{ 'is-visible': visible }"
  >
    <div
      class="flex h-12 w-12 flex-shrink-0 items-center justify-center text-2xl sm:h-14 sm:w-14 sm:text-3xl lg:h-16 lg:w-16 lg:text-4xl"
    >
      {{ icon }}
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="mb-2 text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
        {{ title }}
      </h3>
      <p class="text-sm leading-6 text-gray-700 sm:text-base sm:leading-7 lg:text-lg">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.feature-card {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.6s ease-out,
    transform 0.45s ease-out,
    box-shadow 0.3s ease;
}

.feature-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.feature-card.is-visible:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .feature-card {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
