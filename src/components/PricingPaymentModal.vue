<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import TelegramCodeLink from '@/components/auth/TelegramCodeLink.vue'
import { telegramBotPayUrl } from '@/utils/telegramBot'

// "Tanga sotib olish" → this dialog → @milliymock_bot. The purchase itself
// (payment method, receipt, crediting the tanga) happens in the bot; the site
// only hands over which package and which account, via the deep link.
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

const planName = computed(() => props.plan?.name || '')
const planPrice = computed(() => props.plan?.price || '')
const planTokens = computed(() => Number(props.plan?.tokens) || 0)

// Strip the "Ta'rif/Ta'rifi" suffix so sentences like "{plan} ta'rifi..."
// don't read "Plus Ta'rifi ta'rifi".
const shortPlanName = computed(() =>
  planName.value.replace(/\s*Ta['’]rif(i)?$/i, '').trim() || planName.value,
)

const description = computed(() =>
  t('pricing.payment.description', { plan: shortPlanName.value, price: planPrice.value }),
)

// Decode the user's DB id from the JWT. The backend embeds it as the
// `nameid` (ClaimTypes.NameIdentifier) claim — see AuthService.GenerateToken.
// It rides along in the bot deep link (`pay_coins<N>_<userId>`) so the bot
// credits the right account: names collide, and Telegram-login users have no
// email, so the id is the only safe handle.
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

// Opens the bot directly at the payment step for this package (the plan's
// tanga count picks the package).
const telegramUrl = computed(() => telegramBotPayUrl(planTokens.value, userId.value))

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

            <!-- What's being bought -->
            <div class="mt-6 flex items-center gap-4 rounded-[18px] border border-[#e8e3da] bg-[#f7f5f1] p-5">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#29a9eb] text-white">
                <svg class="h-5 w-5" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true">
                  <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
                </svg>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[15px] font-semibold text-[#1a1814]">{{ planName }}</p>
                <p class="mt-0.5 text-[13px] text-[#6b6760]">
                  {{ planTokens }} {{ t('pricing.tokenSuffix') }}
                </p>
              </div>
              <span class="shrink-0 text-[17px] font-bold tracking-[-0.01em] text-[#1a1814]">{{ planPrice }}</span>
            </div>

            <!-- Telegram CTA — the deep link carries the package and the account. -->
            <TelegramCodeLink
              class="mt-6"
              :href="telegramUrl"
              :label="t('pricing.payment.telegram')"
              variant="primary"
            />

            <p class="mt-4 text-center text-[12px] leading-relaxed text-[#8a857c]">
              {{ t('pricing.payment.hint') }}
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
