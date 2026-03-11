<script setup>
import Navbar from '@/components/Navbar.vue'
import Hero from '@/components/Hero.vue'
import TrustedLogos from '@/components/TrustedLogos.vue'
import FeatureBlocks from '@/components/FeatureBlocks.vue'
import ProductShowcase from '@/components/ProductShowcase.vue'
import ComparisonSection from '@/components/ComparisonSection.vue'
import StatsSection from '@/components/StatsSection.vue'
import Testimonials from '@/components/Testimonials.vue'
import FinalCTA from '@/components/FinalCTA.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <main class="w-full">
    <Navbar />
    <Hero />
    <TrustedLogos />
    <FeatureBlocks />
    <ProductShowcase />
    <ComparisonSection />
    <StatsSection />
    <Testimonials />
    <FinalCTA />
    <Footer />
  </main>
</template>