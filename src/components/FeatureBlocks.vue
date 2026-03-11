<script setup lang="ts">
import FeatureCard from './FeatureCard.vue'
</script>

<template>
  <section class="bg-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">
        Perfect for Tutors in Test Prep
      </h2>

      <FeatureCard
        icon="✓"
        title="Create your own Assessments"
        description="Create practice tests that targets student's weakness and save your time"
      />

      <FeatureCard
        icon="▦"
        title="Any standardized test Interface"
        description="Make use of any standardized test interface like SAT/ACT/SHSAT to prep your students"
      />

      <FeatureCard
        icon="✎"
        title="Upload questions easily"
        description="Upload a bulk collection of questions at once and create a test out of them"
      />

      <FeatureCard
        icon="👥"
        title="Transparency with Parents"
        description="Easily send student's reports to their parents and keep them updated"
      />
    </div>
  </section>
</template>