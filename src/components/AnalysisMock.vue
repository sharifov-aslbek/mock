<script setup>
// Live recreation of the "Natijalar tahlili" (results analysis) page, shown
// under the "Kuchaytirilgan analiz" tab. Pure CSS/SVG graphics — mirrors the
// real ExplanationPage: score ring, stat cards, breakdown bar, results table.
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'

const features = [
  {
    title: 'Ball tahlili',
    desc: 'Umumiy natijangizni bir qarashda ko‘ring',
    path: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM12 3.5v8.5l6 3',
  },
  {
    title: 'To‘g‘ri va noto‘g‘ri',
    desc: 'Har bir savol bo‘yicha batafsil ajratma',
    path: 'M5 12l4 4 10-10',
  },
  {
    title: 'Murakkablik darajasi',
    desc: 'Qaysi mavzular ustida ishlash kerakligini biling',
    path: 'M4 20V12M9.5 20V5M15 20v-5M20.5 20h-18',
  },
  {
    title: 'Tushuntirishlar',
    desc: 'Har bir savol uchun to‘liq yechim va izoh',
    path: 'M5 4.5h11l3 3v12h-14ZM9 9.5h6M9 13h6M9 16.5h3',
  },
]

// Score ring geometry (mirrors ExplanationPage: r=42, 84% filled).
const scorePercent = 84
const ringRadius = 42
const ringCirc = 2 * Math.PI * ringRadius
const ringOffset = ringCirc * (1 - scorePercent / 100)

const stats = [
  { label: 'To‘g‘ri', value: 38, percent: '84% to‘g‘ri', icon: 'check', bg: 'bg-[#e6efe6]', color: 'text-[#4f7a55]' },
  { label: 'Noto‘g‘ri', value: 7, percent: '16% noto‘g‘ri', icon: 'cross', bg: 'bg-[#f5e9e7]', color: 'text-[#b4564a]' },
]

const legend = [
  { color: 'bg-[#7ba382]', label: 'To‘g‘ri 38' },
  { color: 'bg-[#cf8b80]', label: 'Noto‘g‘ri 7' },
]

// Mirrors the real "Batafsil ko‘rib chiqish" table (minimised: 3 rows).
const answerClass = {
  correct: 'bg-green-50 text-green-600 font-semibold',
  incorrect: 'bg-rose-50 text-red-600 font-semibold',
  omitted: 'bg-[#f0ece4] text-[#a39e94] italic',
}
const levelClass = {
  Oson: 'bg-green-50 text-green-600',
  'O‘rta': 'bg-amber-50 text-amber-500',
  Qiyin: 'bg-rose-50 text-red-600',
}

const rows = [
  { order: 1, text: '\\(m=24^3\\cdot 6^{12}\\cdot 20^3\\) bo‘lsa, \\(\\dfrac{m^2}{2^n}\\) kasr qiymati natural son bo‘ladigan \\(n\\) ning eng katta…', correct: 'A', status: 'omitted', level: 'Qiyin' },
  { order: 2, text: '\\(a=\\lg 3,\\ b=\\cos 3,\\ c=\\ln 3\\) sonlari uchun quyidagini soddalashtiring:…', correct: 'C', yours: 'C', status: 'correct', level: 'Oson' },
  { order: 5, text: 'Soddalashtiring: \\(\\dfrac{(a^{-2})^3\\cdot(-a^2)^7}{(-a^3)^2}\\)', correct: 'C', yours: 'B', status: 'incorrect', level: 'O‘rta' },
]
</script>

