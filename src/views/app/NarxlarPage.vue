<script setup>
// Narxlar — buying tanga, from inside the platform.
//
// Three real things, no invented ones:
//   • the balance, from GET /api/balance (the balance store)
//   • the plans, from the same i18n source the public pricing page reads, so
//     a price cannot be right in one place and stale in the other
//   • the transaction history, from GET /api/transaction
//
// Buying reuses PricingPaymentModal — the live manual-activation flow with the
// real card number. Reimplementing that would risk showing a wrong account.
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import AppIcon from '@/components/app/AppIcon.vue'
import CoinIcon from '@/components/app/CoinIcon.vue'
import SkeletonBlock from '@/components/app/SkeletonBlock.vue'
import EmptyState from '@/components/app/EmptyState.vue'
import PricingPaymentModal from '@/components/PricingPaymentModal.vue'
import { useBalanceStore } from '@/stores/balance'
import { useAuthStore } from '@/stores/auth'
import { apiFetch, getTestApiBaseUrl, isNetworkError } from '@/utils/api'

defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

const { t, tm } = useI18n()
const balanceStore = useBalanceStore()
const authStore = useAuthStore()

// Shared with the public pricing page — one source of truth for prices.
const plans = computed(() => tm('pricing.plans'))

const selectedPlan = ref(null)
const isPaymentOpen = ref(false)

const buy = (plan) => {
  selectedPlan.value = plan
  isPaymentOpen.value = true
}

// ——— Transaction history (GET /api/transaction) ————————————————————————
const transactions = ref([])
const isLoadingHistory = ref(false)
const historyError = ref('')

async function fetchTransactions() {
  const baseUrl = getTestApiBaseUrl()
  if (!baseUrl || !authStore.isAuthenticated) return

  isLoadingHistory.value = true
  historyError.value = ''
  try {
    const response = await apiFetch(`${baseUrl}/transaction`, {
      headers: { accept: '*/*', Authorization: `Bearer ${authStore.token}` },
    })
    const payload = await response.json()
    if (!response.ok || payload?.code !== 200 || !Array.isArray(payload.data)) {
      throw new Error(payload?.message || `HTTP ${response.status}`)
    }
    // Newest first — the API returns them in that order today, but the sort
    // makes the screen independent of that.
    transactions.value = [...payload.data].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.id - a.id,
    )
  } catch (error) {
    console.error(error)
    historyError.value = isNetworkError(error)
      ? 'Internetda uzilish bor.'
      : 'Tarixni yuklab bo‘lmadi.'
  } finally {
    isLoadingHistory.value = false
  }
}

onMounted(() => {
  balanceStore.refresh().catch(() => {})
  fetchTransactions()
})

const HISTORY_PAGE = 8
const visibleCount = ref(HISTORY_PAGE)
const visibleTransactions = computed(() => transactions.value.slice(0, visibleCount.value))

// DD.MM.YYYY, written out rather than via Intl: the uz-UZ locale formats as
// 2026-08-06, which does not match how every other date in the product reads.
const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

// The backend's descriptions are operator-facing English ("Purchase of test
// 'maxsus test'"). Translate the shapes we know into Uzbek, and fall back to
// the raw string rather than hiding a transaction we do not recognise.
const describe = (entry) => {
  const raw = String(entry.description || '')
  const testMatch = /Purchase of test '(.+)'/i.exec(raw)
  if (testMatch) return `Test sotib olindi — ${testMatch[1]}`
  if (/essay review/i.test(raw)) return 'Insho tekshiruvi'
  if (/admin/i.test(String(entry.type)) || /adjust/i.test(raw)) return 'Hisob to‘ldirildi'
  return raw || 'Amaliyot'
}
</script>

