<script setup lang="ts">
import StatCard from './StatCard.vue'
</script>

<template>
  <section class="bg-black text-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-4xl font-bold text-center mb-16">Proved Efficient by Tutors</h2>
      <div class="grid md:grid-cols-3 gap-12 mb-12">
        <StatCard number="70K+" label="Tests created and assigned" />
        <StatCard number="7+" label="Hours saved in test creation" />
        <StatCard number="22K+" label="Students improved scores" />
      </div>
      <div class="text-center">
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition">
          Book a Demo
        </button>
      </div>
    </div>
  </section>
</template>