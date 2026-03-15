<template>
  <div class="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center">
    
    <div class="text-center max-w-3xl mx-auto mb-10">
      <h1 class="text-5xl font-extrabold text-black mb-4 tracking-tight">
        Ta'riflar va Narxlar
      </h1>
      <p class="text-lg text-gray-500 font-medium">
        O'zingizning moslashtiriladigan va o'z brendingizga ega (white-label) raqamli test platformangiz yordamida keng ko'lamda o'qiting!
      </p>
    </div>

    <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg mb-16 transition duration-200 ease-in-out shadow-sm">
      Demoga hoziroq buyurtma bering
    </button>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
      <div 
        v-for="(plan, index) in plans" 
        :key="index"
        :class="[
          'rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col transition-transform hover:-translate-y-1',
          plan.highlighted ? 'bg-blue-50/50' : 'bg-white'
        ]"
      >
        <h3 :class="[
          'text-2xl font-bold mb-4',
          plan.highlighted ? 'text-blue-500' : 'text-black'
        ]">
          {{ plan.name }}
        </h3>
        
        <div class="flex items-baseline mb-2">
          <span class="text-4xl font-extrabold text-black">{{ plan.price }}</span>
          <span class="text-sm font-bold text-black ml-1">{{ plan.duration }}</span>
        </div>
        
        <p class="text-xs font-bold text-black mb-8">
          {{ plan.setupFee }}
        </p>

        <ul class="space-y-4 flex-1">
          <li v-for="(feature, fIndex) in plan.features" :key="fIndex" class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-700 font-medium">{{ feature }}</span>
          </li>
        </ul>
      </div>
    </div>

    <Testimonials />

  </div>
</template>

<script setup>
import Testimonials from '@/components/Testimonials.vue';

// Defining the data array allows you to easily modify plans or pull them from an API later
const plans = [
  {
    name: 'Boshlang\'ich Ta\'rif',
    price: '19.999 so\'m',
    duration: '/90 kun',
    setupFee: '+ 9.999 so\'m bir martalik sozlash to\'lovi',
    highlighted: false,
    features: [
      '100 ta urinish',
      '5100+ savollarga ruxsat',
      'Bitta test narxi faqat $9.99',
      '2 ta administrator kirishi mumkin',
      'O\'z savollaringizni yuklash imkoniyati'
    ]
  },
  {
    name: 'O\'sish Ta\'rifi',
    price: '49.999 so\'m',
    duration: '/180 kun',
    setupFee: '+ 54.999 so\'m bir martalik sozlash to\'lovi',
    highlighted: true, // This triggers the blue text and light blue background
    features: [
      '360 ta urinish',
      '5100+ savollarga ruxsat',
      'Bitta test narxi faqat $6.95',
      '3 ta administrator kirishi mumkin',
      'O\'z savollaringizni yuklash imkoniyati'
    ]
  },
  {
    name: 'Kengaytirilgan Ta\'rif',
    price: '99.999 so\'m',
    duration: '/365 kun',
    setupFee: '+ 549.999 so\'m bir martalik sozlash to\'lovi',
    highlighted: false,
    features: [
      '1000 ta urinish',
      '5100+ savollarga ruxsat',
      'Bitta test narxi faqat $4.99',
      '5 ta administrator kirishi mumkin',
      'O\'z savollaringizni yuklash imkoniyati'
    ]
  }
]
</script>