<script setup lang="ts"></script>

<template>
  <section class="relative overflow-hidden bg-white py-24 px-4 sm:px-6 lg:px-8">
    <!-- Grid background -->
    <div
        class="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:48px_48px] opacity-60"
    ></div>

    <!-- Gradient blur blobs -->
    <div
        class="absolute top-16 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-slate-300/30 blur-3xl rounded-full -z-10 animate-pulse"
    ></div>
    <div
        class="absolute bottom-0 left-0 w-[320px] h-[320px] bg-slate-200/40 blur-3xl rounded-full -z-10"
    ></div>
    <div
        class="absolute top-20 right-0 w-[280px] h-[280px] bg-gray-300/30 blur-3xl rounded-full -z-10"
    ></div>

    <div class="max-w-7xl mx-auto text-center">
      <!-- Badge -->
      <div
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm mb-8 animate-[fadeInDown_.7s_ease-out]"
      >
        <span class="inline-block h-2 w-2 rounded-full bg-slate-700 animate-pulse"></span>
        Milliy sertifikat uchun zamonaviy mock platforma
      </div>

      <!-- Title -->
      <h1
          class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight animate-[fadeInUp_.8s_ease-out]"
      >
        Milliy Sertifikatga
        <span
            class="bg-gradient-to-r from-slate-700 via-slate-500 to-slate-900 bg-clip-text text-transparent"
        >
          Ishonchli
        </span>
        Tayyorlaning
      </h1>

      <!-- Description -->
      <p
          class="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out]"
      >
        Imtihon formatiga mos mock testlar orqali bilimingizni sinab ko‘ring,
        xatolaringizni tahlil qiling va natijangizni bosqichma-bosqich yaxshilang.
      </p>

      <!-- Buttons -->
      <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[fadeInUp_1.2s_ease-out]"
      >
        <button
            class="group relative overflow-hidden rounded-xl bg-slate-900 px-8 py-3 font-medium text-white shadow-lg shadow-slate-300 transition duration-300 hover:-translate-y-1 hover:bg-slate-800"
        >
          <span class="relative z-10">Mock Testni Boshlash</span>
          <span
              class="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0"
          ></span>
        </button>

        <button
            class="rounded-xl border border-slate-300 bg-white px-8 py-3 font-medium text-slate-700 transition duration-300 hover:-translate-y-1 hover:border-slate-500 hover:text-slate-900 hover:shadow-md"
        >
          Batafsil ma’lumot
        </button>
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