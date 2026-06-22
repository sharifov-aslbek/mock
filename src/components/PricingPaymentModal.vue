<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const authStore = useAuthStore()

// Static payment details (manual activation flow).
const CARD_NUMBER = '5614 6824 1850 4058'
const TELEGRAM_USERNAME = 'AzimRkhmv'

const planName = computed(() => props.plan?.name || '')
const planPrice = computed(() => props.plan?.price || '')

// Strip the "Ta'rif/Ta'rifi" suffix so sentences like "men {plan} tarifini..."
// don't read "Plus Ta'rifi tarifini".
const shortPlanName = computed(() =>
  planName.value.replace(/\s*Ta['’]rif(i)?$/i, '').trim() || planName.value,
)

const description = computed(() =>
  t('pricing.payment.description', { plan: shortPlanName.value }),
)

// Decode the user's DB id from the JWT. The backend embeds it as the
// `nameid` (ClaimTypes.NameIdentifier) claim — see AuthService.GenerateToken.
// This is the stable, unique identifier admins can look users up by
// (e.g. api/balance/{userId}); names collide, and Telegram-login users
// have no email, so the id is what we send.
const userId = computed(() => {
  const token = authStore.token
  if (!token) return ''

  try {
    const payload = token.split('.')[1]
    if (!payload) return ''
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    const claims = JSON.parse(json)
    return String(
      claims.nameid ||
        claims.sub ||
        claims.nameidentifier ||
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        '',
    )
  } catch {
    return ''
  }
})

// Prefill the Telegram chat with the selected package + payment details.
const telegramMessage = computed(() => {
  const base = t('pricing.payment.telegramMessage', {
    plan: shortPlanName.value,
    price: planPrice.value,
    card: CARD_NUMBER,
    holder: t('pricing.payment.cardHolder'),
  })

  const info = authStore.userInfo || {}
  const name =
    info.fullName ||
    info.name ||
    [info.firstName, info.lastName].filter(Boolean).join(' ').trim()

  if (userId.value) {
    const suffix = name ? ` (${name})` : ''
    return `${base}\n${t('pricing.payment.accountLabel')}: ${userId.value}${suffix}`
  }

  return base
})

const telegramUrl = computed(
  () => `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(telegramMessage.value)}`,
)

const close = () => emit('close')
</script>

<template>
  <Teleport to="body">
    <Transition name="pay-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center px-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-[#1a1814]/55 backdrop-blur-sm"></div>

        <!-- Dialog -->
        <Transition name="pay-pop">
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            class="relative w-full max-w-[460px] overflow-hidden rounded-[24px] bg-white p-7 shadow-[0_40px_90px_rgba(26,24,20,0.35)] sm:p-8"
          >
            <!-- Close -->
            <button
              type="button"
              :aria-label="t('pricing.payment.close')"
              class="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#a39e94] transition hover:bg-[#f5f3ef] hover:text-[#1a1814]"
              @click="close"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M6 6l12 12M18 6 6 18" stroke-linecap="round" />
              </svg>
            </button>

            <!-- Eyebrow -->
            <span class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a857c]">
              {{ t('pricing.payment.eyebrow') }}
            </span>

            <!-- Title -->
            <h2 class="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] text-[#1a1814]">
              {{ t('pricing.payment.title') }}
            </h2>

            <!-- Description -->
            <p class="mt-3 text-sm leading-6 text-[#6b6760]">
              {{ description }}
            </p>

            <!-- Card box -->
            <div class="mt-6 rounded-[18px] border border-[#e8e3da] bg-[#f7f5f1] p-5">
              <div class="flex items-center gap-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-[#e8e3da]">
                  <svg class="h-5 w-5 text-[#1a1814]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                    <path d="M2.5 9.5h19" stroke-width="2.2" />
                  </svg>
                </span>
                <div class="min-w-0">
                  <p class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a857c]">
                    {{ t('pricing.payment.cardLabel') }}
                  </p>
                  <p class="mt-1 text-xl font-bold tracking-[0.02em] text-[#1a1814] tabular-nums">
                    {{ CARD_NUMBER }}
                  </p>
                  <p class="mt-0.5 text-[13px] font-medium uppercase tracking-[0.04em] text-[#6b6760]">
                    {{ t('pricing.payment.cardHolder') }}
                  </p>
                </div>
              </div>

              <!-- Divider -->
              <div class="my-4 h-px w-full bg-[#e8e3da]"></div>

              <!-- Plan + price -->
              <div class="flex items-center justify-between gap-3">
                <span class="text-[15px] font-semibold text-[#1a1814]">{{ planName }}</span>
                <span class="text-[17px] font-bold tracking-[-0.01em] text-[#1a1814]">{{ planPrice }}</span>
              </div>
            </div>

            <!-- Telegram CTA -->
            <a
              :href="telegramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-6 inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-[#1a1814] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-black active:scale-[0.98]"
            >
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.94 4.3 18.6 19.3c-.25 1.1-.92 1.37-1.86.85l-5.14-3.79-2.48 2.39c-.27.27-.5.5-1.03.5l.37-5.23 9.52-8.6c.41-.37-.09-.57-.64-.2L5.04 12.1l-5.06-1.58c-1.1-.34-1.12-1.1.23-1.63l19.78-7.62c.92-.34 1.72.2 1.42 1.4l-.47.03z" transform="translate(1 0)" />
              </svg>
              {{ t('pricing.payment.telegram') }} @{{ TELEGRAM_USERNAME }}
            </a>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.h-13 {
  height: 3.25rem;
}

.pay-fade-enter-active,
.pay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.pay-fade-enter-from,
.pay-fade-leave-to {
  opacity: 0;
}

.pay-pop-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.pay-pop-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.pay-pop-enter-from,
.pay-pop-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}
</style>
