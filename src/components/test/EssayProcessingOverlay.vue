<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import logoMark from '@/assets/logo-removed.png'

// Full-screen takeover for the two-step essay finish flow:
//  'transcribing' — the uploaded handwriting pages are at /essay-review/transcribe
//  'checking'     — get-results is running the AI essay review
//  'error'        — the step failed; offer retry / back to the test
const props = defineProps({
  mode: { type: String, required: true },
  // '' hides the badge; '1' / '2' render "Qadam N / 2". The badge only makes
  // sense when the flow really had two steps (photos were uploaded).
  step: { type: String, default: '' },
  pageCount: { type: Number, default: 0 },
})

const emit = defineEmits(['retry', 'back'])

const { t } = useI18n()

// The AI check reports no per-criterion progress, so the status list advances
// on a timer and holds on the last item until the results land and unmount us.
const CHECK_STAGE_ADVANCE_MS = 7000
const checkStage = ref(0)
let checkStageIntervalId = null

const stopCheckStageTimer = () => {
  if (checkStageIntervalId) {
    clearInterval(checkStageIntervalId)
    checkStageIntervalId = null
  }
}

watch(
  () => props.mode,
  (mode) => {
    stopCheckStageTimer()
    checkStage.value = 0
    if (mode === 'checking' && typeof window !== 'undefined') {
      checkStageIntervalId = window.setInterval(() => {
        if (checkStage.value < 2) {
          checkStage.value += 1
        } else {
          stopCheckStageTimer()
        }
      }, CHECK_STAGE_ADVANCE_MS)
    }
  },
  { immediate: true },
)

onBeforeUnmount(stopCheckStageTimer)

const checkItems = computed(() => [
  t('essayOverlay.checkGrammar'),
  t('essayOverlay.checkLogic'),
  t('essayOverlay.checkStyle'),
])

const scanCardCount = computed(() => Math.max(1, Math.min(Number(props.pageCount) || 1, 3)))

// Skeleton line widths per card, so the mini-pages don't look copy-pasted.
const scanCardLines = [
  ['80%', '100%', '90%', '60%'],
  ['70%', '100%', '85%'],
  ['100%', '75%', '90%', '55%'],
]
</script>

