<script setup lang="ts">
const features = [
  'Real test format',
  'Natija tahlili',
  'Vaqt nazorati',
  'Tushunarli statistika',
  'Doimiy mashq',
  'Qulay interfeys'
]
</script>

<template>
  <section class="relative overflow-hidden bg-white py-24 px-4 sm:px-6 lg:px-8">
    <!-- Grid background -->
    <div class="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-60"></div>

    <!-- Gradient blur blobs -->
    <div class="absolute top-16 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-200/40 blur-3xl rounded-full -z-10 animate-pulse"></div>
    <div class="absolute bottom-0 left-0 w-[320px] h-[320px] bg-cyan-200/40 blur-3xl rounded-full -z-10"></div>
    <div class="absolute top-20 right-0 w-[280px] h-[280px] bg-indigo-200/40 blur-3xl rounded-full -z-10"></div>

    <div class="max-w-7xl mx-auto text-center">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm mb-8 animate-[fadeInDown_.7s_ease-out]">
        <span class="inline-block h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
        Milliy sertifikat uchun zamonaviy mock platforma
      </div>

      <!-- Title -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight animate-[fadeInUp_.8s_ease-out]">
        Milliy Sertifikatga
        <span class="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
          Ishonchli
        </span>
        Tayyorlaning
      </h1>

      <!-- Description -->
      <p class="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out]">
        Imtihon formatiga mos mock testlar orqali bilimingizni sinab ko‘ring,
        xatolaringizni tahlil qiling va natijangizni bosqichma-bosqich yaxshilang.
      </p>

      <!-- Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[fadeInUp_1.2s_ease-out]">
        <button
          class="group relative overflow-hidden rounded-xl bg-blue-600 px-8 py-3 font-medium text-white shadow-lg shadow-blue-200 transition duration-300 hover:-translate-y-1 hover:bg-blue-700"
        >
          <span class="relative z-10">Mock Testni Boshlash</span>
          <span class="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0"></span>
        </button>

        <button
          class="rounded-xl border border-gray-300 bg-white px-8 py-3 font-medium text-gray-700 transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
        >
          Batafsil ma’lumot
        </button>
      </div>

      <!-- Info card -->
      <div class="mx-auto max-w-5xl rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-8 md:p-10 animate-[fadeInUp_1.4s_ease-out]">
        <p class="text-gray-500 font-medium mb-8">
          Milliy sertifikatga tayyorlanayotgan o‘quvchilar uchun qulay platforma
        </p>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          <div
            v-for="item in features"
            :key="item"
            class="group rounded-2xl border border-gray-200 bg-white px-5 py-5 text-gray-700 font-semibold shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            <div class="flex items-center justify-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-500 transition duration-300 group-hover:scale-125"></span>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>