<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FeatureCard from './FeatureCard.vue'

const { t, tm } = useI18n()
const cards = computed(() => tm('featureBlocks.cards'))
</script>

<template>
  <section class="bg-white py-14 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Title -->
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-14 lg:mb-16 max-w-3xl mx-auto">
        {{ t('featureBlocks.title') }}
      </h2>

      <!-- Grid -->
      <div class="grid gap-6 sm:gap-8 md:grid-cols-2">
        <FeatureCard
          v-for="card in cards"
          :key="card.title"
          :icon="card.icon"
          :title="card.title"
          :description="card.description"
        />
      </div>

    </div>
  </section>
</template>
