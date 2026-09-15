<script setup>
// Prominent login <-> register switcher. Users kept missing the old inline
// text link, so the action is a full-width button — but outlined, the auth
// pages' secondary style (as on /verify-phone), so it doesn't read as a second
// primary next to the form's solid submit.
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
      class="flex h-11 w-full items-center justify-center rounded-full border-[1.5px] border-[#1a1814] text-[15px] font-semibold text-[#1a1814] transition hover:bg-[#1a1814] hover:text-white active:scale-[0.99]"
    >
      {{ action }}
    </router-link>
  </div>
</template>
