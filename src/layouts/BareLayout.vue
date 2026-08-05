<script setup>
// Chrome-less shell for the auth pages (/login, /register, /verify-phone).
// They rendered without Navbar/Footer but with the support button before the
// split; that is preserved exactly.
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SupportButton from '@/components/SupportButton.vue'

const route = useRoute()
const showSupport = computed(() => route.meta?.support !== false)
</script>

<template>
  <RouterView />
  <SupportButton v-if="showSupport" />
</template>
