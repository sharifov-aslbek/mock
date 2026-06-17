<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppReveal from './AppReveal.vue'
import DashboardMock from './DashboardMock.vue'
import AnalysisMock from './AnalysisMock.vue'

const { t } = useI18n()

const activeTab = ref(0)
</script>

<template>
  <section class="bg-[#f5f3ef] px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <AppReveal class="mx-auto mb-12 max-w-3xl text-center">
        <div class="mb-5 flex items-center justify-center gap-3">
          <span class="font-mono-custom text-[11px] font-semibold tracking-[0.22em] text-[#bcb6a9]">02</span>
          <span class="h-px w-8 bg-[#d8d3ca]"></span>
          <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a857c]">
            {{ t('sections.platform') }}
          </span>
        </div>
        <h2 class="text-3xl font-bold tracking-[-0.02em] text-[#1a1814] sm:text-4xl">
          {{ t('productShowcase.title') }}
        </h2>
      </AppReveal>

      <!-- Tabs -->
      <div class="mb-12 flex justify-center">
        <div
          class="inline-flex items-center gap-1 rounded-full border border-[#e4e0d8] bg-white/70 p-1.5 shadow-[0_4px_16px_rgba(26,24,20,0.05)] backdrop-blur-sm"
        >
          <button
            type="button"
            class="whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold transition duration-300 sm:px-10 sm:text-sm"
            :class="activeTab === 0 ? 'bg-[#1a1814] text-white shadow-[0_6px_18px_rgba(26,24,20,0.22)]' : 'text-[#6b6760] hover:text-[#1a1814]'"
            @click="activeTab = 0"
          >
            {{ t('productShowcase.act') }}
          </button>
          <button
            type="button"
            class="whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold transition duration-300 sm:px-10 sm:text-sm"
            :class="activeTab === 1 ? 'bg-[#1a1814] text-white shadow-[0_6px_18px_rgba(26,24,20,0.22)]' : 'text-[#6b6760] hover:text-[#1a1814]'"
            @click="activeTab = 1"
          >
            {{ t('productShowcase.sat') }}
          </button>
        </div>
      </div>

      <!-- Browser Mockup -->
      <div
        class="overflow-hidden rounded-[28px] border border-[#e0ddd7] bg-white/80 p-3 shadow-[0_24px_60px_rgba(26,24,20,0.1)] ring-1 ring-[#ebe7e0] backdrop-blur-sm sm:rounded-[32px] sm:p-4"
      >
        <div class="overflow-hidden rounded-[20px] border border-[#ebe7e0] bg-white sm:rounded-[24px]">
          <!-- Browser Top Bar -->
          <div class="flex h-14 items-center border-b border-[#ebe7e0] bg-[#faf8f4] px-4 sm:h-16 sm:px-6">
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-[#e0a3a3]"></span>
              <span class="h-3 w-3 rounded-full bg-[#e4c98a]"></span>
              <span class="h-3 w-3 rounded-full bg-[#a7c9a7]"></span>
            </div>

            <div class="mx-auto hidden w-full max-w-md md:flex">
              <div
                class="flex h-9 w-full items-center justify-center gap-2 rounded-full border border-[#ebe7e0] bg-white font-mono-custom text-[12px] tracking-[0.04em] text-[#8a857c]"
              >
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke-linecap="round" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round" />
                </svg>
                milliymock.uz/dashboard
              </div>
            </div>
          </div>

          <!-- Live dashboard mock -->
          <DashboardMock v-if="activeTab === 0" />
          <AnalysisMock v-else />
        </div>
      </div>
    </div>
  </section>
</template>
