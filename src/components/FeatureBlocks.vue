<script setup lang="ts">
import FeatureCard from './FeatureCard.vue'
</script>

<template>
  <section class="bg-white py-14 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Title -->
      <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-14 lg:mb-16 max-w-3xl mx-auto">
        Testga tayyorlovchi repetitorlar uchun ideal yechim
      </h2>

      <!-- Grid -->
      <div class="grid gap-6 sm:gap-8 md:grid-cols-2">
        <FeatureCard
          icon="✓"
          title="Shaxsiy testlaringizni yarating"
          description="O‘quvchilarning zaif nuqtalariga yo‘naltirilgan amaliy testlar yarating va vaqtingizni tejang"
        />

        <FeatureCard
          icon="▦"
          title="Xalqaro imtihon interfeyslari"
          description="O‘quvchilarni tayyorlash uchun SAT, ACT yoki SHSAT kabi xalqaro standartdagi test interfeyslaridan foydalaning"
        />

        <FeatureCard
          icon="✎"
          title="Savollarni oson yuklang"
          description="Katta hajmdagi savollar to‘plamini bir vaqtning o‘zida yuklang va ulardan tezda testlar hosil qiling"
        />

        <FeatureCard
          icon="👥"
          title="Ota-onalar bilan shaffoflik"
          description="O‘quvchilarning natijalari va hisobotlarini ota-onalarga osongina yuboring va ularni xabardor qilib boring"
        />
      </div>

    </div>
  </section>
</template>