<template>
  <AppTopbar
    title="Narxlar"
    subtitle="Tanga sotib oling va istalgan vaqtda testlarni yeching."
    :user="user"
    @open-menu="$emit('openMenu')"
  />

  <main class="space-y-4">
    <!-- Balance -->
    <AppCard>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-app-tile text-app-coin">
            <CoinIcon :size="24" />
          </span>
          <div>
            <p class="text-[13px] text-app-muted">Hisobingizdagi tanga</p>
            <p class="text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-app-ink">
              {{ balanceStore.available }}
            </p>
          </div>
        </div>
        <p class="max-w-[420px] text-[13px] leading-[1.6] text-app-muted">
          Tangalar muddatsiz — ular tugamaguncha amal qiladi. To‘lovdan so‘ng
          tangalar hisobingizga qo‘lda faollashtiriladi.
        </p>
      </div>
    </AppCard>

    <!-- Plans -->
    <section aria-labelledby="plans-heading">
      <h2 id="plans-heading" class="sr-only">Ta'riflar</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article
          v-for="(plan, index) in plans"
          :key="index"
          class="flex h-full flex-col rounded-2xl border p-5 shadow-app-card transition-colors"
          :class="
            plan.highlighted
              ? 'border-app-ink bg-app-ink text-app-surface'
              : 'border-app-border bg-app-surface hover:border-app-ink/15'
          "
        >
          <div class="flex items-start justify-between gap-3">
            <h3
              class="text-[15px] font-bold tracking-[-0.01em]"
              :class="plan.highlighted ? 'text-app-surface' : 'text-app-ink'"
            >
              {{ plan.name }}
            </h3>
            <span
              v-if="plan.highlighted || plan.bestValue"
              class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
              :class="plan.highlighted ? 'bg-app-surface/15 text-app-surface' : 'bg-app-ink text-app-surface'"
            >
              {{ plan.highlighted ? t('pricing.popular') : t('pricing.bestValue') }}
            </span>
          </div>

          <p
            class="mt-4 text-[26px] font-bold leading-none tracking-[-0.03em]"
            :class="plan.highlighted ? 'text-app-surface' : 'text-app-ink'"
          >
            {{ plan.price }}
          </p>

          <span
            class="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold"
            :class="plan.highlighted ? 'bg-app-surface/10 text-app-surface' : 'bg-app-sunken text-app-ink'"
          >
            <CoinIcon :size="14" :class="plan.highlighted ? 'text-app-coin' : 'text-app-coin'" />
            {{ plan.tokens }} {{ t('pricing.tokenSuffix') }}
          </span>

          <ul class="mt-5 flex-1 space-y-2.5">
            <li
              v-for="(feature, fIndex) in plan.features"
              :key="fIndex"
              class="flex items-start gap-2.5 text-[13px] leading-[1.55]"
              :class="plan.highlighted ? 'text-app-surface/80' : 'text-app-muted'"
            >
              <span
                class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                :class="plan.highlighted ? 'bg-app-surface/15 text-app-surface' : 'bg-app-sunken text-app-ink'"
              >
                <AppIcon name="check" :size="10" />
              </span>
              {{ feature }}
            </li>
          </ul>

          <button
            type="button"
            class="mt-6 w-full rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            :class="
              plan.highlighted
                ? 'bg-app-surface text-app-ink focus-visible:outline-app-surface'
                : 'bg-app-ink text-app-surface focus-visible:outline-app-ink'
            "
            @click="buy(plan)"
          >
            {{ t('pricing.buy') }}
          </button>
        </article>
      </div>
    </section>

    <!-- History -->
    <AppCard>
      <div class="flex items-center justify-between gap-4">
        <h2 class="text-[18px] font-bold tracking-[-0.015em] text-app-ink">Tanga tarixi</h2>
        <p v-if="transactions.length" class="text-[13px] text-app-muted">
          {{ transactions.length }} ta amaliyot
        </p>
      </div>

      <div v-if="isLoadingHistory && !transactions.length" class="mt-2 divide-y divide-app-border" aria-hidden="true">
        <div v-for="n in 4" :key="n" class="flex items-center gap-3 py-3.5">
          <SkeletonBlock class="h-9 w-9 shrink-0 !rounded-full" />
          <div class="flex-1">
            <SkeletonBlock class="h-4 w-[min(240px,60%)]" />
            <SkeletonBlock class="mt-2 h-3 w-24" />
          </div>
          <SkeletonBlock class="h-4 w-12 shrink-0" />
        </div>
      </div>

      <EmptyState
        v-else-if="historyError"
        icon="close"
        title="Tarixni yuklab bo‘lmadi"
        :description="historyError"
      />

      <EmptyState
        v-else-if="!transactions.length"
        icon="coins"
        title="Hozircha amaliyot yo‘q"
        description="Tanga sotib olganingizda va sarflaganingizda, bu yerda ko‘rinadi."
      />

      <template v-else>
        <ul class="mt-2 divide-y divide-app-border">
          <li
            v-for="entry in visibleTransactions"
            :key="entry.id"
            class="flex items-center gap-3 py-3.5"
          >
            <!-- Direction is the meaning here, so it carries the colour -->
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              :class="entry.amount >= 0 ? 'bg-app-good-bg text-app-good' : 'bg-app-tile text-app-muted'"
            >
              <AppIcon :name="entry.amount >= 0 ? 'arrowUp' : 'arrowRight'" :size="16" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="truncate text-[14px] font-semibold text-app-ink">{{ describe(entry) }}</p>
              <p class="mt-0.5 text-[12px] text-app-muted">{{ formatDate(entry.createdAt) }}</p>
            </div>

            <div class="shrink-0 text-right">
              <p
                class="text-[14px] font-bold"
                :class="entry.amount >= 0 ? 'text-app-good' : 'text-app-ink'"
              >
                {{ entry.amount >= 0 ? '+' : '' }}{{ entry.amount }}
              </p>
              <p class="mt-0.5 text-[11px] text-app-muted">{{ entry.balanceAfter }} tanga</p>
            </div>
          </li>
        </ul>

        <div v-if="visibleCount < transactions.length" class="mt-4 flex justify-center">
          <button
            type="button"
            class="rounded-full border border-app-border bg-app-surface px-5 py-2 text-[13px] font-semibold text-app-ink transition-colors hover:bg-app-tile focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
            @click="visibleCount += HISTORY_PAGE"
          >
            Yana ko‘rsatish
          </button>
        </div>
      </template>
    </AppCard>

    <!-- The live payment flow, reused as-is -->
    <PricingPaymentModal
      :open="isPaymentOpen"
      :plan="selectedPlan"
      @close="isPaymentOpen = false"
    />
  </main>
</template>
