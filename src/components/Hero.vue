<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMobileMenu } from '@/composables/useMobileMenu'

const { t, tm } = useI18n()
const router = useRouter()
const { open: openMobileMenu } = useMobileMenu()

const stats = computed(() => tm('hero.stats') as Array<{ value: string; label: string }>)

// Desktop (lg+, where the navbar shows inline links) goes straight to the math
// tests; below lg — where only the hamburger is visible — the CTA opens the
// drawer menu so the user can pick a subject.
const onPrimaryClick = () => {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    router.push('/math')
  } else {
    openMobileMenu()
  }
}
</script>

<template>
  <section
    class="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-[#f5f3ef] px-4 py-20 selection:bg-black selection:text-white sm:px-6 sm:py-24 lg:px-8"
  >
    <!-- Subtle warm dot grid -->
    <div class="hero-dots absolute inset-0 -z-20"></div>

    <!-- Cream fade so the grid stays whisper-quiet -->
    <div
      class="absolute inset-0 -z-10 bg-gradient-to-b from-[#f5f3ef]/40 via-[#f5f3ef]/70 to-[#f5f3ef]"
    ></div>

    <!-- Ambient stone blobs (slow drift) -->
    <div
      class="hero-blob blob-a absolute left-1/2 top-10 h-[460px] w-[460px] rounded-full bg-[#e6e1d7]/50 blur-3xl"
    ></div>
    <div
      class="hero-blob blob-b absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[#ebe7e0]/60 blur-3xl"
    ></div>
    <div
      class="hero-blob blob-c absolute right-0 top-16 h-[260px] w-[260px] rounded-full bg-[#e0dbd0]/50 blur-3xl"
    ></div>

    <div class="relative z-10 mx-auto w-full max-w-5xl text-center">
      <!-- Eyebrow -->
      <p
        class="mb-7 animate-[fadeInDown_.7s_ease-out] font-mono-custom text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a857c] min-[1300px]:text-xs"
      >
        {{ t('hero.badge') }}
      </p>

      <!-- Title -->
      <h1
        class="mb-8 animate-[fadeInUp_.8s_ease-out] text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[#1a1814] sm:text-5xl md:text-6xl min-[1300px]:text-[5.5rem]"
      >
        {{ t('hero.titleStart') }}
        <span
          class="bg-gradient-to-br from-[#9a958c] via-[#6b6760] to-[#1a1814] bg-clip-text text-transparent"
        >
          {{ t('hero.titleHighlight') }}
        </span>
        {{ t('hero.titleEnd') }}
      </h1>

      <!-- Description -->
      <p
        class="mx-auto mb-11 max-w-2xl animate-[fadeInUp_1s_ease-out] text-lg leading-relaxed text-[#6b6760] min-[1300px]:max-w-3xl min-[1300px]:text-2xl"
      >
        {{ t('hero.description') }}
      </p>

      <!-- Buttons -->
      <div
        class="flex animate-[fadeInUp_1.2s_ease-out] flex-col items-center justify-center gap-3.5 sm:flex-row"
      >
        <button
          type="button"
          class="group inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#1a1814] px-9 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(26,24,20,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_14px_36px_rgba(26,24,20,0.24)] active:scale-[0.98] min-[1300px]:h-[58px] min-[1300px]:px-11 min-[1300px]:text-base"
          @click="onPrimaryClick"
        >
          {{ t('hero.primary') }}
          <svg
            class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

      </div>

      <!-- Stats -->
      <div
        class="mx-auto mt-16 flex max-w-2xl animate-[fadeInUp_1.4s_ease-out] items-stretch justify-center divide-x divide-[#e0ddd7]"
      >
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex flex-1 flex-col items-center px-2.5 text-center sm:px-8"
        >
          <div class="whitespace-nowrap text-xl font-bold tracking-[-0.02em] text-[#1a1814] sm:text-[2rem]">
            {{ stat.value }}
          </div>
          <div
            class="mt-2 font-mono-custom text-[9px] font-medium uppercase leading-snug tracking-[0.12em] text-[#a39e94] sm:text-[11px]"
          >
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <a
      href="#main-features"
      class="scroll-cue group absolute bottom-6 left-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[#d8d3ca] bg-white/60 text-[#6b6760] backdrop-blur-sm transition-colors duration-300 hover:border-[#1a1814] hover:text-[#1a1814] md:flex"
      :aria-label="t('hero.scrollHint')"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </a>
  </section>
</template>

<style scoped>
.hero-dots {
  background-image: radial-gradient(circle, #d8d3ca 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 35%, transparent 78%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 35%, transparent 78%);
  opacity: 0.55;
}

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

.scroll-cue {
  animation: cue-bounce 2.2s ease-in-out infinite;
}

@keyframes cue-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-blob,
  .scroll-cue {
    animation: none;
  }
}
</style>
