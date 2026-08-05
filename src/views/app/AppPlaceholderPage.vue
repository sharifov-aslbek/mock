<script setup>
// Placeholder for platform screens whose design has not been approved yet.
// Exists so every sidebar destination resolves and the shell can be navigated
// end to end; each is replaced by its real screen as it is signed off.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppTopbar from '@/components/app/AppTopbar.vue'
import AppCard from '@/components/app/AppCard.vue'
import AppIcon from '@/components/app/AppIcon.vue'

defineProps({
  user: { type: Object, required: true },
})
defineEmits(['openMenu'])

const route = useRoute()
const title = computed(() => route.meta?.appTitle || '')
const icon = computed(() => route.meta?.appIcon || 'tests')
</script>

<template>
  <AppTopbar :title="title" :user="user" @open-menu="$emit('openMenu')" />

  <main>
    <AppCard>
      <div class="flex flex-col items-center py-14 text-center">
        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-app-tile text-app-ink">
          <AppIcon :name="icon" :size="26" />
        </span>
        <h2 class="mt-5 text-[20px] font-bold tracking-[-0.01em] text-app-ink">
          {{ title }} tez orada
        </h2>
        <p class="mt-2 max-w-[380px] text-[15px] leading-[1.6] text-app-muted">
          Bu bo‘lim ustida ishlanmoqda. Tayyor bo‘lgach, shu yerda ochiladi.
        </p>
        <RouterLink
          to="/dashboard"
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-app-ink px-5 py-2.5 text-[15px] font-semibold text-app-surface transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-ink"
        >
          Bosh sahifaga qaytish
          <AppIcon name="arrowRight" :size="16" />
        </RouterLink>
      </div>
    </AppCard>
  </main>
</template>
