<script setup>
import Navbar from '@/components/Navbar.vue'
import FinalCTA from '@/components/FinalCTA.vue'
import Footer from '@/components/Footer.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="w-full">
     <Navbar />
    <RouterView />
    <FinalCTA />
    <Footer />
  </main>
</template>

<style>
/* Reset or global styles can go here if needed */
body {
  margin: 0;
  padding: 0;
}
</style>