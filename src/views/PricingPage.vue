<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Testimonials from '@/components/Testimonials.vue'

const { t, tm } = useI18n()
const plans = computed(() => tm('pricing.plans'))
</script>

<template>
  <div
    class="min-h-screen bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16 font-sans flex flex-col items-center"
  >
    <div class="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
      <h1
        class="mb-4 text-3xl font-extrabold tracking-tight text-black sm:text-4xl lg:text-5xl"
      >
        {{ t('pricing.title') }}
      </h1>
      <p class="text-sm font-medium text-gray-500 sm:text-base lg:text-lg">
        {{ t('pricing.description') }}
      </p>
    </div>

    <button
      class="mb-12 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-in-out hover:bg-neutral-800 sm:mb-14 sm:px-7 sm:text-base lg:mb-16 lg:px-8"
    >
      {{ t('pricing.cta') }}
    </button>

    <div class="grid w-full max-w-6xl grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="(plan, index) in plans"
        :key="index"
        :class="[
          'flex h-full flex-col rounded-2xl border border-gray-100 p-5 shadow-sm transition-transform hover:-translate-y-1 sm:p-6 lg:p-8',
          plan.highlighted ? 'border-black bg-neutral-50' : 'bg-white'
        ]"
      >
        <h3 class="mb-4 text-xl font-bold text-black sm:text-2xl">
          {{ plan.name }}
        </h3>

        <div class="mb-2 flex items-baseline flex-wrap">
          <span class="text-3xl font-extrabold text-black sm:text-4xl">{{ plan.price }}</span>
          <span class="ml-1 text-xs font-bold text-black sm:text-sm">{{ plan.duration }}</span>
        </div>

        <p class="mb-6 text-xs font-bold leading-5 text-black sm:mb-8">
          {{ plan.setupFee }}
        </p>

        <ul class="flex-1 space-y-3 sm:space-y-4">
          <li
            v-for="(feature, fIndex) in plan.features"
            :key="fIndex"
            class="flex items-start"
          >
            <svg
              class="mr-3 mt-0.5 h-5 w-5 shrink-0 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm font-medium leading-6 text-gray-700 sm:text-base">
              {{ feature }}
            </span>
          </li>
        </ul>

        <button
          :class="[
            'mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition sm:mt-8',
            plan.highlighted
              ? 'border border-black bg-black text-white hover:bg-neutral-800'
              : 'border border-neutral-300 bg-white text-black hover:border-black hover:bg-neutral-100'
          ]"
        >
          {{ t('pricing.moreInfo') }}
        </button>
      </div>
    </div>

    <Testimonials />
  </div>
</template>
