<script setup lang="ts">
import router from '@/router';

</script>

<template>
  <nav class="bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <router-link to="/" class="flex items-center space-x-2">
          <div class="text-2xl font-bold">⋮ MilliyMock</div>
        </router-link>

        <div class="hidden md:flex items-center space-x-8">
          <a href="#" class="hover:text-blue-400 transition">SAT</a>
          <a href="#" class="hover:text-blue-400 transition">ACT</a>
          <a href="#" class="hover:text-blue-400 transition">PSAT</a>
          <a href="#" class="hover:text-blue-400 transition">SHSAT</a>
          <router-link to="/pricing" class="hover:text-blue-400 transition">Pricing</router-link>
          <div class="flex items-center space-x-1 hover:text-blue-400 transition cursor-pointer">
            <span>Resources</span>
            <span>▼</span>
          </div>
        </div>

       <router-link to="/login">
  <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
    Book a Demo
  </button>
</router-link>
      </div>
    </div>
  </nav>
</template>