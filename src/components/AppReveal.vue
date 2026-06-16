<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    delay?: number
    as?: string
  }>(),
  {
    delay: 0,
    as: 'div',
  },
)

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
          window.setTimeout(() => {
            visible.value = true
          }, props.delay)
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
  <component :is="as" ref="el" class="reveal" :class="{ 'is-visible': visible }">
    <slot />
  </component>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition:
    opacity 0.7s ease-out,
    transform 0.55s ease-out;
  will-change: opacity, transform;
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
