<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { onaTiliDemoTest as demoTest } from '@/data/onaTiliDemoTest'

// Design-preview card for the Ona tili subject page. It doesn't go through the
// backend start-test flow like MathTestCard — it just opens the frontend-only
// "ideal test design" page (/ona-tili-demo). Rendered DEV-only by SubjectPage,
// mirroring the demo route which redirects to /ona-tili in production.
const router = useRouter()

// Open-book mark — the motherTongue subject icon (kept in sync with
// SubjectPage.vue's SUBJECT_CONFIG.motherTongue.paths).
const iconPaths = [
  'M12 7v14',
  'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3Z',
]

const questionCount = computed(() => demoTest.questions.length)
const sectionCount = computed(() => demoTest.sections.length)
const durationMinutes = computed(() => demoTest.durationMinutes)

const openDemo = () => {
  router.push({ name: 'ona-tili-demo' })
}
</script>

<template>
  <article
    class="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border border-[#1a1814]/15 bg-white/80 p-6 shadow-[0_10px_30px_rgba(26,24,20,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#1a1814]/30 hover:shadow-[0_20px_50px_rgba(26,24,20,0.12)]"
    @click="openDemo"
  >
    <div class="absolute inset-0 bg-[radial-gradient(circle,#d8d3ca_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_30%,transparent_85%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(255,255,255,0.6),transparent_70%)]"></div>
    <!-- Demo signature: faint monochrome top hairline, same motif premium cards use. -->
    <div class="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-[#1a1814]/25 to-transparent"></div>

    <div class="relative z-10 flex h-full flex-col">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1814] text-white shadow-[0_8px_20px_rgba(26,24,20,0.2)] transition-transform duration-300 group-hover:scale-105">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(d, i) in iconPaths" :key="i" :d="d" />
            </svg>
          </div>
          <h3 class="line-clamp-2 min-h-[3.5rem] text-2xl font-bold leading-tight tracking-[-0.02em] text-[#1a1814]">{{ demoTest.title }}</h3>
          <p class="mt-2 text-sm text-[#8a857c]">{{ demoTest.edition }}</p>
        </div>

        <div class="flex shrink-0 flex-col items-end gap-2">
          <span
            class="font-mono-custom inline-flex items-center gap-1.5 rounded-full border border-[#1a1814] bg-[#1a1814] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
          >
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 3v18M5 8l7-5 7 5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Namuna
          </span>
        </div>
      </div>

      <div class="mb-6 grid grid-cols-3 gap-3">
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Savollar</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ questionCount }}</p>
        </div>
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Bo‘limlar</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ sectionCount }}</p>
        </div>
        <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
          <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">Daqiqa</p>
          <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ durationMinutes }}</p>
        </div>
      </div>

      <div class="mt-auto">
        <button
          type="button"
          @click.stop="openDemo"
          class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1814] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(26,24,20,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_14px_36px_rgba(26,24,20,0.24)] active:scale-[0.98]"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1 1 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1 1 0 0 1 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          Namunani ochish
        </button>
      </div>
    </div>
  </article>
</template>