<template>
  <Teleport to="body">
    <div
      class="font-sans-custom fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto bg-[#f5f3ef] px-6 text-[#1a1814]"
      role="status"
      aria-live="polite"
    >
      <div class="absolute left-5 top-5 flex items-center gap-2.5 sm:left-8 sm:top-7">
        <img :src="logoMark" alt="MilliyMock" class="h-7 w-auto object-contain" />
        <span class="text-[15px] font-bold tracking-[-0.025em]">MilliyMock</span>
      </div>

      <div
        v-if="step && mode !== 'error'"
        class="font-mono-custom absolute right-5 top-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a857c] sm:right-8 sm:top-8"
      >
        {{ t('essayOverlay.step', { step }) }}
      </div>

      <template v-if="mode === 'transcribing'">
        <div class="mb-8 flex gap-3.5">
          <div
            v-for="cardIndex in scanCardCount"
            :key="cardIndex"
            class="relative h-[104px] w-[78px] overflow-hidden rounded-[10px] border border-[#e0ddd7] bg-white shadow-[0_6px_18px_rgba(26,24,20,0.06)]"
          >
            <div class="absolute inset-x-2.5 top-3 flex flex-col gap-1.5">
              <div
                v-for="(lineWidth, lineIndex) in scanCardLines[cardIndex - 1]"
                :key="lineIndex"
                class="h-[3px] rounded-sm bg-[#1a1814]/15"
                :style="{ width: lineWidth }"
              ></div>
            </div>
            <div
              class="scan-line absolute inset-x-[6%] h-[2px] bg-[#1a1814] shadow-[0_0_10px_rgba(26,24,20,0.4)]"
              :style="{ animationDelay: `${(cardIndex - 1) * 0.5}s` }"
            ></div>
          </div>
        </div>

        <h2 class="text-center text-[clamp(24px,5vw,34px)] font-extrabold tracking-[-0.02em]">
          {{ t('essayOverlay.transcribingTitle') }}
        </h2>
        <p class="font-mono-custom mt-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">
          {{ t('essayOverlay.transcribingMeta', { count: pageCount || 1 }) }}
        </p>

        <div class="relative mt-8 h-[5px] w-[280px] max-w-full overflow-hidden rounded-full bg-[#1a1814]/10">
          <div class="bar-slide absolute inset-y-0 left-0 w-[30%] rounded-full bg-[#1a1814]"></div>
        </div>

        <p class="absolute bottom-6 px-6 text-center text-xs text-[#8a857c]">
          {{ t('essayOverlay.transcribingHint') }}
        </p>
      </template>

      <template v-else-if="mode === 'checking'">
        <div
          class="relative mb-8 flex h-[104px] w-[104px] items-center justify-center rounded-full border border-[#e0ddd7] bg-white shadow-[0_10px_30px_rgba(26,24,20,0.07)]"
        >
          <span
            class="absolute -inset-2 animate-spin rounded-full border-[2.5px] border-transparent border-t-[#1a1814] [animation-duration:1.1s]"
          ></span>
          <span class="text-[28px] font-extrabold">Aa</span>
        </div>

        <h2 class="text-center text-[clamp(24px,5vw,34px)] font-extrabold tracking-[-0.02em]">
          {{ t('essayOverlay.checkingTitle') }}
        </h2>
        <p class="font-mono-custom mt-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">
          {{ t('essayOverlay.checkingMeta') }}
        </p>

        <div class="mt-6 flex flex-col items-start gap-2.5">
          <div
            v-for="(item, itemIndex) in checkItems"
            :key="item"
            class="flex items-center gap-2 text-[13.5px]"
            :class="itemIndex > checkStage ? 'text-[#1a1814]/35' : 'text-[#1a1814]'"
          >
            <span v-if="itemIndex < checkStage" class="font-bold text-[#2e9e5b]">✓</span>
            <span
              v-else-if="itemIndex === checkStage"
              class="inline-block h-[11px] w-[11px] animate-spin rounded-full border-2 border-[#1a1814]/15 border-t-[#1a1814] [animation-duration:0.9s]"
            ></span>
            <span v-else class="inline-block h-[11px] w-[11px] rounded-full border-2 border-[#1a1814]/10"></span>
            {{ item }}
          </div>
        </div>

        <p class="absolute bottom-6 px-6 text-center text-xs text-[#8a857c]">
          {{ t('essayOverlay.checkingHint') }}
        </p>
      </template>

      <template v-else>
        <div
          class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdecec] text-[26px] font-bold text-[#c0392b]"
        >
          !
        </div>

        <h2 class="text-center text-[clamp(22px,5vw,30px)] font-extrabold tracking-[-0.02em]">
          {{ t('essayOverlay.errorTitle') }}
        </h2>
        <p class="mt-2.5 max-w-[380px] text-center text-sm text-[#1a1814]/55">
          {{ t('essayOverlay.errorHint') }}
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center rounded-full bg-[#1a1814] px-8 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-800 active:scale-[0.98]"
            @click="emit('retry')"
          >
            {{ t('essayOverlay.retry') }}
          </button>
          <button
            type="button"
            class="inline-flex h-12 items-center justify-center rounded-full border-[1.5px] border-[#1a1814]/20 px-8 text-sm font-semibold text-[#1a1814] transition duration-200 hover:border-[#1a1814] active:scale-[0.98]"
            @click="emit('back')"
          >
            {{ t('essayOverlay.backToTest') }}
          </button>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.scan-line {
  animation: scan-move 2.2s ease-in-out infinite;
}

@keyframes scan-move {
  0% {
    top: 8%;
  }

  50% {
    top: 86%;
  }

  100% {
    top: 8%;
  }
}

.bar-slide {
  animation: bar-slide 1.6s ease-in-out infinite;
}

@keyframes bar-slide {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(340%);
  }
}
</style>
