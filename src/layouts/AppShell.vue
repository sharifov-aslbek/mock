<script setup>
// The platform shell — the redesigned logged-in product (docs/DESIGN.md).
//
// This is a *new* shell used by the redesigned screens. What remains on
// PlatformLayout is only the full-screen, chrome-less pair (/test and
// /explanation), which by design has no shell around it. Natijalar, the essay
// analysis and the account screen have all moved in here.
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
import AppBottomNav from '@/components/app/AppBottomNav.vue'
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

// Close the drawer on navigation so a tap-through never leaves it open, and
// re-read the balance: the tanga pill is on every screen, and it goes stale the
// moment a test is bought or the account is topped up on /narxlar. GET /balance
// returns a single number, so this is cheap.
watch(
  () => route.path,
  () => {
    isDrawerOpen.value = false
    if (authStore.isAuthenticated) balanceStore.refresh().catch(() => {})
  },
)
</script>

<template>
  <div v-if="authStore.isAuthenticated" class="min-h-screen bg-app-bg text-app-ink">
    <aside
      class="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-app-border lg:block"
    >
      <AppSidebar :user="user" />
    </aside>

    <div class="lg:pl-[240px]">
      <!-- max-w 1600, not 1360: at 1360 a 1920 screen stranded ~190px of empty
           gutter on each side of the content while squeezing the results row's
           title column to 432px, so long test names wrapped to two lines. 1600
           spends that space on the content and still caps the row length on an
           ultrawide, where a full-bleed row would make the eye travel from the
           title on the left to its action on the right. -->
      <!-- The extra bottom padding below lg clears the tab bar, so the last row
           of a list is never parked under it. -->
      <div class="mx-auto max-w-[1600px] px-5 pb-[104px] sm:px-8 lg:px-10 lg:pb-16">
        <RouterView :user="user" @open-menu="isDrawerOpen = true" />
      </div>
    </div>

    <AppBottomNav :drawer-open="isDrawerOpen" @open-menu="isDrawerOpen = true" />

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
