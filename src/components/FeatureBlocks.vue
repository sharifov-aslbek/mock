<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FeatureRow from './FeatureRow.vue'
import AppReveal from './AppReveal.vue'

const { t, tm } = useI18n()
const cards = computed(() => tm('featureBlocks.cards') as Array<Record<string, string>>)

const meta = [
  { iconKey: 'exam', tag: 'Milliy sertifikat' },
  { iconKey: 'practice', tag: 'Mashq rejimi' },
  { iconKey: 'analyze', tag: 'Tahlil · Yechim' },
]
const metaFor = (index: number) => meta[index] ?? meta[0]
</script>

<template>
  <section id="main-features" class="scroll-mt-20 bg-[#f5f3ef] px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <!-- Eyebrow + Title + Subtitle -->
      <AppReveal class="mx-auto mb-16 max-w-3xl text-center sm:mb-24">
        <div class="mb-5 flex items-center justify-center gap-3">
          <span class="font-mono-custom text-[11px] font-semibold tracking-[0.22em] text-[#bcb6a9]">01</span>
          <span class="h-px w-8 bg-[#d8d3ca]"></span>
          <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a857c]">
            {{ t('sections.features') }}
          </span>
        </div>
        <h2
          class="text-3xl font-bold leading-tight tracking-[-0.02em] text-[#1a1814] sm:text-4xl md:text-[2.6rem]"
        >
          {{ t('featureBlocks.title') }}
        </h2>
        <p class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#6b6760] sm:text-lg">
          {{ t('featureBlocks.subtitle') }}
        </p>
      </AppReveal>

      <!-- Alternating feature rows -->
      <div class="space-y-20 sm:space-y-28">
        <FeatureRow
          v-for="(card, index) in cards"
          :key="card.title"
          :index="index"
          :icon-key="metaFor(index).iconKey"
          :tag="metaFor(index).tag"
          :title="card.title"
          :description="card.description"
          :reversed="index % 2 === 1"
        />
      </div>
    </div>
  </section>
</template>
