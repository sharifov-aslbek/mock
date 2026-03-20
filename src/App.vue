<script setup>
import Navbar from '@/components/Navbar.vue'
import FinalCTA from '@/components/FinalCTA.vue'
import Footer from '@/components/Footer.vue'
import { RouterView , useRoute } from 'vue-router'


const route = useRoute()
const layoutlessRoutes = ['/login', '/dashboard']
</script>

<template>
  <main class="w-full">
     <Navbar v-if="!layoutlessRoutes.includes(route.path)" />
    <RouterView />
    <FinalCTA v-if="!layoutlessRoutes.includes(route.path)" />
    <Footer v-if="!layoutlessRoutes.includes(route.path)" />
  </main>
</template>

<style>
/* Reset or global styles can go here if needed */
body {
  margin: 0;
  padding: 0;
}
</style>
