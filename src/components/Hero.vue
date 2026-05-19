<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const goToMath = () => {
  router.push('/math')
}
</script>

<template>
  <section class="relative overflow-hidden py-24 min-[1300px]:py-40 px-4 sm:px-6 lg:px-8">

    <!-- Dot background image -->
    <div
      class="absolute inset-0 -z-20 bg-center bg-cover"
      style="background-image:url('https://t3.ftcdn.net/jpg/03/72/39/08/360_F_372390859_tN7uW78bBGMNn6XGfMiO0gMVt4EyGavz.jpg');"
    ></div>

    <!-- White overlay -->
    <div class="absolute inset-0 -z-10 bg-white/80"></div>

    <!-- Gradient blur blobs (slow ambient drift) -->
    <div
      class="hero-blob blob-a absolute top-16 left-1/2 w-[500px] h-[500px] bg-slate-300/30 blur-3xl rounded-full"
    ></div>

    <div
      class="hero-blob blob-b absolute bottom-0 left-0 w-[320px] h-[320px] bg-slate-200/40 blur-3xl rounded-full"
    ></div>

    <div
      class="hero-blob blob-c absolute top-20 right-0 w-[280px] h-[280px] bg-gray-300/30 blur-3xl rounded-full"
    ></div>

    <div class="max-w-7xl mx-auto text-center relative z-10">

      <!-- Badge -->
      <div
        class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 min-[1300px]:px-5 min-[1300px]:py-2.5 text-sm min-[1300px]:text-base font-medium text-slate-700 shadow-sm mb-8 animate-[fadeInDown_.7s_ease-out]"
      >
        <span class="inline-block h-2 w-2 rounded-full bg-slate-700 animate-pulse"></span>
        {{ t('hero.badge') }}
      </div>

      <!-- Title -->
      <h1
        class="text-4xl sm:text-5xl md:text-6xl min-[1300px]:text-8xl font-bold text-black mb-8 leading-tight animate-[fadeInUp_.8s_ease-out]"
      >
        {{ t('hero.titleStart') }}
        <span
          class="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-900 bg-clip-text text-transparent"
        >
          {{ t('hero.titleHighlight') }}
        </span>
        {{ t('hero.titleEnd') }}
      </h1>

      <!-- Description -->
      <p
        class="text-lg min-[1300px]:text-2xl text-gray-600 mb-12 max-w-2xl min-[1300px]:max-w-4xl mx-auto leading-relaxed animate-[fadeInUp_1s_ease-out]"
      >
        {{ t('hero.description') }}
      </p>

      <!-- Buttons -->
      <div
        class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[fadeInUp_1.2s_ease-out]"
      >
        <button
          class="group relative overflow-hidden rounded-xl bg-slate-900 px-8 py-3 min-[1300px]:px-10 min-[1300px]:py-4 min-[1300px]:text-lg font-medium text-white shadow-lg shadow-slate-300 transition duration-300 hover:-translate-y-1 hover:bg-slate-800"
          @click="goToMath"
        >
          <span class="relative z-10">{{ t('hero.primary') }}</span>
          <span
            class="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0"
          ></span>
        </button>

        <button
          class="rounded-xl border border-slate-300 bg-white px-8 py-3 min-[1300px]:px-10 min-[1300px]:py-4 min-[1300px]:text-lg font-medium text-slate-700 transition duration-300 hover:-translate-y-1 hover:border-slate-500 hover:text-slate-900 hover:shadow-md"
        >
          {{ t('hero.secondary') }}
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

/* Subtle ambient drift for the hero background blobs */
.blob-a {
  animation: drift-a 16s ease-in-out infinite;
}
.blob-b {
  animation: drift-b 20s ease-in-out infinite;
}
.blob-c {
  animation: drift-c 18s ease-in-out infinite;
}

@keyframes drift-a {
  0%,
  100% {
    transform: translate(-50%, 0) scale(1);
  }
  50% {
    transform: translate(-50%, 24px) scale(1.06);
  }
}

@keyframes drift-b {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(34px, -26px) scale(1.05);
  }
}

@keyframes drift-c {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-30px, 22px) scale(1.07);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-blob {
    animation: none;
  }
}
</style>
