<script setup>
import { computed, ref } from 'vue'
import MathTestCard from '@/components/MathTestCard.vue'

const activeTab = ref('all')
const selectedSort = ref('newest')

const tests = [
  {
    title: 'Matematika testi #74',
    subject: 'Matematika',
    amount: '40 ta savol',
    peopleTook: '2811',
    lastScore: 'Ishlanmagan',
    type: 'Amaliy test',
    status: 'Yangi test',
    isFree: true,
    isNew: true,
    inProgress: false,
    completed: false,
    order: 74
  },
  {
    title: 'Algebra mashqi #73',
    subject: 'Matematika',
    amount: '32 ta savol',
    peopleTook: '156',
    lastScore: 'Ishlanmagan',
    type: 'Vaqtli sinov',
    status: '',
    isFree: false,
    isNew: true,
    inProgress: true,
    completed: false,
    order: 73
  },
  {
    title: 'Geometriya testi #72',
    subject: 'Matematika',
    amount: '28 ta savol',
    peopleTook: '181',
    lastScore: 'Ishlanmagan',
    type: 'Amaliy test',
    status: '',
    isFree: false,
    isNew: false,
    inProgress: false,
    completed: false,
    order: 72
  },
  {
    title: 'Funksiyalar to‘plami #71',
    subject: 'Matematika',
    amount: '35 ta savol',
    peopleTook: '1456',
    lastScore: '74%',
    type: 'Bepul test',
    status: 'Mashhur',
    isFree: true,
    isNew: false,
    inProgress: false,
    completed: true,
    order: 71
  },
  {
    title: 'Statistika laboratoriyasi #70',
    subject: 'Matematika',
    amount: '25 ta savol',
    peopleTook: '83',
    lastScore: 'Ishlanmagan',
    type: 'Amaliy test',
    status: '',
    isFree: false,
    isNew: false,
    inProgress: true,
    completed: false,
    order: 70
  },
  {
    title: 'Sinov imtihoni #69',
    subject: 'Matematika',
    amount: '50 ta savol',
    peopleTook: '1097',
    lastScore: '81%',
    type: 'To‘liq mock',
    status: 'Tavsiya etiladi',
    isFree: false,
    isNew: false,
    inProgress: false,
    completed: true,
    order: 69
  }
]

const tabs = computed(() => [
  { id: 'all', name: 'Barcha testlar', count: tests.length },
  { id: 'new', name: 'Yangi testlar', count: tests.filter((test) => test.isNew).length },
  { id: 'free', name: 'Bepul testlar', count: tests.filter((test) => test.isFree).length },
  { id: 'inProgress', name: 'Jarayonda', count: tests.filter((test) => test.inProgress).length },
  { id: 'completed', name: 'Tugallangan', count: tests.filter((test) => test.completed).length }
])

const filteredTests = computed(() => {
  let result = [...tests]

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
          <p class="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">Matematika markazi</p>
          <h1 class="mt-3 text-4xl font-black tracking-tight text-black sm:text-5xl">
            Matematika testlari
          </h1>
          <p class="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            O‘zingizga mos testni tanlang, darhol ishlashni boshlang yoki yechimlar va strategiyalarni
            muhokama qilish uchun suhbat bo‘limiga o‘ting.
          </p>
        </div>

        <div class="rounded-3xl border border-black/10 bg-white px-5 py-4 shadow-sm">
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Fan</p>
          <p class="mt-2 text-xl font-bold text-black">Matematika</p>
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
          Saralangan matematika testlari: amaliy mashqlar, bepul testlar va to‘liq mock imtihonlar.
        </div>

        <div class="w-full sm:w-auto">
          <select
            v-model="selectedSort"
            class="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black shadow-sm outline-none transition focus:border-black sm:min-w-[240px]"
          >
            <option value="newest">Saralash: yangi testlar</option>
            <option value="popular">Saralash: eng ko‘p ishlangan</option>
            <option value="score">Saralash: eng yuqori natija</option>
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
        Bu bo‘limda hozircha test topilmadi.
      </div>
    </div>
  </section>
</template>
