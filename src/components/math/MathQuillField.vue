<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'mathquill/build/mathquill.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'focus'])

let mathQuillLoaderPromise = null

const loadMathQuill = async () => {
  if (window.MathQuill?.getInterface) {
    return window.MathQuill.getInterface(2)
  }

  if (!mathQuillLoaderPromise) {
    mathQuillLoaderPromise = (async () => {
      if (!window.jQuery) {
        await import('mathquill/formula/jquery.min.js')

        if (!window.jQuery) {
          const jqueryModule = await import('mathquill/node_modules/jquery/dist/jquery.js')
          const jqueryInstance = jqueryModule.default || window.jQuery || window.$

          if (jqueryInstance) {
            window.jQuery = jqueryInstance
            window.$ = jqueryInstance
          }
        }
      }

      await import('mathquill/build/mathquill.js')

      if (!window.MathQuill?.getInterface) {
        throw new Error('MathQuill interface is unavailable after local import')
      }

      return window.MathQuill.getInterface(2)
    })()
  }

  return mathQuillLoaderPromise
}

const mathFieldHostRef = ref(null)
const mathFieldRef = ref(null)
const currentLatex = ref('')
const isFocused = ref(false)
const hasLoadError = ref(false)
const isApplyingExternalUpdate = ref(false)

let removeFieldListeners = null
let isUnmounted = false

// MathQuill expects `\text{°}` for the degree symbol. Map every degree
// shorthand we see in the wild to that canonical form so MathQuill renders a
// real degree mark instead of leaving raw characters / braces visible.
//
// Inside a superscript group `^{…}` we also treat a *standalone* `o` (Latin)
// or `о` (Cyrillic) as a degree, because Uzbek/Russian math text writes
// angles as `105^{o}`. This is scoped to braces with nothing but the o, so
// real superscripted variables like `x^{o+1}` are left untouched. Outside a
// superscript we never reinterpret a lone `o`.
const normalizeLatexInput = (value) => {
  return String(value || '')
    // A bare brace group right after a number is the API's shorthand for a
    // degree mark — `94{o}` means 94°. Convert it BEFORE the other patterns
    // so the `o` inside doesn't get reinterpreted as a variable.
    .replace(/(\d)\s*\{\s*(?:∘|°|º|˚|ᵒ|o|о|\\circ)\s*\}/g, '$1^{\\text{°}}')
    .replace(/\^\s*\{\s*(?:∘|°|º|˚|ᵒ|o|о|\\circ)\s*\}/g, '^{\\text{°}}')
    .replace(/\^\s*(?:∘|°|º|˚|ᵒ|\\circ)\b/g, '^{\\text{°}}')
    .replace(/(\d)\s*(?:∘|°|º|˚|ᵒ)/g, '$1^{\\text{°}}')
    .replace(/\\circ\b/g, '\\text{°}')
    .replace(/[∘°º˚ᵒ]/g, '\\text{°}')
    .trim()
}

const extractIncomingValue = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return ''
  }

  if (!normalizedValue.includes('<') || typeof document === 'undefined') {
    return normalizeLatexInput(normalizedValue)
  }

  const container = document.createElement('div')
  container.innerHTML = normalizedValue

  container.querySelectorAll('[data-type="inline-math"]').forEach((node) => {
    const latexValue =
      node.getAttribute('data-latex') ||
      node.getAttribute('data-math-latex') ||
      node.getAttribute('data-math') ||
      node.textContent ||
      ''

    node.replaceWith(document.createTextNode(` ${latexValue} `))
  })

  return normalizeLatexInput((container.textContent || '').replace(/\s+/g, ' ').trim())
}

currentLatex.value = extractIncomingValue(props.modelValue)

const syncFromMathField = () => {
  const mathField = mathFieldRef.value

  if (!mathField) {
    return
  }

  const nextLatex = normalizeLatexInput(mathField.latex())
  currentLatex.value = nextLatex

  if (!isApplyingExternalUpdate.value) {
    emit('update:modelValue', nextLatex)
  }
}

