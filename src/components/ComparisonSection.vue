<script setup lang="ts">
import ComparisonItem from './ComparisonItem.vue'
</script>

<template>
  <section class="bg-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">
        Tarqoq asboblardan tartibli tayyorgarlikka
      </h2>

      <div class="grid md:grid-cols-2 gap-12">
        <div>
          <h3 class="text-center font-bold text-lg mb-8 flex items-center justify-center">
            <span class="h-px bg-gray-300 flex-1"></span>
            <span class="px-4 text-gray-500">Avval</span>
            <span class="h-px bg-gray-300 flex-1"></span>
          </h3>
          <ul class="space-y-4">
            <ComparisonItem status="before" text="Doimiy ravishda turli platformalar o'rtasida chalg'ish" />
            <ComparisonItem status="before" text="Haqiqiy imtihon interfeysiga mos kelmaydi" />
            <ComparisonItem status="before" text="Platforma bir vaqtning o'zida o'quvchilarga ham sotadi" />
            <ComparisonItem status="before" text="Amaliyot qilish uchun imkoniyatlar yetarli emas" />
            <ComparisonItem status="before" text="Kerakli darajada moslashtirish (customization) yo'q" />
            <ComparisonItem status="before" text="Sun'iy intellekt asboblari o'rganishga xalaqit beradi" />
            <ComparisonItem status="before" text="Testga tayyorlov bozori uchun moslashmagan" />
          </ul>
        </div>

        <div>
          <h3 class="text-center font-bold text-lg mb-8 flex items-center justify-center">
            <span class="h-px bg-gray-300 flex-1"></span>
            <span class="px-4 text-blue-600">Keyin</span>
            <span class="h-px bg-gray-300 flex-1"></span>
          </h3>
          <ul class="space-y-4">
            <ComparisonItem status="after" text="Vazifa berish va nazorat qilish bir joyda" />
            <ComparisonItem status="after" text="Faqat repetitorlar va o'quv markazlari uchun maxsus" />
            <ComparisonItem status="after" text="Faqat bitta platformani boshqarish kifoya" />
            <ComparisonItem status="after" text="Ota-onalarga avtomatik hisobotlarni yuborish" />
            <ComparisonItem status="after" text="To'liq mock imtihonlarni o'tkazish imkoniyati" />
            <ComparisonItem status="after" text="Batafsil tahliliy ma'lumotlarni ko'rish" />
            <ComparisonItem status="after" text="Savollarni qiyinchiliksiz platformaga yuklash" />
          </ul>
        </div>
      </div>

      <div class="mt-16 bg-black text-white rounded-3xl p-12 text-center">
        <h3 class="text-4xl font-bold mb-8">
          Orzuyingizdagi universitetga <br> talaba bo'ling!
        </h3>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition">
          Platformaga kirish
        </button>
      </div>
    </div>
  </section>
</template>