<script setup lang="ts">
defineProps<{
  name: string
  role: string
  text: string
}>()
</script>

<template>
  <div
    class="group relative flex h-full flex-col rounded-[24px] border border-[#e4e0d8] bg-white p-7 shadow-[0_6px_22px_rgba(26,24,20,0.04)] ring-1 ring-[#f0ece5] transition duration-300 hover:-translate-y-1.5 hover:border-[#d8d3ca] hover:shadow-[0_22px_46px_rgba(26,24,20,0.1)]"
  >
    <!-- Quote mark -->
    <span
      class="pointer-events-none absolute right-6 top-4 font-serif-custom text-6xl leading-none text-[#ece8e0] transition-colors duration-300 group-hover:text-[#e0dbd0]"
      aria-hidden="true"
    >
      &rdquo;
    </span>

    <p class="relative mb-6 flex-1 text-[15px] leading-7 text-[#3a362f]">
      {{ text }}
    </p>

    <div class="flex items-center gap-3.5">
      <div
        class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#e8e3da] bg-[#f5f3ef] font-mono-custom text-sm font-semibold uppercase text-[#6b6760]"
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
