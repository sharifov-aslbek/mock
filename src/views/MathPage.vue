<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MathTestCard from '@/components/MathTestCard.vue'

const activeTab = ref('all')
const selectedSort = ref('newest')
const isLoading = ref(true)
const errorKey = ref('')
const rawTests = ref([])
const { t } = useI18n()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const fetchTests = async () => {
  isLoading.value = true
  errorKey.value = ''

  if (!apiBaseUrl) {
    errorKey.value = 'math.errorConfig'
    isLoading.value = false
    return
  }

  try {
    const response = await fetch(`${apiBaseUrl}/test`, {
      headers: {
        accept: '*/*'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    rawTests.value = Array.isArray(payload.data) ? payload.data : []
  } catch (error) {
    console.error(error)
    errorKey.value = 'math.errorFetch'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchTests)

const tests = computed(() =>
  rawTests.value.map((test) => ({
    ...test,
    subject: t('math.subjectValue')
  }))
)

const tabs = computed(() => [
  { id: 'all', name: t('math.tabs.all'), count: tests.value.length },
  {
    id: 'notStarted',
    name: t('math.tabs.notStarted'),
    count: tests.value.filter((test) => Number(test.attemptCount) === 0).length
  },
  {
    id: 'attempted',
    name: t('math.tabs.attempted'),
    count: tests.value.filter((test) => Number(test.attemptCount) > 0).length
  }
])

const filteredTests = computed(() => {
  let result = [...tests.value]

  if (activeTab.value === 'notStarted') {
    result = result.filter((test) => Number(test.attemptCount) === 0)
  } else if (activeTab.value === 'attempted') {
    result = result.filter((test) => Number(test.attemptCount) > 0)
  }

  if (selectedSort.value === 'popular') {
    result.sort((a, b) => Number(b.attemptCount) - Number(a.attemptCount))
  } else if (selectedSort.value === 'score') {
    result.sort((a, b) => Number(b.questionCount) - Number(a.questionCount))
  } else {
    result.sort((a, b) => Number(b.id) - Number(a.id))
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

      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
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
          :key="test.id"
          :test="test"
        />
      </div>

      <div
        v-if="isLoading"
        class="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-gray-500 shadow-sm"
      >
        {{ t('math.loading') }}
      </div>

      <div
        v-else-if="errorKey"
        class="rounded-[28px] border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center text-red-600 shadow-sm"
      >
        {{ t(errorKey) }}
      </div>

      <div
        v-else-if="filteredTests.length === 0"
        class="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-gray-500 shadow-sm"
      >
        {{ t('math.empty') }}
      </div>
    </div>
  </section>
</template>
