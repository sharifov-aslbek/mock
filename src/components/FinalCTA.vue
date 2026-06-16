<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="bg-[#f5f3ef] px-4 pb-24 pt-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <div
        class="relative overflow-hidden rounded-[32px] bg-[#1a1814] px-8 py-14 shadow-[0_30px_70px_rgba(26,24,20,0.28)] sm:px-14 sm:py-16"
      >
        <!-- Ambient detail -->
        <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.06] blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl"></div>
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.05]"
          style="background-image: radial-gradient(circle, #ffffff 1px, transparent 1px); background-size: 22px 22px;"
        ></div>

        <div class="relative flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div class="max-w-xl">
            <span class="mb-4 inline-block font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
              MilliyMock
            </span>
            <h2 class="text-3xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-4xl">
              {{ t('finalCta.title') }}
            </h2>
          </div>

          <button
            type="button"
            class="group inline-flex h-[54px] flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-9 text-[15px] font-semibold text-[#1a1814] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f5f3ef] active:scale-[0.98]"
          >
            {{ t('finalCta.button') }}
            <svg
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
