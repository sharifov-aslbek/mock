<script setup>
// The window chrome around the screenshot on the Platforma page.
//
// Drawn in CSS rather than baked into the capture: one change restyles it, the
// URL stays real text rather than pixels, and the screenshot itself stays a
// plain capture that can be re-taken and dropped in without re-compositing a
// frame around it.
//
// The window sits square to the page — the depth comes only from the shadows.
defineProps({
  url: { type: String, default: 'milliymock.uz' },
})
</script>

<template>
  <!-- Three stacked shadows rather than one: a hairline contact shadow that
       seats the window on the page, a mid one for body, and a wide soft cast
       for the lift off the background. All warm-black (17,15,14) — a neutral
       shadow goes grey and dead against the cream. -->
  <div
    class="overflow-hidden rounded-[16px] border border-hairline bg-white sm:rounded-[20px]
           shadow-[0_1px_2px_rgba(17,15,14,0.05),0_14px_28px_-12px_rgba(17,15,14,0.12),0_54px_90px_-38px_rgba(17,15,14,0.30)]"
  >
    <!-- The inset white line along the top of the bar is the lit edge of the
         bezel; it gives the frame a thickness the flat border alone did not. -->
    <div
      class="flex items-center gap-[12px] border-b border-hairline bg-cream px-[14px] py-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-[18px] sm:py-[13px]"
    >
      <div class="flex shrink-0 gap-[6px] sm:gap-[7px]" aria-hidden="true">
        <span class="h-[9px] w-[9px] rounded-full bg-[#ec6a5e] sm:h-[11px] sm:w-[11px]"></span>
        <span class="h-[9px] w-[9px] rounded-full bg-[#f4bf4f] sm:h-[11px] sm:w-[11px]"></span>
        <span class="h-[9px] w-[9px] rounded-full bg-[#61c454] sm:h-[11px] sm:w-[11px]"></span>
      </div>

      <div
        class="mx-auto flex w-full max-w-[340px] items-center justify-center gap-[7px] rounded-full bg-white px-[14px] py-[5px] text-[11px] text-muted shadow-[inset_0_1px_2px_rgba(17,15,14,0.05)] sm:text-[12.5px]"
      >
        <svg
          class="h-[11px] w-[11px] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          aria-hidden="true"
        >
          <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" stroke-linecap="round" />
        </svg>
        <span class="truncate">{{ url }}</span>
      </div>

      <!-- Window menu. Balances the traffic lights so the URL pill sits
           optically centred, and reads as a browser rather than a bare bar. -->
      <span class="hidden w-[45px] shrink-0 justify-end gap-[3px] sm:flex" aria-hidden="true">
        <span class="h-[3px] w-[3px] rounded-full bg-hairline-strong"></span>
        <span class="h-[3px] w-[3px] rounded-full bg-hairline-strong"></span>
        <span class="h-[3px] w-[3px] rounded-full bg-hairline-strong"></span>
      </span>
    </div>

    <slot />
  </div>
</template>
