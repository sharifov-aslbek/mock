<script setup>
// The "workshop" shell — everything behind registration.
//
// This layout owns the boundary. The router's global `beforeEach` guard is the
// first line (equivalent to middleware), but a guard that lives only in the
// router is not a boundary: a client-side route object can be reached by a
// programmatic push that bypasses intent, and a token can be cleared while the
// user is already inside. So the layout re-checks on mount and keeps watching
// the auth state for as long as any platform route is rendered.
//
// The platform UI itself is unchanged: same Navbar, same Footer, same
// chrome-less full-screen pages (/test, /explanation) via `meta.chrome`.
import { computed, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import SupportButton from '@/components/SupportButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showChrome = computed(() => route.meta?.chrome !== false)
const showSupport = computed(() => route.meta?.support !== false)

// Same destination as the router guard: registration is the door in the wall.
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      void router.replace({ name: 'register', query: { redirect: route.fullPath } })
    }
  },
  { immediate: true },
)
</script>

<template>
  <template v-if="authStore.isAuthenticated">
    <Navbar v-if="showChrome" />
    <RouterView />
    <SupportButton v-if="showSupport" />
    <Footer v-if="showChrome" />
  </template>
</template>
