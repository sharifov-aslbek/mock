<script setup>
import { reactive, onMounted } from 'vue'
import { NRadio, NRadioGroup, NButton } from 'naive-ui'
import { ComputeEngine } from '@cortex-js/compute-engine'
import { useI18n } from 'vue-i18n'

// Initialize ComputeEngine
const ce = new ComputeEngine()
const { t } = useI18n()

// Helper function to check if mathematically equivalent
const checkMathEquivalent = (userAnswer, correctAnswer) => {
  return ce.parse(userAnswer).isSame(ce.parse(correctAnswer))
}

// 30 Mathematical Questions
const questions = [
  {
    id: 1,
    title: 'What is the first derivative of f(x) = 3x² + 2x - 5?',
    options: [
      { key: 'A', text: '6x + 2' },
      { key: 'B', text: '3x + 2' },
      { key: 'C', text: '6x - 5' },
      { key: 'D', text: 'x² + 2' }
    ]
  },
  {
    id: 2,
    title: 'Evaluate the integral ∫ 2x dx.',
    options: [
      { key: 'A', text: 'x² + C' },
      { key: 'B', text: '2x² + C' },
      { key: 'C', text: 'x + C' },
      { key: 'D', text: '2 + C' }
    ]
  },
  {
    id: 3,
    title: 'Find the value of x in the equation: 4x - 7 = 13',
    options: [
      { key: 'A', text: 'x = 4' },
      { key: 'B', text: 'x = 5' },
      { key: 'C', text: 'x = 6' },
      { key: 'D', text: 'x = -5' }
    ]
  },
  {
    id: 4,
    title: 'Calculate the area of the triangle shown below:',
    image: 'https://placehold.co/400x200/ffffff/000000?text=Triangle+Base:10,+Height:5',
    options: [
      { key: 'A', text: '25 sq units' },
      { key: 'B', text: '50 sq units' },
      { key: 'C', text: '15 sq units' },
      { key: 'D', text: '12.5 sq units' }
    ]
  },
  {
    id: 5,
    title: 'If a matrix A is 3x2 and matrix B is 2x4, what are the dimensions of AB?',
    options: [
      { key: 'A', text: '3x4' },
      { key: 'B', text: '2x2' },
      { key: 'C', text: '4x3' },
      { key: 'D', text: 'Cannot be multiplied' }
    ]
  },
  {
    id: 6,
    title: 'Solve for y: e^(2y) = 5',
    options: [
      { key: 'A', text: 'y = ln(5) / 2' },
      { key: 'B', text: 'y = ln(2.5)' },
      { key: 'C', text: 'y = e^5 / 2' },
      { key: 'D', text: 'y = 2ln(5)' }
    ]
  },
  {
    id: 7,
    title: 'What is the limit of (sin x) / x as x approaches 0?',
    options: [
      { key: 'A', text: '0' },
      { key: 'B', text: '1' },
      { key: 'C', text: 'Infinity' },
      { key: 'D', text: 'Undefined' }
    ]
  },
  {
    id: 8,
    title: 'Identify the conic section described by the equation: x² + 4y² = 16',
    options: [
      { key: 'A', text: 'Circle' },
      { key: 'B', text: 'Parabola' },
      { key: 'C', text: 'Hyperbola' },
      { key: 'D', text: 'Ellipse' }
    ]
  },
  {
    id: 9,
    title: 'Based on the graph below, what is the y-intercept?',
    image: 'https://placehold.co/400x250/ffffff/000000?text=Linear+Graph+crossing+Y+at+(0,3)',
    options: [
      { key: 'A', text: '(0, -3)' },
      { key: 'B', text: '(3, 0)' },
      { key: 'C', text: '(0, 3)' },
      { key: 'D', text: '(1, 3)' }
    ]
  },
  {
    id: 10,
    title: 'What is the determinant of a 2x2 matrix with rows [1, 2] and [3, 4]?',
    options: [
      { key: 'A', text: '-2' },
      { key: 'B', text: '2' },
      { key: 'C', text: '10' },
      { key: 'D', text: '0' }
    ]
  },
  {
    id: 11,
    title: 'Which of the following is Euler’s formula?',
    options: [
      { key: 'A', text: 'e^(iπ) + 1 = 0' },
      { key: 'B', text: 'a² + b² = c²' },
      { key: 'C', text: 'F = ma' },
      { key: 'D', text: 'E = mc²' }
    ]
  },
  {
    id: 12,
    title: 'Find the standard deviation of the set: {2, 4, 4, 4, 5, 5, 7, 9}',
    options: [
      { key: 'A', text: '2.14' },
      { key: 'B', text: '4.00' },
      { key: 'C', text: '2.00' },
      { key: 'D', text: '5.00' }
    ]
  },
  {
    id: 13,
    title: 'What is the sum of the interior angles of a hexagon?',
    options: [
      { key: 'A', text: '360°' },
      { key: 'B', text: '540°' },
      { key: 'C', text: '720°' },
      { key: 'D', text: '900°' }
    ]
  },
  {
    id: 14,
    title: 'Calculate the volume of the cylinder shown below (r=3, h=10):',
    image: 'https://placehold.co/300x300/ffffff/000000?text=Cylinder+r=3,+h=10',
    options: [
      { key: 'A', text: '30π' },
      { key: 'B', text: '60π' },
      { key: 'C', text: '90π' },
      { key: 'D', text: '120π' }
    ]
  },
  {
    id: 15,
    title: 'If log₂(x) = 5, what is the value of x?',
    options: [
      { key: 'A', text: '10' },
      { key: 'B', text: '25' },
      { key: 'C', text: '32' },
      { key: 'D', text: '64' }
    ]
  },
  {
    id: 16,
    title: 'What is the cross product of vectors i and j?',
    options: [
      { key: 'A', text: '0' },
      { key: 'B', text: '1' },
      { key: 'C', text: 'k' },
      { key: 'D', text: '-k' }
    ]
  },
  {
    id: 17,
    title: 'Solve the differential equation dy/dx = y.',
    options: [
      { key: 'A', text: 'y = Ce^x' },
      { key: 'B', text: 'y = Cx' },
      { key: 'C', text: 'y = ln(x) + C' },
      { key: 'D', text: 'y = e^(Cx)' }
    ]
  },
  {
    id: 18,
    title: 'What is the probability of rolling a sum of 7 with two standard 6-sided dice?',
    options: [
      { key: 'A', text: '1/6' },
      { key: 'B', text: '1/12' },
      { key: 'C', text: '1/7' },
      { key: 'D', text: '1/36' }
    ]
  },
  {
    id: 19,
    title: 'Determine the roots of the quadratic equation: x² - 5x + 6 = 0',
    options: [
      { key: 'A', text: 'x = 1, x = 6' },
      { key: 'B', text: 'x = -2, x = -3' },
      { key: 'C', text: 'x = 2, x = 3' },
      { key: 'D', text: 'x = -1, x = -6' }
    ]
  },
  {
    id: 20,
    title: 'Analyze the geometric figure below. Which theorem best applies to find side x?',
    image: 'https://placehold.co/400x200/ffffff/000000?text=Right+Angled+Triangle',
    options: [
      { key: 'A', text: 'Law of Sines' },
      { key: 'B', text: 'Law of Cosines' },
      { key: 'C', text: 'Pythagorean Theorem' },
      { key: 'D', text: 'Thales\'s Theorem' }
    ]
  },
  {
    id: 21,
    title: 'What is the value of 5! (5 factorial)?',
    options: [
      { key: 'A', text: '20' },
      { key: 'B', text: '60' },
      { key: 'C', text: '120' },
      { key: 'D', text: '720' }
    ]
  },
  {
    id: 22,
    title: 'Which of the following functions is an even function?',
    options: [
      { key: 'A', text: 'f(x) = x³' },
      { key: 'B', text: 'f(x) = sin(x)' },
      { key: 'C', text: 'f(x) = cos(x)' },
      { key: 'D', text: 'f(x) = x³ + 1' }
    ]
  },
  {
    id: 23,
    title: 'Convert the polar coordinates (2, π/6) to Cartesian coordinates.',
    options: [
      { key: 'A', text: '(√3, 1)' },
      { key: 'B', text: '(1, √3)' },
      { key: 'C', text: '(2, √3)' },
      { key: 'D', text: '(√2, √2)' }
    ]
  },
  {
    id: 24,
    title: 'What is the 10th term in the arithmetic sequence: 3, 7, 11, 15...?',
    options: [
      { key: 'A', text: '35' },
      { key: 'B', text: '39' },
      { key: 'C', text: '43' },
      { key: 'D', text: '47' }
    ]
  },
  {
    id: 25,
    title: 'Evaluate: i² (where i is the imaginary unit).',
    options: [
      { key: 'A', text: '1' },
      { key: 'B', text: '-1' },
      { key: 'C', text: 'i' },
      { key: 'D', text: '-i' }
    ]
  },
  {
    id: 26,
    title: 'Which transformation is applied to triangle ABC to get A\'B\'C\'?',
    image: 'https://placehold.co/400x200/ffffff/000000?text=Triangle+Reflection+over+Y-axis',
    options: [
      { key: 'A', text: 'Translation' },
      { key: 'B', text: 'Rotation' },
      { key: 'C', text: 'Reflection' },
      { key: 'D', text: 'Dilation' }
    ]
  },
  {
    id: 27,
    title: 'Find the partial derivative ∂f/∂x of f(x,y) = x²y + y³.',
    options: [
      { key: 'A', text: '2xy' },
      { key: 'B', text: 'x² + 3y²' },
      { key: 'C', text: '2x + y³' },
      { key: 'D', text: '2xy + 3y²' }
    ]
  },
  {
    id: 28,
    title: 'What is the Maclaurin series expansion of e^x?',
    options: [
      { key: 'A', text: '1 + x + x²/2! + x³/3! + ...' },
      { key: 'B', text: '1 - x + x²/2! - x³/3! + ...' },
      { key: 'C', text: 'x - x³/3! + x⁵/5! - ...' },
      { key: 'D', text: '1 - x²/2! + x⁴/4! - ...' }
    ]
  },
  {
    id: 29,
    title: 'Which logic gate is represented by the expression Y = A · B ?',
    options: [
      { key: 'A', text: 'OR Gate' },
      { key: 'B', text: 'AND Gate' },
      { key: 'C', text: 'NAND Gate' },
      { key: 'D', text: 'XOR Gate' }
    ]
  },
  {
    id: 30,
    title: 'Calculate the expected value E(X) for a uniform distribution between a=0 and b=10.',
    options: [
      { key: 'A', text: '0' },
      { key: 'B', text: '5' },
      { key: 'C', text: '10' },
      { key: 'D', text: '2.5' }
    ]
  }
]

