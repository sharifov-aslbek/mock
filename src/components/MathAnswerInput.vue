<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import jquery from 'jquery'
import katex from 'katex'
import 'mathquill/build/mathquill.css'
import 'katex/dist/katex.min.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  previewLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
const previewRef = ref(null)
let mathField = null
let mathQuillPromise

const renderKeyLabel = (label, isLatex = false) => {
  if (!isLatex) {
    return label
  }

  return katex.renderToString(label, {
    throwOnError: false,
  })
}

const keyboardRows = [
  [
    { key: '7', label: '7', action: 'text', value: '7' },
    { key: '8', label: '8', action: 'text', value: '8' },
    { key: '9', label: '9', action: 'text', value: '9' },
    { key: 'plus', label: '+', action: 'text', value: '+' },
    { key: 'minus', label: '-', action: 'text', value: '-' },
    { key: 'times', label: '\\times', action: 'latex', value: '\\times', latex: true },
    { key: 'divide', label: '\\div', action: 'latex', value: '\\div', latex: true },
  ],
  [
    { key: '4', label: '4', action: 'text', value: '4' },
    { key: '5', label: '5', action: 'text', value: '5' },
    { key: '6', label: '6', action: 'text', value: '6' },
    { key: 'left-paren', label: '(', action: 'text', value: '(' },
    { key: 'right-paren', label: ')', action: 'text', value: ')' },
    { key: 'equal', label: '=', action: 'text', value: '=' },
    { key: 'dot', label: '\\cdot', action: 'latex', value: '\\cdot', latex: true },
  ],
  [
    { key: '1', label: '1', action: 'text', value: '1' },
    { key: '2', label: '2', action: 'text', value: '2' },
    { key: '3', label: '3', action: 'text', value: '3' },
    { key: 'frac', label: '\\frac{a}{b}', action: 'cmd', value: '\\frac', latex: true },
    { key: 'sqrt', label: '\\sqrt{x}', action: 'cmd', value: '\\sqrt', latex: true },
    { key: 'square', label: 'x^2', action: 'write', value: '^2', latex: true },
    {
      key: 'subscript',
      label: 'x_n',
      action: 'write',
      value: '_{}',
      latex: true,
      after: ['Left'],
    },
  ],
  [
    { key: '0', label: '0', action: 'text', value: '0' },
    { key: 'x', label: 'x', action: 'text', value: 'x' },
    { key: 'y', label: 'y', action: 'text', value: 'y' },
    { key: 'z', label: 'z', action: 'text', value: 'z' },
    { key: 'pi', label: '\\pi', action: 'latex', value: '\\pi', latex: true },
    { key: 'theta', label: '\\theta', action: 'latex', value: '\\theta', latex: true },
    { key: 'alpha', label: '\\alpha', action: 'latex', value: '\\alpha', latex: true },
  ],
  [
    {
      key: 'sin',
      label: '\\sin',
      action: 'write',
      value: '\\sin\\left(\\right)',
      latex: true,
      after: ['Left'],
    },
    {
      key: 'cos',
      label: '\\cos',
      action: 'write',
      value: '\\cos\\left(\\right)',
      latex: true,
      after: ['Left'],
    },
    {
      key: 'tan',
      label: '\\tan',
      action: 'write',
      value: '\\tan\\left(\\right)',
      latex: true,
      after: ['Left'],
    },
    {
      key: 'log',
      label: '\\log',
      action: 'write',
      value: '\\log\\left(\\right)',
      latex: true,
      after: ['Left'],
    },
    {
      key: 'ln',
      label: '\\ln',
      action: 'write',
      value: '\\ln\\left(\\right)',
      latex: true,
      after: ['Left'],
    },
    {
      key: 'power',
      label: 'a^b',
      action: 'write',
      value: '^{}',
      latex: true,
      after: ['Left'],
    },
    {
      key: 'rootn',
      label: '\\sqrt[n]{x}',
      action: 'write',
      value: '\\sqrt[]{}',
      latex: true,
      after: ['Left', 'Left', 'Left'],
    },
  ],
  [
    { key: 'left', label: '←', action: 'keystroke', value: 'Left' },
    { key: 'right', label: '→', action: 'keystroke', value: 'Right' },
    { key: 'backspace', label: '⌫', action: 'keystroke', value: 'Backspace' },
    { key: 'clear', label: 'C', action: 'clear' },
  ],
].map((row) =>
  row.map((key) => ({
    ...key,
    displayLabel: renderKeyLabel(key.label, key.latex),
  })),
)

const renderPreview = (latex) => {
  if (!previewRef.value) {
    return
  }

  if (!latex) {
    previewRef.value.innerHTML = `<span class="math-answer-placeholder">${props.placeholder}</span>`
    return
  }

  try {
    katex.render(latex, previewRef.value, {
      throwOnError: false,
      displayMode: true,
    })
  } catch {
    previewRef.value.textContent = latex
  }
}

