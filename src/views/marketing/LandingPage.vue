<script setup>
// The landing page, rebuilt from `MilliyMock Landing.dc.html`.
// Nothing from the previous landing (views/HomaPage.vue) is reused.
import LandingHero from '@/components/marketing/LandingHero.vue'
import LandingStats from '@/components/marketing/LandingStats.vue'
import LandingFeatures from '@/components/marketing/LandingFeatures.vue'
import LandingCta from '@/components/marketing/LandingCta.vue'
</script>

<template>
  <main>
    <LandingHero />
    <LandingStats />
    <LandingFeatures />
    <LandingCta />
  </main>
</template>
