<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import heroImage from '@/assets/hero.jpg'
import testImage from '@/assets/test.jpg'

const { t } = useI18n()

const activeTab = ref(0)
const currentImage = computed(() => (activeTab.value === 0 ? heroImage : testImage))
</script>

<template>
  <section class="bg-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-12">
        {{ t('productShowcase.title') }}
      </h2>

      <!-- Tabs -->
      <div class="flex justify-center mb-10 sm:mb-12">
        <div class="bg-gray-200 rounded-full p-2 flex items-center gap-2">
          <button
            type="button"
            class="px-6 sm:px-10 py-3 rounded-full font-semibold text-sm sm:text-base transition"
            :class="activeTab === 0 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-800 hover:bg-white/60'"
            @click="activeTab = 0"
          >
            {{ t('productShowcase.sat') }}
          </button>
          <button
            type="button"
            class="px-6 sm:px-10 py-3 rounded-full font-semibold text-sm sm:text-base transition"
            :class="activeTab === 1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-800 hover:bg-white/60'"
            @click="activeTab = 1"
          >
            {{ t('productShowcase.act') }}
          </button>
        </div>
      </div>

      <!-- Browser Mockup -->
      <div class="rounded-[28px] bg-gray-100 border border-gray-200 p-3 sm:p-4 shadow-lg">
        <div class="overflow-hidden rounded-[22px] bg-white border border-gray-200">
          <!-- Browser Top Bar -->
          <div class="h-14 sm:h-16 border-b border-gray-200 bg-[#fafafa] flex items-center px-4 sm:px-6">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-400"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span class="w-3 h-3 rounded-full bg-green-400"></span>
            </div>

            <div class="mx-auto hidden md:flex w-full max-w-md">
              <div class="w-full bg-white border border-gray-200 rounded-full h-10 flex items-center justify-center text-sm text-gray-400">
                https://milliymock.uz/dashboard
              </div>
            </div>
          </div>

          <!-- Image Place -->
          <div class="aspect-[16/9] bg-gray-50">
            <img
              :src="currentImage"
              :alt="t('productShowcase.title')"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