<template>
  <div class="grid grid-cols-1 bg-[#f7f5f0] lg:grid-cols-[37%_63%]">
    <!-- ── Left: marketing ─────────────────────────────── -->
    <div class="flex flex-col justify-center px-8 py-6 sm:px-10 sm:py-7">
      <div class="flex h-10 w-10 items-center justify-center rounded-[12px] border-[1.5px] border-[#1a1814] text-[#1a1814]">
        <svg class="h-[19px] w-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 20V12M9.5 20V7M15 20v-9M20.5 20h-18" />
        </svg>
      </div>

      <h2 class="mt-5 text-[27px] font-bold leading-[1.04] tracking-[-0.035em] text-[#15130f] sm:text-[33px]">
        Natijalaringizni<br />chuqur<br />tahlil qiling
      </h2>
      <p class="mt-3.5 max-w-[18rem] text-[12.5px] leading-[1.55] text-[#7c776c]">
        Har bir testdan keyin to‘liq tahlil oling, xatolaringizni toping va kuchli tomonlaringizni rivojlantiring.
      </p>

      <ul class="mt-6 space-y-3.5">
        <li v-for="f in features" :key="f.title" class="flex items-start gap-3.5">
          <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#1a1814]">
            <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path :d="f.path" />
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
            <path d="M3.5 16l5-5 3.5 3.5L20.5 6M20.5 6h-4.5M20.5 6v4.5" />
          </svg>
        </span>
        <p class="text-[12px] font-medium leading-snug text-[#3a362f]">
          Aniq statistika va grafiklar bilan o‘sishingizni kuzating.
        </p>
      </div>
    </div>

    <!-- ── Right: analysis card ────────────────────────── -->
    <div class="p-4 sm:py-5 sm:pl-1 sm:pr-6">
      <div class="flex h-full flex-col rounded-[22px] bg-white px-6 pt-5 ring-1 ring-[#eeeae2] shadow-[0_26px_54px_-26px_rgba(26,24,20,0.22)] sm:px-7 sm:pt-6">
        <!-- header -->
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-[22px] font-bold leading-none tracking-[-0.02em] text-[#15130f]">Natijalar tahlili</h3>
            <p class="font-mono-custom mt-2 text-[10px] font-normal uppercase tracking-[0.2em] text-[#a8a298]">
              Special 1 &nbsp;&bull;&nbsp; Matematika
            </p>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#15130f] px-3.5 py-1.5 text-[12px] font-semibold text-white">
            <svg class="h-3 w-3 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Sertifikat
          </span>
        </div>

        <!-- score ring + stat cards + breakdown (mirrors real page) -->
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <!-- score ring -->
          <div class="flex shrink-0 flex-row items-center justify-center gap-4 rounded-2xl border border-[#ece8e0] px-6 py-4 sm:flex-col sm:gap-0">
            <div class="relative h-[88px] w-[88px]">
              <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" :r="ringRadius" fill="none" stroke="#ece8e0" stroke-width="7" />
                <circle
                  cx="50" cy="50" :r="ringRadius" fill="none" stroke="#1a1814" stroke-width="7"
                  stroke-linecap="round" :stroke-dasharray="ringCirc" :stroke-dashoffset="ringOffset"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-[18px] font-bold leading-none tracking-[-0.02em] text-[#1a1814]">{{ scorePercent }}%</span>
                <span class="mt-1 font-mono-custom text-[8px] uppercase tracking-[0.16em] text-[#a39e94]">Ball</span>
              </div>
            </div>
            <span class="font-mono-custom text-[9px] font-normal uppercase tracking-[0.18em] text-[#a8a298] sm:mt-2.5">Umumiy ball</span>
          </div>

          <!-- right column: stat cards + breakdown -->
          <div class="flex min-w-0 flex-1 flex-col gap-3">
            <div class="grid grid-cols-2 gap-3">
              <div v-for="s in stats" :key="s.label" class="flex flex-col justify-between rounded-2xl border border-[#ece8e0] px-4 py-3.5">
                <div class="flex items-start justify-between">
                  <span class="text-[11px] font-medium leading-tight text-[#a39e94]">{{ s.label }}</span>
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" :class="[s.bg, s.color]">
                    <svg v-if="s.icon === 'check'" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    <svg v-else class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" /></svg>
                  </span>
                </div>
                <div class="mt-2">
                  <span class="text-[30px] font-extrabold leading-none tracking-[-0.06em] text-[#1a1814]">{{ s.value }}</span>
                  <p class="mt-1 text-[10px] text-[#cbc5bb]">{{ s.percent }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-[#ece8e0] px-4 py-3.5">
              <div class="mb-2.5 flex items-center justify-between">
                <span class="text-[11px] font-medium text-[#a39e94]">Jami savollar</span>
                <span class="text-[13px] font-bold text-[#1a1814]">45 ta</span>
              </div>
              <div class="flex h-2 overflow-hidden rounded-full bg-[#ece8e0]">
                <span class="h-full bg-[#7ba382]" style="width: 84%"></span>
                <span class="h-full bg-[#cf8b80]" style="width: 16%"></span>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-3.5">
                <span v-for="l in legend" :key="l.label" class="flex items-center gap-1.5">
                  <span class="inline-block h-2 w-2 shrink-0 rounded-full" :class="l.color"></span>
                  <span class="text-[11px] text-[#a39e94]">{{ l.label }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- results table (mirrors "Batafsil ko‘rib chiqish") -->
        <div class="mt-4 flex-1 overflow-hidden rounded-2xl border border-[#ebebeb]">
          <div class="border-b border-[#f3f3f3] px-4 py-3.5">
            <h4 class="text-[15px] font-bold tracking-[-0.02em] text-[#0a0a0a]">Batafsil ko‘rib chiqish</h4>
            <p class="mt-0.5 text-[11px] text-[#cbc5bb]">45 ta savol ko‘rsatilmoqda</p>
          </div>
          <table class="w-full">
            <thead>
              <tr class="border-b border-[#ece8e0] bg-[#faf8f4] text-left text-[9px] font-semibold uppercase tracking-[0.6px] text-[#cbc5bb]">
                <th class="px-3 py-2.5">Savol</th>
                <th class="px-3 py-2.5">Mavzu</th>
                <th class="px-3 py-2.5">To‘g‘ri</th>
                <th class="px-3 py-2.5">Sizning javob</th>
                <th class="hidden px-3 py-2.5 sm:table-cell">Murakkablik</th>
                <th class="hidden px-3 py-2.5 text-center sm:table-cell">Amallar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in rows" :key="r.order" :class="i < rows.length - 1 ? 'border-b border-[#faf8f4]' : ''">
                <td class="px-3 py-3 align-top">
                  <span class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#faf8f4] px-1.5 text-[11px] font-semibold text-[#8a857c]">{{ r.order }}</span>
                </td>
                <td class="px-3 py-3 align-top">
                  <TestInlineMathText :text="r.text" wrapper-class="line-clamp-2 break-words text-[11.5px] leading-[1.4] text-[#6b6760]" />
                </td>
                <td class="px-3 py-3 align-top">
                  <span class="inline-flex rounded-full bg-[#f5f5f5] px-2.5 py-1 text-[11px] font-semibold text-[#0a0a0a]">{{ r.correct }}</span>
                </td>
                <td class="px-3 py-3 align-top">
                  <span class="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px]" :class="answerClass[r.status]">
                    {{ r.status === 'omitted' ? 'O‘tkazib yuborilgan' : r.yours }}
                  </span>
                </td>
                <td class="hidden px-3 py-3 align-top sm:table-cell">
                  <span class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold" :class="levelClass[r.level]">{{ r.level }}</span>
                </td>
                <td class="hidden px-3 py-3 text-center align-top sm:table-cell">
                  <div class="flex items-center justify-center gap-1.5">
                    <span class="inline-flex items-center gap-1 rounded-full border border-[#e0ddd7] px-2.5 py-1 text-[10px] text-[#bcb6a9]">
                      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0Z" stroke-linecap="round" stroke-linejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Ko‘rib
                    </span>
                    <span class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e0ddd7] text-[#bcb6a9]">
                      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M4 4v16" stroke-linecap="round" />
                        <path d="M4 5h10l-1.5 3L14 11H4" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="h-5"></div>
      </div>
    </div>
  </div>
</template>
