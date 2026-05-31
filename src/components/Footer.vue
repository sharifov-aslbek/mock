<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import logoWhite from '@/assets/logo-white.jpg'

const { t, tm } = useI18n()
const columns = computed(() => tm('footer.columns'))
</script>

<template>
  <footer class="bg-black text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
        <div
          v-for="column in columns"
          :key="column.title"
        >
          <h4 class="font-bold text-white mb-4">{{ column.title }}</h4>
          <ul class="space-y-3 text-sm">
            <li
              v-for="link in column.links"
              :key="link"
            >
              <a href="#" class="hover:text-white transition">{{ link }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-bold text-white mb-4">{{ t('footer.contactTitle') }}</h4>
          <button class="border-2 border-green-400 text-green-400 px-4 py-2 rounded text-sm font-medium hover:bg-green-400 hover:text-slate-950 transition w-full">
            {{ t('footer.contactButton') }}
          </button>
        </div>

      </div>

      <div class="border-t border-gray-700 mb-8"></div>

      <div class="flex flex-col md:flex-row items-center justify-between gap-8">
        <div class="flex items-center gap-3">
          <img :src="logoWhite" :alt="t('footer.brand')" class="h-10 w-auto object-contain" />
          <span class="text-2xl font-bold text-white">MilliyMock</span>
        </div>

        <div class="flex items-center space-x-6 text-gray-400">
          <a href="#" class="hover:text-white transition">f</a>
          <a href="#" class="hover:text-white transition">in</a>
          <a href="#" class="hover:text-white transition">𝕏</a>
          <a href="#" class="hover:text-white transition">▶</a>
          <a href="#" class="hover:text-white transition">📷</a>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-700">
        <p class="text-sm text-gray-500 mb-4">
          {{ t('footer.copyright') }}
        </p>

        <p class="text-xs text-gray-600 leading-relaxed">
          {{ t('footer.disclaimer') }}
        </p>
      </div>

    </div>
  </footer>
</template>
