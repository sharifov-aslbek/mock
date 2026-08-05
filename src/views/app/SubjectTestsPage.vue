<script setup>
// One subject's mock list, from the live catalogue. The row states — and so the
// filters — come from the signed-in user's own attempt history.
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import TestRow from '@/components/app/TestRow.vue'
import SkeletonBlock from '@/components/app/SkeletonBlock.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import TestLaunchDialogs from '@/components/app/TestLaunchDialogs.vue'
import ProfileGateModal from '@/components/ProfileGateModal.vue'
import { SUBJECTS, unknownSubject } from '@/components/app/subjects.js'
import { useTestCatalogStore } from '@/stores/testCatalog'
import { useTestLauncher } from '@/composables/useTestLauncher'

defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

const route = useRoute()
const router = useRouter()
const catalog = useTestCatalogStore()

// Destructured so the template auto-unwraps the refs.
const {
  pending: launchTest,
  dialog: launchDialog,
  busyTestId,
  errorMessage: launchError,
  cost: launchCost,
  balance: launchBalance,
  open: openTest,
  confirm: confirmLaunch,
  close: closeLaunch,
  goToTopUp,
  showProfileGate,
  onProfileCompleted,
  onProfileCancel,
} = useTestLauncher()

onMounted(() => {
  void catalog.load()
})

const subjectKey = computed(() => String(route.params.subject || ''))
const subject = computed(() => {
  if (SUBJECTS[subjectKey.value]) return SUBJECTS[subjectKey.value]
  // A subject the registry does not know, carried through by the catalogue.
  if (subjectKey.value.startsWith('raw:')) return unknownSubject(subjectKey.value.slice(4))
  return null
})

const allTests = computed(() => catalog.testsForSubject(subjectKey.value))

// A test in progress is neither "ishlanmagan" nor "yakunlangan", so it gets its
// own filter rather than being folded into one of them.
const FILTERS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'new', label: 'Ishlanmagan' },
  { key: 'progress', label: 'Yechilmoqda' },
  { key: 'done', label: 'Yakunlangan' },
]

const activeFilter = computed(() => {
  const wanted = String(route.query.holat || 'all')
  return FILTERS.some((f) => f.key === wanted) ? wanted : 'all'
})

const setFilter = (key) => {
  const query = { ...route.query }
  if (key === 'all') delete query.holat
  else query.holat = key
  router.replace({ query })
}

const tests = computed(() =>
  activeFilter.value === 'all'
    ? allTests.value
    : allTests.value.filter((test) => test.state === activeFilter.value),
)

const emptyCopy = computed(() => {
  // Different facts, different sentences.
  if (!allTests.value.length) {
    return {
      title: 'Bu fandan test qo‘shilmagan',
      description: 'Testlar qo‘shilgach, ular shu yerda ochiladi.',
    }
  }
  return {
    all: { title: '', description: '' },
    new: {
      title: 'Ishlanmagan test qolmadi',
      description: 'Bu fandagi barcha testlarni ochib bo‘lgansiz.',
    },
    progress: {
      title: 'Yarim yechilgan test yo‘q',
      description: 'Tugatilmagan testlar shu yerda kutib turadi.',
    },
    done: {
      title: 'Hali test yakunlamagansiz',
      description: 'Yechib bo‘lgan testlaringiz shu yerda to‘planadi.',
    },
  }[activeFilter.value]
})

const errorCopy = computed(() =>
  catalog.errorKind === 'network'
    ? { title: 'Internetda uzilish bor', description: 'Ulanishni tekshiring va qayta urinib ko‘ring.' }
    : { title: 'Testlarni yuklab bo‘lmadi', description: 'Biroz kuting va qayta urinib ko‘ring.' },
)
</script>

<template>
  <AppTopbar
    :title="subject ? subject.fullLabel || subject.label : 'Fan topilmadi'"
    :subtitle="subject ? subject.description : ''"
    back-to="/testlar"
    back-label="Fanlar"
    :user="user"
    @open-menu="$emit('openMenu')"
  />

  <main>
    <AppCard>
      <!-- Loading: rows in the shape of TestRow so nothing shifts on arrival -->
      <template v-if="catalog.isLoading && !catalog.hasLoaded">
        <div class="divide-y divide-app-border" aria-hidden="true">
          <div v-for="n in 4" :key="n" class="flex items-center gap-4 py-4">
            <SkeletonBlock class="h-11 w-11 shrink-0 !rounded-xl" />
            <div class="flex-1">
              <SkeletonBlock class="h-4 w-[min(260px,70%)]" />
              <SkeletonBlock class="mt-2 h-3 w-[min(160px,50%)]" />
            </div>
            <SkeletonBlock class="h-9 w-32 shrink-0 !rounded-lg" />
          </div>
        </div>
        <p class="sr-only" role="status">Testlar yuklanmoqda</p>
      </template>

      <EmptyState
        v-else-if="catalog.errorKind"
        icon="close"
        :title="errorCopy.title"
        :description="errorCopy.description"
      />

      <EmptyState
        v-else-if="!subject"
        icon="tests"
        title="Bunday fan yo‘q"
        description="Havola eskirgan bo‘lishi mumkin. Fanlar ro‘yxatidan tanlang."
        action-label="Fanlarga qaytish"
        action-to="/testlar"
      />

      <template v-else>
        <!-- The filters only mean something once there is something to filter -->
        <div v-if="allTests.length" class="flex flex-wrap gap-2">
          <button
            v-for="filter in FILTERS"
            :key="filter.key"
            type="button"
            class="rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            :class="
              activeFilter === filter.key
                ? 'border-app-ink bg-app-ink text-app-surface'
                : 'border-app-border bg-app-surface text-app-ink hover:bg-app-tile'
            "
            :aria-pressed="activeFilter === filter.key"
            @click="setFilter(filter.key)"
          >
            {{ filter.label }}
          </button>
        </div>

        <div v-if="tests.length" class="mt-1 divide-y divide-app-border">
          <TestRow
            v-for="test in tests"
            :key="test.id"
            :test="test"
            :show-subject="false"
            :busy="busyTestId === test.id"
            @action="openTest"
          />
        </div>

        <EmptyState
          v-else
          icon="tests"
          :title="emptyCopy.title"
          :description="emptyCopy.description"
        />
      </template>
    </AppCard>

    <TestLaunchDialogs
      :mode="launchDialog"
      :test="launchTest"
      :cost="launchCost"
      :balance="launchBalance"
      :busy="Boolean(busyTestId)"
      :error="launchError"
      @confirm="confirmLaunch"
      @close="closeLaunch"
      @topup="goToTopUp"
    />

    <ProfileGateModal
      v-model:show="showProfileGate"
      @completed="onProfileCompleted"
      @cancel="onProfileCancel"
    />
  </main>
</template>
