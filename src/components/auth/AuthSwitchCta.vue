<script setup>
// Prominent login <-> register switcher. Users kept missing the old inline
// text link, so the action is a solid button identical to the page's primary
// one (h-11, rounded-full, #1a1814) on both mobile and desktop.
defineProps({
  question: { type: String, required: true },
  action: { type: String, required: true },
  to: { type: [String, Object], required: true },
})
</script>

<template>
  <div class="mt-6">
    <p class="mb-2.5 text-center text-[13px] font-medium text-[#6b6760]">{{ question }}</p>
    <router-link
      :to="to"
      class="flex h-11 w-full items-center justify-center rounded-full bg-[#1a1814] text-[15px] font-semibold text-white transition hover:bg-[#2b2b2b] active:scale-[0.99]"
    >
      {{ action }}
    </router-link>
  </div>
</template>
