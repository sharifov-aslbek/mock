<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Placeholder partner brands — swap names/marks when real logos arrive.
const brands = [
  { name: 'Najot Ta’lim', mark: 'spark' },
  { name: 'Bilimdon', mark: 'book' },
  { name: 'PrimeEdu', mark: 'hexagon' },
  { name: 'Akademiya', mark: 'columns' },
  { name: 'EduPro', mark: 'orbit' },
  { name: 'Maktab+', mark: 'plus' },
]

// Duplicated once for a seamless marquee loop.
const marquee = [...brands, ...brands]
</script>

<template>
  <section class="bg-[#f5f3ef] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <!-- Eyebrow -->
      <div class="mb-10 text-center">
        <span
          class="font-mono-custom text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a857c]"
        >
          {{ t('partners.eyebrow') }}
        </span>
        <p class="mt-2 text-sm text-[#a39e94]">{{ t('partners.note') }}</p>
      </div>

      <!-- Marquee -->
      <div class="logo-marquee relative overflow-hidden">
        <div class="logo-track flex w-max items-center gap-12 sm:gap-16">
          <div
            v-for="(brand, index) in marquee"
            :key="`${brand.name}-${index}`"
            class="brand group flex flex-shrink-0 items-center gap-2.5 text-[#a8a39a] transition-colors duration-300 hover:text-[#1a1814]"
          >
            <svg
              class="h-7 w-7 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <template v-if="brand.mark === 'spark'">
                <path d="M12 2v6M12 16v6M2 12h6M16 12h6" stroke-linecap="round" />
                <circle cx="12" cy="12" r="3" />
              </template>
              <template v-else-if="brand.mark === 'book'">
                <path d="M4 5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2z" stroke-linejoin="round" />
                <path d="M9 3v14" stroke-linecap="round" />
              </template>
              <template v-else-if="brand.mark === 'hexagon'">
                <path d="M12 2 21 7v10l-9 5-9-5V7z" stroke-linejoin="round" />
                <path d="m8.5 12 2.5 2.5L16 9" stroke-linecap="round" stroke-linejoin="round" />
              </template>
              <template v-else-if="brand.mark === 'columns'">
                <path d="M3 8 12 3l9 5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M6 10v8M12 10v8M18 10v8M4 21h16" stroke-linecap="round" />
              </template>
              <template v-else-if="brand.mark === 'orbit'">
                <circle cx="12" cy="12" r="3" />
                <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-30 12 12)" />
              </template>
              <template v-else>
                <path d="M12 5v14M5 12h14" stroke-linecap="round" />
                <rect x="3" y="3" width="18" height="18" rx="5" />
              </template>
            </svg>
            <span class="whitespace-nowrap text-lg font-bold tracking-[-0.02em]">{{ brand.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.logo-marquee {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
}

.logo-track {
  animation: marquee 32s linear infinite;
}

.logo-marquee:hover .logo-track {
  animation-play-state: paused;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    /* Track holds two copies; shifting by half loops seamlessly. */
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .logo-track {
    animation: none;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
