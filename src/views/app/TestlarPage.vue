<script setup>
// Testlar — the subject picker, driven by the live catalogue.
//
// Only subjects the backend actually has published tests for appear here, so a
// student never opens a fan and finds nothing. Counts are real test counts.
import { computed, onMounted } from 'vue'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import SubjectCard from '@/components/app/SubjectCard.vue'
import SkeletonBlock from '@/components/app/SkeletonBlock.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import { useTestCatalogStore } from '@/stores/testCatalog'

defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

const catalog = useTestCatalogStore()

onMounted(() => {
  void catalog.load()
})

const subjects = computed(() => catalog.subjectsWithTests)

const errorCopy = computed(() =>
  catalog.errorKind === 'network'
    ? {
        title: 'Internetda uzilish bor',
        description: 'Ulanishni tekshiring va sahifani yangilang.',
      }
    : {
        title: 'Fanlarni yuklab bo‘lmadi',
        description: 'Biroz kuting va qayta urinib ko‘ring.',
      },
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
      <template v-if="catalog.isLoading && !catalog.hasLoaded">
        <div
          class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-hidden="true"
        >
          <div
            v-for="n in 6"
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
        <p class="sr-only" role="status">Fanlar yuklanmoqda</p>
      </template>

      <EmptyState
        v-else-if="catalog.errorKind"
        icon="close"
        :title="errorCopy.title"
        :description="errorCopy.description"
      />

      <!-- The system has no subjects — a different fact from "you have no tests" -->
      <EmptyState
        v-else-if="!subjects.length"
        icon="tests"
        title="Hozircha fan qo‘shilmagan"
        description="Testlar qo‘shilgach, fanlar shu yerda ro‘yxatga chiqadi."
      />

      <div v-else class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <SubjectCard
          v-for="entry in subjects"
          :key="entry.key"
          :subject-key="entry.key"
          :subject="entry.subject"
          :count="entry.count"
        />
      </div>
    </AppCard>
  </main>
</template>
