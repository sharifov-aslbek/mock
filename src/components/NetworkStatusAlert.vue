<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isOffline = ref(false)

const updateNetworkStatus = () => {
  isOffline.value = typeof navigator !== 'undefined' && !navigator.onLine
}

onMounted(() => {
  updateNetworkStatus()
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-[-8px] opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-[-8px] opacity-0"
  >
    <div
      v-if="isOffline"
      class="fixed right-4 top-4 z-[500] flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-red-500/30 bg-red-600 px-4 py-3 text-white shadow-[0_18px_40px_rgba(185,28,28,0.28)] sm:right-6 sm:top-6"
      role="alert"
      aria-live="assertive"
    >
      <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <div class="min-w-0">
        <p class="text-sm font-bold leading-5">
          {{ t('networkAlert.title') }}
        </p>
        <p class="mt-0.5 text-sm leading-5 text-white/85">
          {{ t('networkAlert.description') }}
        </p>
      </div>
    </div>
  </Transition>
</template>
