<script setup>
// Testlar — the subject picker. Choosing a fan opens that subject's mock list
// at /testlar/:subject.
//
// NOT YET WIRED TO THE API. The per-subject counts below are the figures from
// the approved mockup, kept as placeholders until the endpoint lands.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import SubjectCard from '@/components/app/SubjectCard.vue'
import SkeletonBlock from '@/components/app/SkeletonBlock.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import { SUBJECT_ORDER } from '@/components/app/subjects.js'

defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

const route = useRoute()

// TODO(api): replace both with the real request state once GET /api/subjects
// exists. ?loading=1 and ?empty=1 preview the two states meanwhile.
const isLoading = computed(() => route.query.loading === '1')
const isEmpty = computed(() => route.query.empty === '1')

// TODO(api): GET /api/subjects — { key, testCount }
const TEST_COUNTS = {
  math: 120,
  motherTongue: 95,
  physics: 85,
  chemistry: 80,
  history: 110,
  geography: 70,
  english: 90,
  informatics: 75,
}

const subjects = computed(() =>
  isEmpty.value
    ? []
    : SUBJECT_ORDER.map((key) => ({ key, count: TEST_COUNTS[key] ?? null })),
)
</script>

<template>
  <AppTopbar
    title="Testlar"
    subtitle="Fanlardan test tanlang va bilimlaringizni sinang."
    :user="user"
    @open-menu="$emit('openMenu')"
  />

  <main>
    <AppCard>
      <h2 class="text-[18px] font-bold tracking-[-0.015em] text-app-ink">Fanlar</h2>

      <!-- Loading: the grid's own shape, so nothing shifts when the data lands -->
      <div
        v-if="isLoading"
        class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-hidden="true"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="flex flex-col items-center rounded-xl border border-app-border px-4 py-6"
        >
          <SkeletonBlock class="h-14 w-14 !rounded-full" />
          <SkeletonBlock class="mt-4 h-4 w-24" />
          <SkeletonBlock class="mt-3 h-3 w-full" />
          <SkeletonBlock class="mt-1.5 h-3 w-3/4" />
          <SkeletonBlock class="mt-6 h-3 w-16" />
        </div>
      </div>
      <p v-if="isLoading" class="sr-only" role="status">Fanlar yuklanmoqda</p>

      <!-- The system has no subjects — a different fact from "you have no tests" -->
      <EmptyState
        v-else-if="!subjects.length"
        icon="tests"
        title="Hozircha fan qo‘shilmagan"
        description="Fanlar qo‘shilgach, ular shu yerda ro‘yxatga chiqadi."
      />

      <div v-else class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <SubjectCard
          v-for="subject in subjects"
          :key="subject.key"
          :subject-key="subject.key"
          :count="subject.count"
        />
      </div>
    </AppCard>
  </main>
</template>
