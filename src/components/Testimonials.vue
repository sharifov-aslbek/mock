<script setup lang="ts">
import { computed } from 'vue'
import { NCarousel } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import TestimonialCard from './TestimonialCard.vue'

const { t, tm } = useI18n()
const testimonials = computed(() => tm('testimonials.items'))
</script>

<template>
  <section class="bg-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">
        {{ t('testimonials.title') }}
      </h2>

      <div class="hidden md:flex">
            <NCarousel
        draggable
        autoplay
        :interval="3000"
        :slides-per-view="3"
        :space-between="20"
        show-arrow
        dot-type="line"
      >
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="pb-4"
        >
          <TestimonialCard v-bind="t" />
        </div>
      </NCarousel>
      </div>

      <div class="flex md:hidden">
            <NCarousel
        draggable
        autoplay
        :interval="3000"
        :slides-per-view="1"
        :space-between="20"
        show-arrow
        dot-type="line"
      >
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="pb-4"
        >
          <TestimonialCard v-bind="t" />
        </div>
      </NCarousel>
      </div>
    </div>
  </section>
</template>
