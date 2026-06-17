<script setup lang="ts">
defineProps<{
  name: string
  role: string
  text: string
}>()
</script>

<template>
  <div
    class="group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[26px] border border-[#e8e3da] bg-white p-7 shadow-[0_6px_22px_rgba(26,24,20,0.04)] transition duration-300 hover:-translate-y-1.5 hover:border-[#d8d3ca] hover:shadow-[0_26px_52px_-12px_rgba(26,24,20,0.16)]"
  >
    <!-- top accent bar (revealed on hover) -->
    <span
      class="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#1a1814] to-[#6b6760] transition-transform duration-300 group-hover:scale-x-100"
      aria-hidden="true"
    ></span>

    <p class="relative mb-6 flex-1 text-[15px] leading-7 text-[#3a362f]">
      {{ text }}
    </p>

    <div class="relative mt-auto flex items-center gap-3.5 border-t border-[#f0ece5] pt-5">
      <div
        class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1a1814] to-[#5a554c] font-mono-custom text-sm font-semibold uppercase text-white shadow-[0_4px_12px_rgba(26,24,20,0.18)]"
      >
        {{ name?.charAt(0) }}
      </div>
      <div class="min-w-0">
        <h4 class="truncate text-[15px] font-bold text-[#1a1814]">{{ name }}</h4>
        <p class="truncate font-mono-custom text-[11px] uppercase tracking-[0.12em] text-[#8a857c]">
          {{ role }}
        </p>
      </div>
    </div>
  </div>
</template>