const syncValue = () => {
  if (!mathField) {
    return
  }

  const latex = mathField.latex()
  emit('update:modelValue', latex)
  renderPreview(latex)
}

const focusEditor = () => {
  if (mathField) {
    mathField.focus()
  }
}

const executeAfterKeys = (keys = []) => {
  if (!mathField) {
    return
  }

  keys.forEach((key) => {
    mathField.keystroke(key)
  })
}

const handleKeyboardPress = (key) => {
  if (!mathField) {
    return
  }

  if (key.action === 'clear') {
    mathField.latex('')
    focusEditor()
    syncValue()
    return
  }

  if (key.action === 'cmd') {
    mathField.cmd(key.value)
  } else if (key.action === 'keystroke') {
    mathField.keystroke(key.value)
  } else if (key.action === 'text') {
    mathField.typedText(key.value)
  } else {
    mathField.write(key.value)
  }

  executeAfterKeys(key.after)
  focusEditor()
  syncValue()
}

const loadMathQuill = async () => {
  if (typeof window === 'undefined') {
    return null
  }

  if (window.MathQuill) {
    return window.MathQuill.getInterface(2)
  }

  if (!mathQuillPromise) {
    window.jQuery = jquery
    window.$ = jquery

    mathQuillPromise = import('mathquill/build/mathquill.js').then(() =>
      window.MathQuill.getInterface(2),
    )
  }

  return mathQuillPromise
}

onMounted(async () => {
  const MQ = await loadMathQuill()

  if (!MQ || !editorRef.value) {
    return
  }

  mathField = MQ.MathField(editorRef.value, {
    spaceBehavesLikeTab: true,
    handlers: {
      edit: syncValue,
    },
  })

  if (props.modelValue) {
    mathField.latex(props.modelValue)
  }

  renderPreview(props.modelValue)
  focusEditor()
})

watch(
  () => props.modelValue,
  (value) => {
    if (mathField && value !== mathField.latex()) {
      mathField.latex(value || '')
    }

    renderPreview(value || '')
  },
  {
    immediate: true,
  },
)

onBeforeUnmount(() => {
  if (mathField?.revert) {
    mathField.revert()
  }
})
</script>

<template>
  <div class="space-y-3">
    <div class="rounded-[18px] border-2 border-black bg-white px-3 py-3">
      <div ref="editorRef" class="math-answer-editor min-h-7 text-base"></div>
    </div>

    <div class="space-y-1.5 rounded-[18px] border border-black/10 bg-[#fafafa] p-2.5">
      <div
        v-for="(row, rowIndex) in keyboardRows"
        :key="rowIndex"
        class="grid gap-1.5"
        :class="row.length > 4 ? 'grid-cols-4 sm:grid-cols-7' : 'grid-cols-4'"
      >
        <button
          v-for="key in row"
          :key="key.key"
          type="button"
          @click="handleKeyboardPress(key)"
          class="flex h-9 items-center justify-center px-2 text-xs font-medium transition sm:h-10"
          :class="
            key.action === 'clear'
              ? 'rounded-[14px] border border-red-200 bg-red-50 text-red-700 hover:border-red-500 hover:bg-red-100'
              : 'rounded-[14px] border border-black/10 bg-white text-black hover:border-black hover:bg-black hover:text-white'
          "
        >
          <span v-if="key.latex" class="math-key-label" v-html="key.displayLabel"></span>
          <span v-else>{{ key.displayLabel }}</span>
        </button>
      </div>
    </div>

    <div class="rounded-[18px] border border-black/10 bg-[#fafafa] px-3 py-3">
      <p class="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-black/45">
        {{ previewLabel }}
      </p>
      <div ref="previewRef" class="math-answer-preview min-h-10 overflow-x-auto text-black"></div>
    </div>
  </div>
</template>

<style scoped>
.math-answer-editor:deep(.mq-editable-field),
.math-answer-editor:deep(.mq-math-mode) {
  border: 0;
  box-shadow: none;
  font-size: 1rem;
  min-height: 1.75rem;
  padding: 0;
}

.math-answer-editor:deep(.mq-focused) {
  box-shadow: none;
}

.math-answer-editor:deep(.mq-root-block) {
  min-height: 1.75rem;
}

.math-key-label .katex {
  font-size: 0.9rem;
}

.math-answer-preview:deep(.katex-display) {
  margin: 0;
  text-align: left;
}

.math-answer-preview:deep(.math-answer-placeholder) {
  color: rgba(0, 0, 0, 0.35);
  font-size: 0.875rem;
}
</style>
