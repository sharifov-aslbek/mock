<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MathTestCard from '@/components/MathTestCard.vue'
import { getTestApiBaseUrl } from '@/utils/api'

const { t } = useI18n()
const selectedSort = ref('newest')
const isLoading = ref(true)
const errorKey = ref('')
const rawTests = ref([])
const apiBaseUrl = getTestApiBaseUrl()

const fetchTests = async () => {
  isLoading.value = true
  errorKey.value = ''

  if (!apiBaseUrl) {
    errorKey.value = 'resultExam.errorConfig'
    isLoading.value = false
    return
  }

  try {
    const response = await fetch(`${apiBaseUrl}/test`, {
      headers: {
        accept: '*/*',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()
    rawTests.value = Array.isArray(payload.data) ? payload.data : []
  } catch (error) {
    console.error(error)
    errorKey.value = 'resultExam.errorFetch'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTests()
})

const attemptedTests = computed(() => {
  const tests = rawTests.value
    .filter((test) => Number(test.attemptCount) > 0)
    .map((test) => ({
      ...test,
      subject: t('math.subjectValue'),
    }))

  if (selectedSort.value === 'popular') {
    return tests.sort((a, b) => Number(b.attemptCount) - Number(a.attemptCount))
  }

  if (selectedSort.value === 'score') {
    return tests.sort((a, b) => Number(b.questionCount) - Number(a.questionCount))
  }

  return tests.sort((a, b) => Number(b.id) - Number(a.id))
})
</script>

<template>
  <section class="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-[1400px]">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            {{ t('resultExam.eyebrow') }}
          </p>
          <h1 class="mt-3 text-4xl font-black tracking-tight text-black sm:text-5xl">
            {{ t('resultExam.title') }}
          </h1>
          <p class="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            {{ t('resultExam.description') }}
          </p>
        </div>

        <div class="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
            {{ t('resultExam.totalLabel') }}
          </p>
          <p class="mt-2 text-xl font-bold text-black">{{ attemptedTests.length }}</p>
        </div>
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

      <div
        v-if="attemptedTests.length > 0"
        class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <MathTestCard
          v-for="test in attemptedTests"
          :key="test.id"
          :test="test"
          is-attempted-card
        />
      </div>

      <div
        v-if="isLoading"
        class="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-gray-500 shadow-sm"
      >
        {{ t('resultExam.loading') }}
      </div>

      <div
        v-else-if="errorKey"
        class="rounded-[28px] border border-dashed border-red-200 bg-red-50 px-6 py-12 text-center text-red-600 shadow-sm"
      >
        {{ t(errorKey) }}
      </div>

      <div
        v-else-if="attemptedTests.length === 0"
        class="rounded-[28px] border border-dashed border-black/15 bg-white px-6 py-12 text-center text-gray-500 shadow-sm"
      >
        {{ t('resultExam.empty') }}
      </div>
    </div>
  </section>
</template>
