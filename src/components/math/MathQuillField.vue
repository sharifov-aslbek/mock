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

const emit = defineEmits(['update:modelValue', 'focus', 'toggle-keyboard'])

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

const normalizeLatexInput = (value) =>
  String(value || '')
    .replace(/\^\{\\circ\}/g, '^{\\text{°}}')
    .replace(/\\circ/g, '\\text{°}')
    .trim()

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
      class="relative overflow-hidden rounded-xl border-2 border-gray-300 bg-white shadow-sm transition-colors duration-150 hover:border-gray-400 focus-within:border-blue-500"
      :class="[
        disabled ? 'pointer-events-none opacity-60' : '',
        isFocused ? 'border-blue-500' : '',
      ]"
      @click="focus"
    >
      <span
        v-if="!currentLatex && placeholder"
        class="pointer-events-none absolute left-4 top-3 text-[14px] text-gray-400"
        :class="compact ? 'top-3.5' : ''"
      >
        {{ placeholder }}
      </span>

      <div
        ref="mathFieldHostRef"
        class="mq-host mq-field-root"
        :class="compact ? 'mq-compact' : ''"
      ></div>

      <div
        class="absolute right-3 z-10 flex items-start gap-2"
        :class="compact ? 'top-1.5' : 'top-3'"
      >
        <button
          type="button"
          class="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="Toggle keyboard"
          @mousedown.prevent="emit('toggle-keyboard')"
        >
          ⌨
        </button>
        <button
          v-if="!compact"
          type="button"
          class="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title="Options"
          @mousedown.prevent
        >
          ≡
        </button>
      </div>

      <span
        v-if="hasLoadError"
        class="block px-4 pb-3 text-[11px] uppercase tracking-[0.12em] text-[#b91c1c]"
      >
        Math editor failed to load
      </span>
    </div>
  </div>
</template>

<style scoped>
:deep(.mq-field-root) {
  display: block !important;
  width: 100% !important;
  min-height: 120px !important;
  max-height: 400px !important;
  overflow-x: auto !important;
  overflow-y: auto !important;
  padding-left: 32px !important;
  padding-right: 90px !important;
}

:deep(.mq-compact) {
  min-height: 56px !important;
  padding-left: 16px !important;
  padding-right: 50px !important;
}

:deep(.mq-compact .mq-root-block) {
  padding-top: 14px !important;
  padding-bottom: 14px !important;
}

:deep(.mq-field-root.mq-editable-field) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  display: block !important;
  width: 100% !important;
  min-height: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  color: #111827 !important;
  background: transparent !important;
  cursor: text;
  overflow: visible !important;
  word-wrap: break-word !important;
}

:deep(.mq-field-root .mq-root-block) {
  display: inline-block !important;
  font-weight: 700 !important;
  padding-top: 35px !important;
  padding-bottom: 35px !important;
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
  border-left: 2px solid #2563eb !important;
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
