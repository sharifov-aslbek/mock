<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MathTestCard from '@/components/MathTestCard.vue'

const activeTab = ref('all')
const selectedSort = ref('newest')
const { t, tm } = useI18n()
const tests = computed(() => tm('math.tests'))

const tabs = computed(() => [
  { id: 'all', name: t('math.tabs.all'), count: tests.value.length },
  { id: 'new', name: t('math.tabs.new'), count: tests.value.filter((test) => test.isNew).length },
  { id: 'free', name: t('math.tabs.free'), count: tests.value.filter((test) => test.isFree).length },
  { id: 'inProgress', name: t('math.tabs.inProgress'), count: tests.value.filter((test) => test.inProgress).length },
  { id: 'completed', name: t('math.tabs.completed'), count: tests.value.filter((test) => test.completed).length }
])

const filteredTests = computed(() => {
  let result = [...tests.value]

  if (activeTab.value === 'new') {
    result = result.filter((test) => test.isNew)
  } else if (activeTab.value === 'free') {
    result = result.filter((test) => test.isFree)
  } else if (activeTab.value === 'inProgress') {
    result = result.filter((test) => test.inProgress)
  } else if (activeTab.value === 'completed') {
    result = result.filter((test) => test.completed)
  }

  if (selectedSort.value === 'popular') {
    result.sort((a, b) => Number(b.peopleTook) - Number(a.peopleTook))
  } else if (selectedSort.value === 'score') {
    result.sort((a, b) => {
      const scoreA = Number.parseInt(a.lastScore, 10) || 0
      const scoreB = Number.parseInt(b.lastScore, 10) || 0
      return scoreB - scoreA
    })
  } else {
    result.sort((a, b) => b.order - a.order)
  }

  return result
})
</script>

<template>
  <section class="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">{{ t('math.eyebrow') }}</p>
          <h1 class="mt-3 text-4xl font-black tracking-tight text-black sm:text-5xl">
            {{ t('math.title') }}
          </h1>
          <p class="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            {{ t('math.description') }}
          </p>
        </div>

        <div class="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ t('math.subjectLabel') }}</p>
          <p class="mt-2 text-xl font-bold text-black">{{ t('math.subjectValue') }}</p>
        </div>
      </div>

      <div class="mb-8 flex flex-wrap gap-3">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition',
            activeTab === tab.id
              ? 'border-black bg-black text-white'
              : 'border-black/10 bg-white text-gray-700 hover:border-black hover:text-black'
          ]"
        >
          <span>{{ tab.name }}</span>
          <span
            :class="[
              'rounded-full px-2 py-0.5 text-xs',
              activeTab === tab.id ? 'bg-white/15 text-white' : 'bg-black/5 text-gray-500'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          {{ t('math.info') }}
        </div>

        <div class="w-full sm:w-auto">
          <select
            v-model="selectedSort"
            class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black shadow-sm outline-none transition focus:border-black sm:min-w-[240px]"
          >
            <option value="newest">{{ t('math.sort.newest') }}</option>
            <option value="popular">{{ t('math.sort.popular') }}</option>
            <option value="score">{{ t('math.sort.score') }}</option>
          </select>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MathTestCard
          v-for="test in filteredTests"
          :key="test.title"
          :test="test"
        />
      </div>

      <div
        v-if="filteredTests.length === 0"
        class="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-gray-500 shadow-sm"
      >
        {{ t('math.empty') }}
      </div>
    </div>
  </section>
</template>
