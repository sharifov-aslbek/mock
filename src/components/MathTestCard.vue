<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  test: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
  >
    <div class="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70"></div>
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0.8),transparent_70%)]"></div>

    <div class="relative z-10 flex h-full flex-col">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white text-black shadow-sm">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold tracking-tight text-black">{{ test.title }}</h3>
          <p class="mt-2 text-sm text-gray-500">{{ test.subject }}</p>
        </div>

        <span
          :class="[
            'rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
            test.isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-black text-white'
          ]"
        >
          {{ test.isFree ? t('mathCard.free') : t('mathCard.premium') }}
        </span>
      </div>

      <div class="mb-6 flex flex-wrap gap-2">
        <span class="rounded-full border border-black/10 bg-white/90 px-3 py-1 text-xs font-medium text-gray-700">
          {{ test.type }}
        </span>
        <span
          v-if="test.status"
          class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
        >
          {{ test.status }}
        </span>
      </div>

      <div class="mb-6 grid grid-cols-2 gap-3">
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.amount') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.amount }}</p>
        </div>
        <div class="rounded-2xl border border-black/8 bg-white/90 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.people') }}</p>
          <p class="mt-3 text-2xl font-bold text-black">{{ test.peopleTook }}</p>
        </div>
      </div>

      <div class="mb-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-gray-400">{{ t('mathCard.lastResult') }}</p>
        <p class="mt-2 text-base font-semibold text-black">{{ test.lastScore }}</p>
      </div>

      <div class="mt-auto space-y-3">
        <router-link
          to="/test"
          class="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.752 11.168-4.586-2.65A1 1 0 0 0 8.667 9.39v5.22a1 1 0 0 0 1.499.872l4.586-2.65a1 1 0 0 0 0-1.664Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {{ t('mathCard.start') }}
        </router-link>

        <button
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-neutral-100"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h8M8 14h5m-9 6 2.4-2.4A2 2 0 0 0 7 16.2V7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H4Z" />
          </svg>
          {{ t('mathCard.discuss') }}
        </button>
      </div>
    </div>
  </article>
</template>
