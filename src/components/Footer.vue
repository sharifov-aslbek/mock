<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import logoMark from '@/assets/logo-removed.png'

const { t, tm } = useI18n()
const columns = computed(() => tm('footer.columns'))
const socials = ['f', 'in', '𝕏', '▶', '◎']
</script>

<template>
  <footer class="relative overflow-hidden bg-[#0d0c0a] px-4 pb-10 pt-16 text-[#a8a39a] sm:px-6 lg:px-8">
    <!-- Brand watermark -->
    <img
      :src="logoMark"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-16 -right-10 h-72 w-72 object-contain opacity-[0.04]"
    />

    <div class="relative mx-auto max-w-6xl">
      <div class="grid grid-cols-2 gap-8 pb-14 md:grid-cols-6">
        <div
          v-for="column in columns"
          :key="column.title"
        >
          <h4 class="mb-4 font-mono-custom text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {{ column.title }}
          </h4>
          <ul class="space-y-3 text-sm">
            <li
              v-for="link in column.links"
              :key="link"
            >
              <a href="#" class="text-[#a8a39a] transition-colors duration-200 hover:text-white">{{ link }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="mb-4 font-mono-custom text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {{ t('footer.contactTitle') }}
          </h4>
          <button
            class="w-full rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:border-white hover:bg-white hover:text-[#0d0c0a]"
          >
            {{ t('footer.contactButton') }}
          </button>
        </div>
      </div>

      <div class="h-px w-full bg-white/10"></div>

      <div class="flex flex-col items-center justify-between gap-8 pt-8 md:flex-row">
        <div class="flex items-center gap-3">
          <img :src="logoMark" alt="MilliyMock" class="h-9 w-auto object-contain" />
          <span class="text-xl font-bold tracking-[-0.02em] text-white">MilliyMock</span>
        </div>

        <div class="flex items-center gap-2.5">
          <a
            v-for="social in socials"
            :key="social"
            href="#"
            class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm text-[#a8a39a] transition duration-300 hover:border-white/30 hover:bg-white/5 hover:text-white"
          >
            {{ social }}
          </a>
        </div>
      </div>

      <div class="mt-8 border-t border-white/10 pt-8">
        <p class="mb-3 text-sm text-[#88837a]">
          {{ t('footer.copyright') }}
        </p>
        <p class="text-xs leading-relaxed text-[#615d56]">
          {{ t('footer.disclaimer') }}
        </p>
      </div>
    </div>
  </footer>
</template>
