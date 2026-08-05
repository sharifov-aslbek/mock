<script setup>
// One subject in the Fanlar grid: circular icon tile, name, what the subject
// covers, and how many mocks it has. The whole card is the link — a card with a
// separate button inside it gives the same action two targets.
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { SUBJECTS, unknownSubject } from './subjects.js'

const props = defineProps({
  subjectKey: { type: String, required: true },
  // Passed in by the catalogue so a subject the registry does not know about
  // still renders with its raw name.
  subject: { type: Object, default: null },
  count: { type: Number, default: null },
})

const entry = computed(
  () => props.subject ?? SUBJECTS[props.subjectKey] ?? unknownSubject(props.subjectKey),
)
</script>

<template>
  <RouterLink
    :to="`/testlar/${encodeURIComponent(subjectKey)}`"
    class="group flex h-full flex-col items-center rounded-xl border border-app-border bg-app-surface px-4 py-6 text-center transition-colors hover:border-app-ink/15 hover:bg-app-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
  >
    <span
      class="flex h-14 w-14 items-center justify-center rounded-full bg-app-tile text-app-ink transition-colors group-hover:bg-app-surface"
    >
      <AppIcon :name="entry.icon" :size="24" />
    </span>

    <p class="mt-4 text-[16px] font-bold tracking-[-0.01em] text-app-ink">{{ entry.label }}</p>
    <p v-if="entry.description" class="mt-2 text-[12.5px] leading-[1.55] text-app-muted">
      {{ entry.description }}
    </p>

    <!-- mt-auto keeps the count on the baseline of the tallest card in the row,
         so the grid does not comb when descriptions run to different lengths. -->
    <p v-if="count !== null" class="mt-auto pt-5 text-[13px] font-medium text-app-muted">
      {{ count }} ta test
    </p>
  </RouterLink>
</template>
