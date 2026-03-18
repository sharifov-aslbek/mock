<script setup lang="ts">
import { NCarousel } from 'naive-ui'
import TestimonialCard from './TestimonialCard.vue'

const testimonials = [
  {
    name: 'Aziza Rahimova',
    role: 'Milliy sertifikat o‘quvchisi',
    text: "Mock testlar orqali haqiqiy imtihon muhitini his qildim va vaqtni to‘g‘ri taqsimlashni o‘rgandim."
  },
  {
    name: 'Javohir Qodirov',
    role: 'Abituriyent',
    text: "Tahlil bo‘limi yordamida aynan qaysi mavzularda xato qilayotganimni ko‘rdim va natijam sezilarli yaxshilandi."
  },
  {
    name: 'Madina Ortiqova',
    role: 'O‘quvchi',
    text: "Interfeys juda qulay, test ishlash jarayoni esa real imtihonga juda o‘xshash bo‘ldi."
  },
  {
    name: 'Bekzod Tursunov',
    role: 'Tutor',
    text: "O‘quvchilarimning natijalarini kuzatish va ularning kuchsiz joylarini aniqlash ancha osonlashdi."
  },
  {
    name: 'Sevara Ismoilova',
    role: 'Milliy sertifikat nomzodi',
    text: "Doimiy mock test ishlash menga ishonch berdi va imtihon oldi hayajonini kamaytirdi."
  }
]
</script>

<template>
  <section class="bg-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">
        O‘quvchilar fikri
      </h2>

      <div class="hidden md:flex">
            <NCarousel
        draggable
        autoplay
        :interval="3000"
        :slides-per-view="3"
        :space-between="20"
        show-arrow
        dot-type="line"
      >
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="pb-4"
        >
          <TestimonialCard v-bind="t" />
        </div>
      </NCarousel>
      </div>

      <div class="flex md:hidden">
            <NCarousel
        draggable
        autoplay
        :interval="3000"
        :slides-per-view="1"
        :space-between="20"
        show-arrow
        dot-type="line"
      >
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="pb-4"
        >
          <TestimonialCard v-bind="t" />
        </div>
      </NCarousel>
      </div>
    </div>
  </section>
</template>