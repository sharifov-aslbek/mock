<template>
  <section class="bg-white py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10 sm:mb-12">
        Experience MilliyMock
      </h2>

      <!-- Tabs -->
      <div class="flex justify-center mb-10 sm:mb-12">
        <div class="bg-gray-200 rounded-full p-2 flex items-center gap-2">
          <button
            class="bg-white text-gray-900 px-6 sm:px-10 py-3 rounded-full font-semibold text-sm sm:text-base shadow-sm"
          >
            SAT / PSAT
          </button>
          <button
            class="text-gray-800 px-6 sm:px-10 py-3 rounded-full font-semibold text-sm sm:text-base transition hover:bg-white/60"
          >
            Enhanced ACT
          </button>
        </div>
      </div>

      <!-- Browser Mockup -->
      <div class="rounded-[28px] bg-gray-100 border border-gray-200 p-3 sm:p-4 shadow-lg">
        <div class="overflow-hidden rounded-[22px] bg-white border border-gray-200">
          <!-- Browser Top Bar -->
          <div class="h-14 sm:h-16 border-b border-gray-200 bg-[#fafafa] flex items-center px-4 sm:px-6">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-red-400"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span class="w-3 h-3 rounded-full bg-green-400"></span>
            </div>

            <div class="mx-auto hidden md:flex w-full max-w-md">
              <div class="w-full bg-white border border-gray-200 rounded-full h-10 flex items-center justify-center text-sm text-gray-400">
                https://milliymock.uz/dashboard
              </div>
            </div>
          </div>

          <!-- Image Place -->
          <div
            class="aspect-[16/9] bg-gray-50 flex items-center justify-center text-gray-400 text-base sm:text-lg"
          >
           <img src="https://landing.moqups.com/img/_optimized/templates/wireframes/admin-dashboard-wireframe-w400.jpeg" alt="Error Image" class="w-full h-full object-cover">
          </div>
        </div>
      </div>
    </div>
  </section>
</template>