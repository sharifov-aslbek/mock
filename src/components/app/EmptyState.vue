<script setup>
// The platform's empty state. Every list uses this one so a first-time student
// meets the same voice everywhere: name what is missing, say what will appear
// here, and offer the one action that fills it.
//
// Built from existing parts — the circular icon tile, body type, the ink pill —
// so it introduces no new shapes.
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'tests' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  actionTo: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center"
    :class="compact ? 'px-4 py-8' : 'px-4 py-12'"
  >
    <span
      class="flex items-center justify-center rounded-full bg-app-tile text-app-muted"
      :class="compact ? 'h-11 w-11' : 'h-14 w-14'"
    >
      <AppIcon :name="icon" :size="compact ? 20 : 24" />
    </span>

    <p class="mt-4 text-[15px] font-semibold text-app-ink">{{ title }}</p>
    <p v-if="description" class="mt-1.5 max-w-[320px] text-[13px] leading-[1.6] text-app-muted">
      {{ description }}
    </p>

    <RouterLink
      v-if="actionLabel && actionTo"
      :to="actionTo"
      class="mt-5 inline-flex items-center gap-1.5 rounded-full bg-app-ink px-4 py-2 text-[13px] font-semibold text-app-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
    >
      {{ actionLabel }}
      <AppIcon name="arrowRight" :size="14" />
    </RouterLink>
  </div>
</template>
