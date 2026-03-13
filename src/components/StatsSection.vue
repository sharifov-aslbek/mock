<script setup lang="ts">
import StatCard from './StatCard.vue'
</script>

<template>
  <section class="bg-black text-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-4xl font-bold text-center mb-16">Repetitorlar tomonidan tasdiqlangan samaradorlik</h2>
      <div class="grid md:grid-cols-3 gap-12 mb-12">
        <StatCard number="70K+" label="Yaratilgan va topshirilgan testlar" />
        <StatCard number="7+" label="Test yaratishda tejalgan soatlar" />
        <StatCard number="22K+" label="Natijasi yaxshilangan o'quvchilar" />
      </div>
      <div class="text-center">
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition">
          Demoni bron qilish
        </button>
      </div>
    </div>
  </section>
</template>