// Tracking User Answers
const answers = reactive({})

// Pre-fill a few answers
onMounted(() => {
  answers[1] = 'A'
  answers[2] = 'A'
})
</script>

<template>
  <!-- Pure Black and White Layout -->
  <main class="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
    
    <!-- Test Header -->
    <header class="sticky top-0 z-10 border-b-2 border-black bg-white px-6 py-4">
      <div class="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-black">{{ t('testPage.title') }}</h1>
          <p class="text-sm font-medium text-black/70">{{ t('testPage.description') }}</p>
        </div>
        <NButton color="#000000" text-color="#ffffff" size="large" class="!rounded-none !border-2 !border-black !px-8 !font-bold hover:!bg-white hover:!text-black transition-colors duration-200">
          {{ t('testPage.submit') }}
        </NButton>
      </div>
    </header>

    <!-- Questions Container -->
    <div class="mx-auto max-w-4xl px-6 py-10 space-y-12">
      
      <div v-for="(question, index) in questions" :key="question.id" class="question-block">
        
        <!-- Question Title -->
        <h2 class="mb-4 text-[17px] font-bold text-black leading-relaxed">
          {{ question.id }}. {{ question.title }}
        </h2>

        <!-- Question Image (Updated to B&W placeholders) -->
        <div v-if="question.image" class="mb-5 ml-6">
          <img 
            :src="question.image" 
            alt="Question Figure" 
            class="max-w-[400px] border-2 border-black"
          />
        </div>

        <!-- Options List -->
        <NRadioGroup v-model:value="answers[question.id]" class="ml-6 flex flex-col space-y-3">
          
          <label 
            v-for="option in question.options" 
            :key="option.key" 
            class="group flex cursor-pointer items-center gap-3"
          >
            <!-- Letter Bubble (A, B, C, D) -->
            <!-- Inverts to black background / white text when selected or hovered -->
            <span 
              class="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-black text-[13px] font-bold transition-all duration-200 group-hover:bg-black group-hover:text-white"
              :class="answers[question.id] === option.key ? 'bg-black text-white' : 'bg-white text-black'"
            >
              {{ option.key }}
            </span>

            <!-- Radio Button & Text -->
            <NRadio :value="option.key" class="custom-radio">
              <span class="text-[16px] font-medium text-black">
                {{ option.text }}
              </span>
            </NRadio>
          </label>

        </NRadioGroup>
      </div>

    </div>
  </main>
</template>

<style scoped>
/* 
  Force Naive UI Radio to STRICTLY Black and White
*/

/* Radio dot checked state */
:deep(.custom-radio .n-radio__dot--checked) {
  box-shadow: inset 0 0 0 2px #000000 !important;
}

/* Radio dot inside color */
:deep(.custom-radio .n-radio__dot::before) {
  background-color: #000000 !important;
}

/* Base radio dot sizing and strict black borders */
:deep(.n-radio) {
  align-items: center;
}

:deep(.n-radio__dot) {
  height: 20px;
  width: 20px;
  border: 2px solid #000000 !important; /* Always black border */
  background-color: #ffffff !important;
}

/* Hover state on radio button */
:deep(.n-radio:hover .n-radio__dot) {
  border-color: #000000 !important; 
  box-shadow: 0 0 0 2px rgba(0,0,0,0.1) !important;
}
</style>
