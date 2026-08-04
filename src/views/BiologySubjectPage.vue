<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { biologyDemoTest } from '@/data/biologyDemoTest'
import { subjectIcon } from '@/utils/subjects'

// Biology's subject page — the same layout every subject uses (SubjectPage.vue),
// but its tests are the local sample (no backend seeding yet). The card starts
// the full-screen test at /biologiya/test. When the backend is seeded for
// subject 2, this can switch to the shared SubjectPage + MathTestCard flow.
const { t } = useI18n()
const router = useRouter()

const icon = subjectIcon('biology')

const tests = [
  {
    id: biologyDemoTest.id,
    title: 'Biologiya — Milliy Sertifikat namunaviy test',
    questionCount: biologyDemoTest.questions.length,
    attemptCount: 1240,
    to: '/biologiya/test',
  },
]

const subjectValue = computed(() => t('subjects.biology.subjectValue'))

const startTest = (test) => router.push(test.to)
</script>

<template>
  <section
    class="relative min-h-screen overflow-hidden bg-[#f5f3ef] px-4 py-8 selection:bg-black selection:text-white sm:px-6 sm:py-16 lg:px-8"
  >
    <div class="math-dots absolute inset-0 -z-20"></div>
    <div class="absolute inset-0 -z-10 bg-gradient-to-b from-[#f5f3ef]/30 via-[#f5f3ef]/70 to-[#f5f3ef]"></div>
    <div class="math-blob blob-a absolute -left-20 top-10 h-[360px] w-[360px] rounded-full bg-[#e6e1d7]/50 blur-3xl"></div>
    <div class="math-blob blob-b absolute -right-24 top-40 h-[320px] w-[320px] rounded-full bg-[#ebe7e0]/60 blur-3xl"></div>
    <div class="math-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

    <div class="relative z-10 mx-auto max-w-[1400px]">
      <div class="mb-6 flex flex-col gap-4 sm:mb-10 sm:gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div class="max-w-3xl animate-[fadeInUp_.7s_ease-out]">
          <div class="mb-4 flex items-center gap-3 sm:mb-5">
            <span class="font-mono-custom text-[11px] font-semibold tracking-[0.22em] text-[#bcb6a9]">01</span>
            <span class="h-px w-8 bg-[#d8d3ca]"></span>
            <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a857c]">
              {{ t('subjects.biology.eyebrow') }}
            </span>
          </div>
          <h1 class="text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1814] sm:text-5xl md:text-6xl">
            {{ t('subjects.biology.title') }}
          </h1>
        </div>

        <!-- Subject card -->
        <div class="group relative shrink-0 animate-[fadeInUp_.9s_ease-out] overflow-hidden rounded-[22px] border border-[#e0ddd7] bg-gradient-to-br from-white/90 via-white/70 to-[#f1ede5]/60 px-5 py-4 shadow-[0_12px_36px_rgba(26,24,20,0.08)] backdrop-blur-md transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(26,24,20,0.12)] sm:rounded-[26px] sm:px-7 sm:py-6 lg:min-w-[240px]">
          <div class="absolute inset-0 bg-[radial-gradient(circle,#d8d3ca_1px,transparent_1px)] bg-[size:18px_18px] opacity-40 [mask-image:radial-gradient(ellipse_70%_80%_at_85%_15%,#000,transparent_75%)]"></div>
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
          <div class="relative flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1a1814] text-white shadow-[0_8px_20px_rgba(26,24,20,0.2)] transition-transform duration-500 group-hover:scale-105">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(d, i) in icon.paths" :key="i" :d="d" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="h-1.5 w-1.5 rounded-full bg-[#1a1814]"></span>
                <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a857c]">{{ t('math.subjectLabel') }}</p>
              </div>
              <p class="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ subjectValue }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Test cards -->
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="(test, index) in tests"
          :key="test.id"
          class="card-enter group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white/80 p-6 shadow-[0_10px_30px_rgba(26,24,20,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#d8d3ca] hover:shadow-[0_20px_50px_rgba(26,24,20,0.12)]"
          :style="{ animationDelay: Math.min(index, 12) * 55 + 'ms' }"
        >
          <div class="absolute inset-0 bg-[radial-gradient(circle,#d8d3ca_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_30%,transparent_85%)]"></div>
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(255,255,255,0.6),transparent_70%)]"></div>

          <div class="relative z-10 flex h-full flex-col">
            <div class="mb-6">
              <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1814] text-white shadow-[0_8px_20px_rgba(26,24,20,0.2)] transition-transform duration-300 group-hover:scale-105">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-for="(d, i) in icon.paths" :key="i" :d="d" />
                </svg>
              </div>
              <h3 class="line-clamp-2 min-h-[3.5rem] text-2xl font-bold leading-tight tracking-[-0.02em] text-[#1a1814]">{{ test.title }}</h3>
            </div>

            <div class="mb-6 grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
                <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ t('mathCard.amount') }}</p>
                <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ test.questionCount }}</p>
              </div>
              <div class="rounded-2xl border border-[#e0ddd7] bg-[#faf9f6] p-4">
                <p class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">{{ t('mathCard.people') }}</p>
                <p class="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#1a1814]">{{ test.attemptCount }}</p>
              </div>
            </div>

            <div class="mt-auto">
              <button
                type="button"
                @click="startTest(test)"
                class="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1814] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(26,24,20,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_14px_36px_rgba(26,24,20,0.24)] active:scale-[0.98]"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.752 11.168-4.586-2.65A1 1 0 0 0 8.667 9.39v5.22a1 1 0 0 0 1.499.872l4.586-2.65a1 1 0 0 0 0-1.664Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {{ t('mathCard.start') }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.math-dots {
  background-image: radial-gradient(circle, #d8d3ca 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 30%, transparent 80%);
  mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, #000 30%, transparent 80%);
  opacity: 0.5;
}
.math-grain {
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.card-enter { opacity: 0; animation: fadeInUp 0.6s ease-out forwards; }
.blob-a { animation: drift-a 18s ease-in-out infinite; }
.blob-b { animation: drift-b 22s ease-in-out infinite; }
@keyframes drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(28px, 22px) scale(1.06); }
}
@keyframes drift-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 26px) scale(1.05); }
}
@media (prefers-reduced-motion: reduce) {
  .math-blob { animation: none; }
  .card-enter { opacity: 1; animation: none; }
}
</style>
