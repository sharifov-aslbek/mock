<script setup lang="ts">
// Decorative per-feature visual. Pure CSS/SVG, mono + cream palette.
defineProps<{
  variant: string
}>()
</script>

<template>
  <div class="mock-shell relative" aria-hidden="true">
    <!-- soft ground shadow -->
    <div class="pointer-events-none absolute -inset-4 -z-10 rounded-[32px] bg-[#e8e3da]/40 blur-2xl"></div>

    <!-- EXAM: real national-certificate question -->
    <div
      v-if="variant === 'exam'"
      class="rounded-[22px] border border-[#e8e3da] bg-white p-5 shadow-[0_18px_44px_rgba(26,24,20,0.08)] sm:p-6"
    >
      <div class="mb-4 flex items-center justify-between">
        <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">Milliy sertifikat</span>
        <span class="flex items-center gap-1.5 font-mono-custom text-[10px] font-semibold tracking-[0.1em] text-[#1a1814]">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>
          59:30
        </span>
      </div>
      <div class="mb-1.5 flex items-center gap-2">
        <span class="font-mono-custom text-[12px] font-bold text-[#1a1814]">12.</span>
        <span class="h-2.5 w-3/5 rounded-full bg-[#ece8e0]"></span>
      </div>
      <span class="mb-5 ml-7 block h-2.5 w-2/5 rounded-full bg-[#f0ece5]"></span>
      <div class="space-y-2.5">
        <div class="flex items-center gap-3 rounded-xl border border-[#1a1814] bg-[#1a1814] px-3.5 py-2.5">
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1814]">
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="h-2 w-1/2 rounded-full bg-white/70"></span>
        </div>
        <div v-for="i in 3" :key="i" class="flex items-center gap-3 rounded-xl border border-[#ece8e0] px-3.5 py-2.5">
          <span class="h-5 w-5 shrink-0 rounded-full border border-[#ddd8cf]"></span>
          <span class="h-2 rounded-full bg-[#ece8e0]" :class="i === 1 ? 'w-2/3' : i === 2 ? 'w-1/2' : 'w-3/5'"></span>
        </div>
      </div>
    </div>

    <!-- PRACTICE: self practice with instant feedback -->
    <div
      v-else-if="variant === 'practice'"
      class="rounded-[22px] border border-[#e8e3da] bg-white p-5 shadow-[0_18px_44px_rgba(26,24,20,0.08)] sm:p-6"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">Mashq · Algebra</span>
        <span class="font-mono-custom text-[11px] font-bold text-[#1a1814]">7 / 20</span>
      </div>
      <div class="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0ece5]">
        <span class="block h-full w-[35%] rounded-full bg-[#1a1814]"></span>
      </div>

      <div class="mb-1.5 flex items-center gap-2">
        <span class="font-mono-custom text-[12px] font-bold text-[#1a1814]">5.</span>
        <span class="h-2.5 w-2/3 rounded-full bg-[#ece8e0]"></span>
      </div>
      <span class="mb-4 ml-7 block h-2.5 w-1/3 rounded-full bg-[#f0ece5]"></span>

      <div class="space-y-2.5">
        <div class="flex items-center gap-3 rounded-xl border border-[#1a1814] bg-[#1a1814] px-3.5 py-2.5">
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1814]">
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="h-2 w-1/2 rounded-full bg-white/70"></span>
        </div>
        <div class="flex items-center gap-3 rounded-xl border border-[#ece8e0] px-3.5 py-2.5">
          <span class="h-5 w-5 shrink-0 rounded-full border border-[#ddd8cf]"></span>
          <span class="h-2 w-3/5 rounded-full bg-[#ece8e0]"></span>
        </div>
      </div>

      <div class="mt-5 flex items-center justify-between">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-[#e4e0d8] bg-[#f5f3ef] px-3 py-1.5 font-mono-custom text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1a1814]">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          To‘g‘ri
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-[#1a1814] px-4 py-2 font-mono-custom text-[11px] font-semibold tracking-[0.08em] text-white">
          Keyingi
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </div>
    </div>

    <!-- ANALYZE: mirrors the Natijalar Tahlili page -->
    <div
      v-else
      class="rounded-[22px] border border-[#e8e3da] bg-white p-5 shadow-[0_18px_44px_rgba(26,24,20,0.08)] sm:p-6"
    >
      <div class="mb-5 flex items-center justify-between">
        <span class="font-mono-custom text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">Natijalar tahlili</span>
        <span class="font-mono-custom text-[10px] font-medium tracking-[0.1em] text-[#bcb6a9]">Matematika · Mock2</span>
      </div>

      <!-- Score ring + stat chips -->
      <div class="flex items-center gap-5">
        <div class="relative h-[88px] w-[88px] shrink-0">
          <svg class="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f0ece5" stroke-width="9" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="#1a1814" stroke-width="9"
              stroke-linecap="round" stroke-dasharray="221.6 263.8"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-xl font-bold leading-none tracking-[-0.02em] text-[#1a1814]">84%</span>
            <span class="mt-1 font-mono-custom text-[8px] uppercase tracking-[0.16em] text-[#a39e94]">Ball</span>
          </div>
        </div>

        <div class="flex-1 space-y-2">
          <div class="flex items-center justify-between rounded-xl border border-[#ece8e0] px-3 py-2">
            <span class="flex items-center gap-2 font-mono-custom text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b6760]">
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-[#e6efe6] text-[#4f7a55]">
                <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              To‘g‘ri
            </span>
            <span class="text-sm font-bold text-[#1a1814]">38</span>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-[#ece8e0] px-3 py-2">
            <span class="flex items-center gap-2 font-mono-custom text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b6760]">
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-[#f5e9e7] text-[#b4564a]">
                <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/></svg>
              </span>
              Noto‘g‘ri
            </span>
            <span class="text-sm font-bold text-[#1a1814]">5</span>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-[#ece8e0] px-3 py-2">
            <span class="flex items-center gap-2 font-mono-custom text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b6760]">
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-[#f0ece5] text-[#a39e94]">
                <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M6 12h12" stroke-linecap="round"/></svg>
              </span>
              O‘tkazilgan
            </span>
            <span class="text-sm font-bold text-[#1a1814]">2</span>
          </div>
        </div>
      </div>

      <!-- Segmented breakdown bar -->
      <div class="mt-5">
        <div class="mb-2 flex items-center justify-between font-mono-custom text-[10px] uppercase tracking-[0.12em] text-[#8a857c]">
          <span>Jami savollar</span>
          <span class="font-bold text-[#1a1814]">45 ta</span>
        </div>
        <div class="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
          <span class="h-full rounded-l-full bg-[#7ba382]" style="width: 84%"></span>
          <span class="h-full bg-[#cf8b80]" style="width: 11%"></span>
          <span class="h-full rounded-r-full bg-[#ddd8cf]" style="width: 5%"></span>
        </div>
      </div>
    </div>
  </div>
</template>
