<script setup>
// Public "shop window" shell — landing + the four marketing routes.
//
// Hard rule: this layout imports NO auth store, NO session context and NO
// platform data fetching, so a logged-out visitor's page load fires zero
// session requests. The navbar peeks at localStorage only (see
// utils/authToken.js) to swap its CTA.
import { RouterView } from 'vue-router'
import MarketingNavbar from '@/components/marketing/MarketingNavbar.vue'
import Footer from '@/components/Footer.vue'
import SupportButton from '@/components/SupportButton.vue'
</script>

<template>
  <MarketingNavbar />
  <RouterView />
  <SupportButton />
  <Footer />
</template>
