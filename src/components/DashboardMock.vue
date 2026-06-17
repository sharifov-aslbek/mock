<script setup>
// Live, refined recreation of the dashboard preview (replaces the static PNG).
// Uses REAL "special 1" mock-test questions, rendered with the app's own math
// pipeline (TestInlineMathText) for accurate KaTeX output.
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'

const features = [
  {
    title: 'Sifatli testlar',
    desc: 'Maktab dasturiga to‘liq mos testlar',
    path: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 4a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z',
    dot: true,
  },
  {
    title: 'Vaqtni tejang',
    desc: 'Tezkor va qulay test ishlash tizimi',
    path: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 7.5v4.5l3 1.8',
  },
  {
    title: 'Natijalarni tahlil qiling',
    desc: 'To‘g‘ri va noto‘g‘ri javoblarni ko‘rib chiqing',
    path: 'M4 20V12M9.5 20V5M15 20v-5M20.5 20h-18',
  },
  {
    title: 'O‘sishingizni kuzating',
    desc: 'Har bir test orqali bilim darajangizni oshiring',
    path: 'M3.5 16l5-5 3.5 3.5L20.5 6M20.5 6h-4.5M20.5 6v4.5',
  },
]

// Verbatim from the special-1 canonical data.
const questions = [
  {
    order: 5,
    text: 'Hisoblang: \\(\\dfrac{\\sqrt{1^3+2^3+3^3+\\cdots+10^3}}{11}\\)',
    options: [
      { letter: 'A', text: '4' },
      { letter: 'B', text: '5', active: true },
      { letter: 'C', text: '6' },
      { letter: 'D', text: '3' },
    ],
  },
  {
    order: 7,
    text: "\\((2x^2+3x-5)(4x^2-x+2)\\) ko‘paytmani soddalashtirgandan keyin \\(x^2\\) li hadning oldidagi koeffitsiyentini toping.",
    options: [
      { letter: 'A', text: '-13' },
      { letter: 'B', text: '5' },
      { letter: 'C', text: '-25' },
      { letter: 'D', text: '-19', active: true },
    ],
  },
]
</script>

<template>
  <div class="grid grid-cols-1 bg-[#f7f5f0] lg:grid-cols-[37%_63%]">
    <!-- ── Left: marketing ─────────────────────────────── -->
    <div class="flex flex-col justify-center px-8 py-6 sm:px-10 sm:py-7">
      <div class="flex h-10 w-10 items-center justify-center rounded-[12px] border-[1.5px] border-[#1a1814] text-[#1a1814]">
        <svg class="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6.5" y="4" width="11" height="17" rx="2.4" />
          <path d="M9.5 4V3.2A1.2 1.2 0 0 1 10.7 2h2.6a1.2 1.2 0 0 1 1.2 1.2V4M9.4 11.3l1.3 1.3 2.5-2.7M9.4 16.1l1.3 1.3 2.5-2.7" />
        </svg>
      </div>

      <h2 class="mt-5 text-[27px] font-bold leading-[1.04] tracking-[-0.035em] text-[#15130f] sm:text-[33px]">
        Qulay muhitda<br />o‘zingizni<br />rivojlantiring
      </h2>
      <p class="mt-3.5 max-w-[18rem] text-[12.5px] leading-[1.55] text-[#7c776c]">
        Testlar orqali bilimlaringizni sinang, xatolaringiz ustida ishlang va maqsadlaringizga yaqinlashing.
      </p>

      <ul class="mt-6 space-y-3.5">
        <li v-for="f in features" :key="f.title" class="flex items-start gap-3.5">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#1a1814]">
            <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path :d="f.path" />
              <circle v-if="f.dot" cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span>
            <span class="block text-[13px] font-semibold leading-tight text-[#15130f]">{{ f.title }}</span>
            <span class="mt-0.5 block text-[12px] leading-snug text-[#9a958a]">{{ f.desc }}</span>
          </span>
        </li>
      </ul>

      <div class="mt-6 flex max-w-[20rem] items-center gap-3 rounded-2xl bg-white px-[14px] py-3 ring-1 ring-[#ece8e0]">
        <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-[#1a1814] text-white">
          <svg class="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </span>
        <p class="text-[12px] font-medium leading-snug text-[#3a362f]">
          Test ishlash uchun qulay, sodda va samarali muhit yaratilgan.
        </p>
      </div>
    </div>

    <!-- ── Right: floating test card ───────────────────── -->
    <div class="p-4 sm:py-5 sm:pl-1 sm:pr-6">
      <div class="flex h-full flex-col rounded-[22px] bg-white px-6 pt-5 ring-1 ring-[#eeeae2] shadow-[0_26px_54px_-26px_rgba(26,24,20,0.22)] sm:px-7 sm:pt-6">
        <!-- header -->
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-[22px] font-bold leading-none tracking-[-0.02em] text-[#15130f]">Special 1</h3>
            <p class="font-mono-custom mt-2 text-[10px] font-normal uppercase tracking-[0.2em] text-[#a8a298]">
              Mock test &nbsp;&bull;&nbsp; 44 savol
            </p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#15130f] px-3.5 py-1.5 text-[12px] font-semibold tabular-nums text-white">
            <svg class="h-3 w-3 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 1.8" />
            </svg>
            59:48
          </span>
        </div>

        <!-- A qism divider -->
        <div class="mt-4 flex items-center gap-4">
          <span class="h-px flex-1 bg-[#efebe3]"></span>
          <span class="font-mono-custom text-[9px] font-normal uppercase tracking-[0.3em] text-[#bcb6a9]">A qism</span>
          <span class="h-px flex-1 bg-[#efebe3]"></span>
        </div>

        <!-- questions -->
        <div class="flex-1 space-y-4 pt-4">
          <template v-for="(q, qi) in questions" :key="q.order">
            <span v-if="qi > 0" class="block h-px bg-[#f4f1ea]"></span>
            <div class="flex items-start gap-3.5">
              <span class="font-mono-custom min-w-[15px] text-[13px] font-semibold leading-[1.5] text-[#15130f]">{{ q.order }}.</span>
              <div class="min-w-0 flex-1">
                <TestInlineMathText
                  tag="p"
                  :text="q.text"
                  wrapper-class="text-[12.5px] leading-[1.6] text-[#27241e]"
                />
                <div class="mt-2.5 space-y-1.5">
                  <div v-for="o in q.options" :key="o.letter" class="flex items-center gap-3">
                    <span
                      class="font-mono-custom flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                      :class="o.active ? 'bg-[#15130f] text-white' : 'ring-[1.5px] ring-[#d6d1c7] text-[#15130f]'"
                    >{{ o.letter }}</span>
                    <TestInlineMathText
                      tag="span"
                      :text="o.text"
                      wrapper-class="text-[13px] font-medium text-[#27241e]"
                    />
                  </div>
                </div>
              </div>
              <button type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] text-[#bcb6a9] ring-1 ring-[#ece8e0]">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
                  <path d="M7 4.75h10v14.5l-5-3.25-5 3.25V4.75Z" />
                </svg>
              </button>
            </div>
          </template>
        </div>

        <!-- bottom bar -->
        <div class="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#efebe3] py-3">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#27241e] ring-1 ring-[#ece8e0]">
              <svg class="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </span>
            <p class="font-mono-custom text-[9.5px] font-normal uppercase tracking-[0.18em] text-[#a8a298]">0 / 44 javob berildi</p>
          </div>

          <button type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#27241e] ring-1 ring-[#ece8e0]">
            <svg class="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <button type="button" class="font-mono-custom rounded-[10px] bg-[#15130f] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
            Natijalar sahifasiga o‘tish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
