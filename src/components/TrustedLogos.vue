<template>
  <section class="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-wrap justify-center items-center gap-12">
        <div v-for="brand in ['College Spring', 'SoFlo Tutors', 'PrepPros', 'Summit Prep', 'Krupnick', 'Torch Prep']" 
             :key="brand" class="text-gray-400 text-sm font-medium">
          {{ brand }}
        </div>
      </div>
    </div>
  </section>
</template>