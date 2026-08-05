<script setup>
// Shell for the *existing* public pages — subject pages, the pricing page and
// the standalone demos. They stay public and indexed, and they keep the exact
// chrome they have today (the platform Navbar with its balance chip and user
// menu, plus the site Footer), because several of them are auth-aware:
// SubjectPage/OnaTiliPage show free-vs-premium state and open the auth and
// payment modals. Redesigning them belongs to the platform-side work, not here.
//
// `meta.chrome: false` / `meta.support: false` reproduce the old
// `layoutlessRoutes` / `supportlessRoutes` arrays that used to live in App.vue.
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import SupportButton from '@/components/SupportButton.vue'

const route = useRoute()
const showChrome = computed(() => route.meta?.chrome !== false)
const showSupport = computed(() => route.meta?.support !== false)
</script>

<template>
  <Navbar v-if="showChrome" />
  <RouterView />
  <SupportButton v-if="showSupport" />
  <Footer v-if="showChrome" />
</template>
