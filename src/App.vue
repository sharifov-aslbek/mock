<script setup>
import Navbar from '@/components/Navbar.vue'
import FinalCTA from '@/components/FinalCTA.vue'
import Footer from '@/components/Footer.vue'
import { RouterView , useRoute } from 'vue-router'


const route = useRoute()
</script>

<template>
  <main class="w-full">
     <Navbar v-if="route.fullPath !== '/login'" />
    <RouterView />
    <FinalCTA v-if="route.fullPath !== '/login'" />
    <Footer v-if="route.fullPath !== '/login'" />
  </main>
</template>

<style>
/* Reset or global styles can go here if needed */
body {
  margin: 0;
  padding: 0;
}
</style>