const syncMathFieldValue = (value) => {
  const nextLatex = extractIncomingValue(value)
  currentLatex.value = nextLatex

  if (!mathFieldRef.value) {
    return
  }

  if (normalizeLatexInput(mathFieldRef.value.latex()) === nextLatex) {
    return
  }

  isApplyingExternalUpdate.value = true
  mathFieldRef.value.latex(nextLatex)
  isApplyingExternalUpdate.value = false
}

const focus = () => {
  mathFieldRef.value?.focus()
}

const isInsideSystemBlock = () => normalizeLatexInput(mathFieldRef.value?.latex() || '').includes('\\left\\{')

const handleNativeKeyDown = (event) => {
  const mathField = mathFieldRef.value

  if (!mathField) {
    return
  }

  const rootElement = typeof mathField.el === 'function' ? mathField.el() : mathFieldHostRef.value
  const isMathFieldFocused = rootElement?.contains(document.activeElement)

  if (!isMathFieldFocused) {
    return
  }

  if (event.key === '/' && isInsideSystemBlock()) {
    event.preventDefault()
    event.stopPropagation()
    mathField.write('/')
    return
  }

  if ((event.key === 'Enter' || event.keyCode === 13) && event.shiftKey && isInsideSystemBlock()) {
    event.preventDefault()
    event.stopPropagation()
    mathField.cmd('/')
    return
  }

  if (event.key === ' ' || event.code === 'Space') {
    event.preventDefault()
    mathField.write('\\ ')
    return
  }

  if (event.key === '{') {
    event.preventDefault()
    mathField.write('\\left\\{\\right\\}')
    mathField.keystroke('Left')
  }
}

const attachFieldListeners = () => {
  const mathField = mathFieldRef.value
  const rootElement = typeof mathField?.el === 'function' ? mathField.el() : mathFieldHostRef.value

  if (!rootElement) {
    return
  }

  const handleFocusIn = () => {
    isFocused.value = true
    emit('focus')
  }

  const handleFocusOut = () => {
    window.setTimeout(() => {
      const nextActiveElement = document.activeElement
      isFocused.value = Boolean(rootElement.contains(nextActiveElement))
    }, 0)
  }

  rootElement.addEventListener('focusin', handleFocusIn)
  rootElement.addEventListener('focusout', handleFocusOut)
  document.addEventListener('keydown', handleNativeKeyDown, true)

  removeFieldListeners = () => {
    rootElement.removeEventListener('focusin', handleFocusIn)
    rootElement.removeEventListener('focusout', handleFocusOut)
    document.removeEventListener('keydown', handleNativeKeyDown, true)
  }
}

const initializeMathField = async () => {
  try {
    const MQ = await loadMathQuill()

    if (isUnmounted || !mathFieldHostRef.value) {
      return
    }

    const mathField = MQ.MathField(mathFieldHostRef.value, {
      spaceBehavesLikeTab: false,
      leftRightIntoCmdGoes: 'up',
      restrictMismatchedBrackets: false,
      supSubsRequireOperand: false,
      charsThatBreakOutOfSupSub: '+-=<>',
      autoCommands: 'theta sqrt nthroot',
      autoOperatorNames: 'dummyop',
      handlers: {
        edit: () => {
          syncFromMathField()
        },
      },
    })

    mathFieldRef.value = mathField
    isApplyingExternalUpdate.value = true
    mathField.latex(currentLatex.value)
    syncFromMathField()
    isApplyingExternalUpdate.value = false
    attachFieldListeners()
  } catch (error) {
    console.error('[MathQuillField] Failed to initialize MathQuill:', error)
    hasLoadError.value = true
  }
}

const cmd = (latexCmd) => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) return
  mathField.focus()
  mathField.cmd(latexCmd)
}

const write = (latex) => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) return
  mathField.focus()
  mathField.write(latex)
}

const typedText = (text) => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) return
  mathField.focus()
  mathField.typedText(text)
}

const keystroke = (key) => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) return
  mathField.focus()
  mathField.keystroke(key)
}

const getLatex = () => mathFieldRef.value?.latex() ?? ''

watch(
  () => props.modelValue,
  (value) => {
    if (isApplyingExternalUpdate.value) {
      return
    }

    syncMathFieldValue(value)
  },
)

onMounted(() => {
  initializeMathField()
})

