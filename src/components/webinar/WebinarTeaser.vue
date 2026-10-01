<script setup>
// One-line pointer under the score cards to the WebinarPromo video at the
// bottom of the results page. The answers table between them can run to ~45
// rows, so without this most students would never scroll far enough to see it.
// Temporary — see WebinarPromo.vue for how to take the campaign down.
function scrollToWebinar() {
  document.getElementById('webinar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <button
    type="button"
    class="mb-6 flex w-full items-center gap-3 rounded-2xl bg-[#1a1814] px-4 py-3 text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition hover:bg-[#2a2722] sm:px-5 sm:py-3.5"
    @click="scrollToWebinar"
  >
    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1814]">
      <svg class="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
      </svg>
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm font-semibold text-white">CEFR imtihoniga tayyorlanyapsizmi?</span>
      <span class="mt-0.5 block text-xs text-white/60">CEFR o‘qituvchisidan qisqa video — sahifa oxirida</span>
    </span>
    <span
      class="font-mono-custom hidden shrink-0 rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:inline-block"
    >
      Bepul vebinar
    </span>
    <svg class="h-4 w-4 shrink-0 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 5v14" stroke-linecap="round" />
      <path d="m6 13 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>
