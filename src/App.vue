<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import SupportButton from '@/components/SupportButton.vue'
import NetworkStatusAlert from '@/components/NetworkStatusAlert.vue'
import { NMessageProvider } from 'naive-ui'
import { RouterView , useRoute } from 'vue-router'


const route = useRoute()
const layoutlessRoutes = ['/login', '/test' , '/explanation', '/ona-tili-demo']
const supportlessRoutes = ['/test', '/explanation', '/ona-tili-demo']
</script>

<template>
<!--  11-->
  <NMessageProvider placement="top">
    <main class="w-full">
      <NetworkStatusAlert />
       <Navbar v-if="!layoutlessRoutes.includes(route.path)" />
      <RouterView />
      <SupportButton v-if="!supportlessRoutes.includes(route.path)" />
      <Footer v-if="!layoutlessRoutes.includes(route.path)" />
    </main>
  </NMessageProvider>
</template>

<style>
/* Reset or global styles can go here if needed */
body {
  margin: 0;
  padding: 0;
}
</style>
