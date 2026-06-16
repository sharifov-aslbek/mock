<script setup>
import Navbar from '@/components/Navbar.vue'
import Hero from '@/components/Hero.vue'
import TrustedLogos from '@/components/TrustedLogos.vue'
import FeatureBlocks from '@/components/FeatureBlocks.vue'
import ProductShowcase from '@/components/ProductShowcase.vue'
import ComparisonSection from '@/components/ComparisonSection.vue'
import StatsSection from '@/components/StatsSection.vue'
import Testimonials from '@/components/Testimonials.vue'

</script>

<template>
  <main class="relative w-full bg-[#f5f3ef]">
    <!-- Subtle film grain to warm up the flat cream -->
    <div class="grain-overlay" aria-hidden="true"></div>

    <Hero />
    <TrustedLogos />
    <FeatureBlocks />
    <ProductShowcase />
    <!-- <ComparisonSection /> -->
    <!-- <StatsSection /> -->
    <Testimonials />
  </main>
</template>

<style scoped>
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
</style>