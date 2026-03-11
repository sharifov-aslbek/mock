<script setup lang="ts">
import ComparisonItem from './ComparisonItem.vue'
</script>

<template>
  <section class="bg-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-4xl font-bold text-gray-900 text-center mb-16">
        From Scattered Tools to Streamlined Prep
      </h2>

      <div class="grid md:grid-cols-2 gap-12">
        <div>
          <h3 class="text-center font-bold text-lg mb-8 flex items-center justify-center">
            <span class="h-px bg-gray-300 flex-1"></span>
            <span class="px-4">Before</span>
            <span class="h-px bg-gray-300 flex-1"></span>
          </h3>
          <ul class="space-y-4">
            <ComparisonItem status="before" text="Constant tool switching" />
            <ComparisonItem status="before" text="Doesn't mirror same test interface" />
            <ComparisonItem status="before" text="Also sells to students" />
            <ComparisonItem status="before" text="Not capable for practice" />
            <ComparisonItem status="before" text="Doesn't have enough customization" />
            <ComparisonItem status="before" text="Pro-AI tools hindering learning curve" />
            <ComparisonItem status="before" text="Not suitable for Test prep Market" />
          </ul>
        </div>

        <div>
          <h3 class="text-center font-bold text-lg mb-8 flex items-center justify-center">
            <span class="h-px bg-gray-300 flex-1"></span>
            <span class="px-4">After</span>
            <span class="h-px bg-gray-300 flex-1"></span>
          </h3>
          <ul class="space-y-4">
            <ComparisonItem status="after" text="Assigning and tracking in same place" />
            <ComparisonItem status="after" text="Suitable only for Test prep tutors" />
            <ComparisonItem status="after" text="Manage only one tool" />
            <ComparisonItem status="after" text="Send reports to parents" />
            <ComparisonItem status="after" text="Capable of practice tests" />
            <ComparisonItem status="after" text="Can view detailed insights" />
            <ComparisonItem status="after" text="Upload questions without hassle" />
          </ul>
        </div>
      </div>

      <div class="mt-16 bg-black text-white rounded-3xl p-12 text-center">
        <h3 class="text-4xl font-bold mb-8">
          Let's get your students
          <br />
          to their Dream Universities!
        </h3>
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition">
          Pick a Date
        </button>
      </div>
    </div>
  </section>
</template>