<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const { locale } = useI18n()

const lang = computed(() => (locale.value === 'ru' ? 'ru' : 'uz'))

const render = (tex) => {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode: false,
      output: 'html',
    })
  } catch {
    return tex
  }
}

// Canonical reference formulas, grouped into sections. Each row has a TeX
// expression and a short bilingual caption. White background, black ink — the
// styling lives in this component, not in baked-in images.
const sections = [
  {
    title: { uz: 'Qisqa koʻpaytirish', ru: 'Формулы сокращённого умножения' },
    rows: [
      { tex: '(a\\pm b)^2 = a^2 \\pm 2ab + b^2' },
      { tex: '(a\\pm b)^3 = a^3 \\pm 3a^2b + 3ab^2 \\pm b^3' },
      { tex: 'a^2 - b^2 = (a-b)(a+b)' },
      { tex: 'a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2)' },
    ],
  },
  {
    title: { uz: 'Darajalar va ildizlar', ru: 'Степени и корни' },
    rows: [
      { tex: 'a^m \\cdot a^n = a^{m+n}' },
      { tex: '\\dfrac{a^m}{a^n} = a^{m-n}' },
      { tex: '(a^m)^n = a^{mn}' },
      { tex: 'a^{-n} = \\dfrac{1}{a^n}, \\quad a^0 = 1' },
      { tex: 'a^{\\frac{m}{n}} = \\sqrt[n]{a^m}' },
      { tex: '\\sqrt[n]{ab} = \\sqrt[n]{a}\\,\\sqrt[n]{b}' },
    ],
  },
  {
    title: { uz: 'Kvadrat tenglama', ru: 'Квадратное уравнение' },
    rows: [
      { tex: 'ax^2 + bx + c = 0' },
      { tex: 'D = b^2 - 4ac' },
      { tex: 'x_{1,2} = \\dfrac{-b \\pm \\sqrt{D}}{2a}' },
      { tex: 'x_1 + x_2 = -\\dfrac{b}{a}, \\quad x_1 x_2 = \\dfrac{c}{a}', label: { uz: 'Viyet teoremasi', ru: 'Теорема Виета' } },
    ],
  },
  {
    title: { uz: 'Progressiyalar', ru: 'Прогрессии' },
    rows: [
      { tex: 'a_n = a_1 + (n-1)d', label: { uz: 'Arifmetik', ru: 'Арифметическая' } },
      { tex: 'S_n = \\dfrac{a_1 + a_n}{2}\\cdot n' },
      { tex: 'b_n = b_1 q^{\\,n-1}', label: { uz: 'Geometrik', ru: 'Геометрическая' } },
      { tex: 'S_n = \\dfrac{b_1(q^n - 1)}{q - 1}, \\quad S = \\dfrac{b_1}{1-q}\\;(|q|<1)' },
    ],
  },
  {
    title: { uz: 'Logarifmlar', ru: 'Логарифмы' },
    rows: [
      { tex: '\\log_a(xy) = \\log_a x + \\log_a y' },
      { tex: '\\log_a \\dfrac{x}{y} = \\log_a x - \\log_a y' },
      { tex: '\\log_a x^k = k\\log_a x' },
      { tex: '\\log_a x = \\dfrac{\\log_b x}{\\log_b a}' },
      { tex: 'a^{\\log_a x} = x' },
    ],
  },
  {
    title: { uz: 'Trigonometrik ayniyatlar', ru: 'Тригонометрические тождества' },
    rows: [
      { tex: '\\sin^2\\alpha + \\cos^2\\alpha = 1' },
      { tex: '\\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha}' },
      { tex: '\\cot\\alpha = \\dfrac{\\cos\\alpha}{\\sin\\alpha}' },
      { tex: '\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha' },
      { tex: '\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha' },
      { tex: '\\sin(\\alpha\\pm\\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta' },
      { tex: '\\cos(\\alpha\\pm\\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta' },
    ],
  },
  {
    title: { uz: 'Uchburchak', ru: 'Треугольник' },
    rows: [
      { tex: 'a^2 + b^2 = c^2', label: { uz: 'Pifagor teoremasi', ru: 'Теорема Пифагора' } },
      { tex: '\\dfrac{a}{\\sin\\alpha} = \\dfrac{b}{\\sin\\beta} = \\dfrac{c}{\\sin\\gamma} = 2R', label: { uz: 'Sinuslar teoremasi', ru: 'Теорема синусов' } },
      { tex: 'c^2 = a^2 + b^2 - 2ab\\cos\\gamma', label: { uz: 'Kosinuslar teoremasi', ru: 'Теорема косинусов' } },
      { tex: 'S = \\dfrac{1}{2}ab\\sin\\gamma = \\dfrac{abc}{4R} = pr', label: { uz: 'Yuza', ru: 'Площадь' } },
    ],
  },
  {
    title: { uz: 'Yuzalar', ru: 'Площади фигур' },
    rows: [
      { tex: 'S = a\\cdot h = ab\\sin\\alpha', label: { uz: 'Parallelogramm', ru: 'Параллелограмм' } },
      { tex: 'S = a^2\\sin\\alpha = \\dfrac{1}{2}d_1 d_2', label: { uz: 'Romb', ru: 'Ромб' } },
      { tex: 'S = \\dfrac{a+b}{2}\\cdot h', label: { uz: 'Trapetsiya', ru: 'Трапеция' } },
      { tex: 'l = 2\\pi R, \\quad S = \\pi R^2', label: { uz: 'Aylana va doira', ru: 'Окружность и круг' } },
      { tex: 'S_{\\text{sek}} = \\dfrac{\\pi R^2}{360^\\circ}\\,\\alpha', label: { uz: 'Doiraviy sektor', ru: 'Сектор' } },
      { tex: 'S_{\\text{seg}} = \\dfrac{R^2}{2}\\,(\\alpha - \\sin\\alpha)', label: { uz: 'Doiraviy segment', ru: 'Сегмент' } },
    ],
  },
  {
    title: { uz: 'Vektorlar', ru: 'Векторы' },
    rows: [
      { tex: '|\\vec{a}| = \\sqrt{x^2 + y^2 + z^2}', label: { uz: 'Uzunlik', ru: 'Длина' } },
      { tex: '\\vec{a}\\cdot\\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\varphi', label: { uz: 'Skalyar koʻpaytma', ru: 'Скалярное произведение' } },
      { tex: '\\vec{a}\\cdot\\vec{b} = x_1 x_2 + y_1 y_2 + z_1 z_2' },
    ],
  },
  {
    title: { uz: 'Stereometriya', ru: 'Стереометрия' },
    rows: [
      { tex: 'V = S_{\\text{as}}\\cdot H', label: { uz: 'Prizma', ru: 'Призма' } },
      { tex: 'V = \\dfrac{1}{3}S_{\\text{as}}\\cdot H', label: { uz: 'Piramida', ru: 'Пирамида' } },
      { tex: 'V = \\dfrac{H}{3}\\big(S_1 + \\sqrt{S_1 S_2} + S_2\\big)', label: { uz: 'Kesik piramida', ru: 'Усечённая пирамида' } },
      { tex: 'V = \\pi R^2 H, \\quad S_{\\text{yon}} = 2\\pi R H', label: { uz: 'Silindr', ru: 'Цилиндр' } },
      { tex: 'V = \\dfrac{1}{3}\\pi R^2 H, \\quad S_{\\text{yon}} = \\pi R l', label: { uz: 'Konus', ru: 'Конус' } },
      { tex: 'V = \\dfrac{4}{3}\\pi R^3, \\quad S = 4\\pi R^2', label: { uz: 'Shar', ru: 'Шар' } },
      { tex: 'V = \\pi H^2\\!\\left(R - \\dfrac{H}{3}\\right), \\quad S = 2\\pi R H', label: { uz: 'Shar segmenti', ru: 'Шаровой сегмент' } },
    ],
  },
]
</script>

<template>
  <div class="formula-reference space-y-5 text-[#1a1814]">
    <section
      v-for="(section, sIndex) in sections"
      :key="sIndex"
      class="overflow-hidden rounded-[6px] border border-[#e0ddd7] bg-white"
    >
      <h3
        class="font-mono-custom border-b border-[#e0ddd7] bg-[#f5f3ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1a1814]"
      >
        {{ section.title[lang] }}
      </h3>

      <ul class="divide-y divide-[#f0ece5]">
        <li
          v-for="(row, rIndex) in section.rows"
          :key="rIndex"
          class="flex items-center justify-between gap-4 px-4 py-2.5"
        >
          <span class="formula-tex text-[15px] leading-none" v-html="render(row.tex)"></span>
          <span
            v-if="row.label"
            class="shrink-0 text-right text-[12px] leading-tight text-[#8a857c]"
          >
            {{ row.label[lang] }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.formula-reference :deep(.katex) {
  color: #1a1814;
  font-size: 1em;
}

/* Keep long formulas from overflowing the narrow window without showing a
   scrollbar artifact. Widen the window (+ button) if a formula is clipped. */
.formula-tex {
  overflow: hidden;
  max-width: 100%;
}
</style>
