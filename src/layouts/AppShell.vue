<script setup>
// The platform shell — the redesigned logged-in product (docs/DESIGN.md).
//
// This is a *new* shell used by the redesigned screens. The pre-existing
// platform pages (/test, /result-exam, /profile, /explanation) stay on
// PlatformLayout with their current chrome until each one's screen is designed
// and approved, so nothing that works today changes look before its turn.
//
// It owns the same guard as PlatformLayout: the router's beforeEach and the
// group's beforeEnter are the first two lines, and this layout re-checks on
// mount and keeps watching, so a token cleared mid-session ejects the user.
import { ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBalanceStore } from '@/stores/balance'
import { useAppUser } from '@/composables/useAppUser'
import AppSidebar from '@/components/app/AppSidebar.vue'
import AppIcon from '@/components/app/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const balanceStore = useBalanceStore()
const user = useAppUser()

const isDrawerOpen = ref(false)

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      void router.replace({ name: 'register', query: { redirect: route.fullPath } })
      balanceStore.reset()
      return
    }
    if (!authStore.userInfo) void authStore.getUserInfo().catch(() => {})
    balanceStore.refresh().catch(() => {})
  },
  { immediate: true },
)

// Close the drawer on navigation so a tap-through never leaves it open.
watch(() => route.fullPath, () => { isDrawerOpen.value = false })
</script>

<template>
  <div v-if="authStore.isAuthenticated" class="min-h-screen bg-app-bg text-app-ink">
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-app-border lg:block"
    >
      <AppSidebar :user="user" />
    </aside>

    <div class="lg:pl-[240px]">
      <div class="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 lg:px-10">
        <RouterView :user="user" @open-menu="isDrawerOpen = true" />
      </div>
    </div>

    <Teleport to="body">
      <div v-if="isDrawerOpen" class="fixed inset-0 z-[200] lg:hidden">
        <div class="absolute inset-0 bg-black/40" @click="isDrawerOpen = false"></div>
        <aside class="absolute inset-y-0 left-0 w-[272px] max-w-[86vw] border-r border-app-border">
          <button
            type="button"
            class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-app-muted hover:bg-app-tile"
            aria-label="Menyuni yopish"
            @click="isDrawerOpen = false"
          >
            <AppIcon name="close" :size="18" />
          </button>
          <AppSidebar :user="user" @navigate="isDrawerOpen = false" />
        </aside>
      </div>
    </Teleport>
  </div>
</template>