onBeforeUnmount(() => {
  isUnmounted = true
  removeFieldListeners?.()

  if (mathFieldRef.value?.revert) {
    mathFieldRef.value.revert()
  }
})

defineExpose({
  cmd,
  write,
  typedText,
  keystroke,
  focus,
  getLatex,
})
</script>

<template>
  <div class="relative" @focus.capture="emit('focus')">
    <div
      class="mq-shell relative rounded-2xl border border-[#e0ddd7] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-150 hover:border-[#bcb7ad]"
      :class="[
        disabled ? 'pointer-events-none opacity-60' : '',
        isFocused ? 'border-[#1a1814] shadow-[0_4px_14px_rgba(15,23,42,0.08)]' : '',
      ]"
      @click="focus"
    >
      <span
        v-if="!currentLatex && placeholder"
        class="pointer-events-none absolute inset-y-0 left-5 flex items-center text-[15px] font-normal text-[#9b958c]"
      >
        {{ placeholder }}
      </span>

      <div
        ref="mathFieldHostRef"
        class="mq-host mq-field-root"
        :class="compact ? 'mq-compact' : ''"
      ></div>

      <span
        v-if="hasLoadError"
        class="absolute left-5 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.12em] text-[#b91c1c]"
      >
        Math editor failed to load
      </span>
    </div>
  </div>
</template>

<style scoped>
.mq-shell {
  cursor: text;
}

:deep(.mq-field-root) {
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  min-height: 96px !important;
  max-height: 400px !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  padding: 28px 24px !important;
}

:deep(.mq-compact) {
  min-height: 96px !important;
  padding: 28px 24px !important;
}

:deep(.mq-compact .mq-root-block) {
  padding: 0 !important;
}

:deep(.mq-field-root.mq-editable-field) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  width: 100% !important;
  min-height: 96px !important;
  max-width: 100% !important;
  padding: 28px 24px !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  color: #1a1814 !important;
  background: transparent !important;
  cursor: text;
  overflow: visible !important;
  word-wrap: break-word !important;
}

:deep(.mq-field-root .mq-root-block) {
  display: inline-block !important;
  font-weight: 500 !important;
  padding: 0 !important;
  vertical-align: middle !important;
}

:deep(.mq-field-root .mq-nthroot) {
  margin-left: 4px !important;
}

:deep(.mq-field-root .mq-editable-field.mq-focused) {
  box-shadow: none !important;
  outline: none !important;
}

:deep(.mq-field-root .mq-math-mode),
:deep(.mq-field-root .mq-math-mode *) {
  color: #111827 !important;
  font-weight: 700 !important;
}

:deep(.mq-field-root .mq-cursor) {
  border-left: 1.5px solid #1a1814 !important;
  vertical-align: middle !important;
  height: 1.1em !important;
}

:deep(.mq-field-root .mq-selection),
:deep(.mq-field-root .mq-selection .mq-non-leaf),
:deep(.mq-field-root .mq-selection span) {
  background-color: rgba(37, 99, 235, 0.15) !important;
  color: #111827 !important;
}

:deep(.mq-field-root .mq-fraction .mq-fraction-line) {
  border-top-color: #111827 !important;
  border-top-width: 1.5px !important;
}

:deep(.mq-field-root .mq-sup),
:deep(.mq-field-root .mq-sub) {
  color: #111827 !important;
  font-size: 1.2em !important;
}

:deep(.mq-field-root .mq-sup .mq-text) {
  font-size: 1.6em !important;
  line-height: 0.8 !important;
  font-family: Arial, sans-serif !important;
  display: inline-block;
  transform: translateY(2px);
}

:deep(.mq-field-root .mq-empty .mq-root-block:before) {
  content: '' !important;
}

:deep(.mq-field-root .mq-non-leaf),
:deep(.mq-field-root .mq-array.mq-non-leaf) {
  background: transparent !important;
}

:deep(.mq-field-root .mq-paren),
:deep(.mq-field-root .mq-bracket-l),
:deep(.mq-field-root .mq-bracket-r) {
  color: #374151 !important;
  padding: 0 1px !important;
  font-weight: 700 !important;
  font-size: 0.75em !important;
  vertical-align: baseline !important;
}
</style>
