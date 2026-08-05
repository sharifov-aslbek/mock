<script setup>
// One mock test, in the long horizontal form: subject mark and name on the
// left, status and the primary action on the right. Shared between the
// dashboard's latest-tests block and the Testlar screen so a test looks the
// same wherever it appears.
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import StatusBadge from './StatusBadge.vue'
import { ACTION_BY_STATE, SUBJECTS, testName } from './subjects.js'
import { toneForScore } from './score.js'

const props = defineProps({
  // { id, subject, date, shift, questions, takers, premium, state, score }
  test: { type: Object, required: true },
})

const subject = computed(() => SUBJECTS[props.test.subject] ?? { label: props.test.subject, mark: '?' })
const action = computed(() => ACTION_BY_STATE[props.test.state] ?? ACTION_BY_STATE.new)
const takers = computed(() => new Intl.NumberFormat('uz-UZ').format(props.test.takers))
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
    <span
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-app-tile text-[18px] font-semibold text-app-ink"
      aria-hidden="true"
    >
      {{ subject.mark }}
    </span>

    <!-- min-w keeps the name from shredding into one word per line once the
         trailing group is beside it. -->
    <div class="min-w-[170px] flex-1">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p class="text-[14px] font-semibold text-app-ink">
          {{ subject.label }} — {{ testName(test) }}
        </p>
        <StatusBadge v-if="test.premium" tone="neutral" class="!px-2 !py-0.5 !text-[11px]">
          PREMIUM
        </StatusBadge>
      </div>
      <p class="mt-0.5 text-[12px] text-app-muted">
        {{ test.questions }} savol • {{ takers }} ishlagan
      </p>
    </div>

    <!-- Full width below sm so status and action drop to their own line instead
         of colliding with the name. -->
    <div class="flex w-full shrink-0 items-center justify-end gap-3 sm:w-auto">
      <StatusBadge v-if="test.state === 'done'" :tone="toneForScore(test.score)">
        {{ test.score }}%
      </StatusBadge>
      <StatusBadge v-else-if="test.state === 'progress'" tone="info">Yechilmoqda</StatusBadge>

      <RouterLink
        to="/testlar"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        :class="
          test.state === 'done'
            ? 'border border-app-border bg-app-surface text-app-ink hover:bg-app-tile'
            : 'bg-app-ink text-app-surface hover:opacity-90'
        "
      >
        {{ action }}
        <AppIcon name="arrowRight" :size="14" />
      </RouterLink>
    </div>
  </div>
</template>
