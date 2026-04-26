<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
  openLabel: {
    type: String,
    default: '',
  },
  closeLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

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

const isFormulaPanelOpen = ref(false)
const isAlphabetMode = ref(false)
const activeKeyId = ref('')
const currentLatex = ref('')
const isFocused = ref(false)
const hasLoadError = ref(false)
const mathFieldHostRef = ref(null)
const mathFieldRef = ref(null)
const isApplyingExternalUpdate = ref(false)

let activeKeyTimeoutId = null
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

const setActiveKey = (keyId) => {
  activeKeyId.value = keyId

  if (activeKeyTimeoutId) {
    clearTimeout(activeKeyTimeoutId)
  }

  activeKeyTimeoutId = window.setTimeout(() => {
    activeKeyId.value = ''
    activeKeyTimeoutId = null
  }, 120)
}

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
    console.error('[MathAnswerInput] Failed to initialize MathQuill:', error)
    hasLoadError.value = true
  }
}

const focusMathField = () => {
  mathFieldRef.value?.focus()
}

const dispatchMathAction = (action) => {
  const mathField = mathFieldRef.value

  if (!mathField || !action) {
    return
  }

  focusMathField()

  if (action.type === 'cmd') {
    mathField.cmd(action.arg)
    return
  }

  if (action.type === 'write') {
    mathField.write(action.arg)
    return
  }

  if (action.type === 'typed') {
    mathField.typedText(action.arg)
    return
  }

  if (action.type === 'key') {
    mathField.keystroke(action.arg)
    return
  }

  if (action.type === 'custom') {
    action.fn(mathField)
  }
}

const handleKeyboardButton = (button) => {
  setActiveKey(button.id)

  if (button.onClick) {
    button.onClick()
    return
  }

  dispatchMathAction(button.action)
}

const handleFormulaToggle = () => {
  isFormulaPanelOpen.value = !isFormulaPanelOpen.value

  if (isFormulaPanelOpen.value) {
    window.setTimeout(() => {
      focusMathField()
    }, 0)
  }
}

const toggleLabel = computed(() =>
  isFormulaPanelOpen.value ? props.closeLabel : props.openLabel,
)

const symbolButtons = computed(() =>
  isAlphabetMode.value
    ? [
        { id: 'neq', content: '≠', action: { type: 'write', arg: '\\ne' } },
        { id: 'int', content: '∫', action: { type: 'typed', arg: '∫' } },
        { id: 'deg', content: '°', action: { type: 'write', arg: '^{\\text{°}}' } },
        {
          id: 'cases',
          content: '{',
          action: {
            type: 'custom',
            fn: (mathField) => {
              mathField.typedText('{')
            },
          },
        },
        { id: 'emptyset', content: '∅', action: { type: 'write', arg: '\\emptyset' } },
        { id: 'perp', content: '⊥', action: { type: 'write', arg: '\\perp' } },
        { id: 'in', content: '∈', action: { type: 'write', arg: '\\in' } },
        { id: 'infty', content: '∞', action: { type: 'write', arg: '\\infty' } },
        { id: 'cup', content: '∪', action: { type: 'write', arg: '\\cup' } },
        { id: 'cap', content: '∩', action: { type: 'write', arg: '\\cap' } },
        { id: 'subseteq', content: '⊆', action: { type: 'write', arg: '\\subseteq' } },
        { id: 'nsubseteq', content: '⊈', action: { type: 'write', arg: '\\not\\subseteq' } },
        { id: 'subset', content: '⊂', action: { type: 'write', arg: '\\subset' } },
        { id: 'cdot', content: '·', action: { type: 'write', arg: '\\cdot' } },
        { id: 'alpha', content: 'α', action: { type: 'write', arg: '\\alpha' } },
        { id: 'approx', content: '≈', action: { type: 'write', arg: '\\approx' } },
        { id: 'tilde', content: '~', action: { type: 'write', arg: '\\sim' } },
        { id: 'beta', content: 'β', action: { type: 'write', arg: '\\beta' } },
        { id: 'gamma', content: 'γ', action: { type: 'write', arg: '\\gamma' } },
        {
          id: '123',
          content: '1 2 3',
          span: 2,
          variant: 'muted',
          onClick: () => {
            isAlphabetMode.value = false
          },
        },
      ]
    : [
        { id: 'x', content: '<em>x</em>', isHtml: true, action: { type: 'typed', arg: 'x' } },
        { id: 'y', content: '<em>y</em>', isHtml: true, action: { type: 'typed', arg: 'y' } },
        {
          id: 'sq',
          content: '<em>a</em><sup>2</sup>',
          isHtml: true,
          action: { type: 'write', arg: '^{2}' },
        },
        {
          id: 'pow',
          content: '<em>a</em><sup><em>b</em></sup>',
          isHtml: true,
          action: { type: 'cmd', arg: '^' },
        },
        { id: 'lp', content: '(', action: { type: 'typed', arg: '(' } },
        { id: 'rp', content: ')', action: { type: 'typed', arg: ')' } },
        {
          id: 'system',
          content: '{',
          action: {
            type: 'custom',
            fn: (mathField) => {
              mathField.write('\\left\\{\\right.')
              mathField.keystroke('Left')
            },
          },
        },
        { id: 'lt', content: '&lt;', isHtml: true, action: { type: 'typed', arg: '<' } },
        { id: 'gt', content: '&gt;', isHtml: true, action: { type: 'typed', arg: '>' } },
        { id: 'abs', content: '|<em>a</em>|', isHtml: true, action: { type: 'typed', arg: '|' } },
        {
          id: 'sub_script',
          content: '<em>a</em><sub><em>b</em></sub>',
          isHtml: true,
          action: { type: 'cmd', arg: '_' },
        },
        { id: 'le', content: '≤', action: { type: 'write', arg: '\\le' } },
        { id: 'ge', content: '≥', action: { type: 'write', arg: '\\ge' } },
        { id: 'pi', content: 'π', action: { type: 'write', arg: '\\pi' } },
        { id: 'nthroot', content: 'n√', action: { type: 'cmd', arg: '\\nthroot' } },
        { id: 'sqrt', content: '√', action: { type: 'cmd', arg: '\\sqrt' } },
        {
          id: 'abc',
          content: 'A B C',
          span: 4,
          variant: 'muted',
          onClick: () => {
            isAlphabetMode.value = true
          },
        },
      ],
)

const numberButtons = [
  { id: '7n', content: '7', variant: 'muted', action: { type: 'typed', arg: '7' } },
  { id: '8n', content: '8', variant: 'muted', action: { type: 'typed', arg: '8' } },
  { id: '9n', content: '9', variant: 'muted', action: { type: 'typed', arg: '9' } },
  {
    id: 'frac',
    content: '<span>a</span><span class="mx-1">/</span><span>b</span>',
    isHtml: true,
    action: { type: 'cmd', arg: '\\frac' },
  },
  { id: '4n', content: '4', variant: 'muted', action: { type: 'typed', arg: '4' } },
  { id: '5n', content: '5', variant: 'muted', action: { type: 'typed', arg: '5' } },
  { id: '6n', content: '6', variant: 'muted', action: { type: 'typed', arg: '6' } },
  { id: 'mul', content: '×', action: { type: 'write', arg: '\\cdot' } },
  { id: '1n', content: '1', variant: 'muted', action: { type: 'typed', arg: '1' } },
  { id: '2n', content: '2', variant: 'muted', action: { type: 'typed', arg: '2' } },
  { id: '3n', content: '3', variant: 'muted', action: { type: 'typed', arg: '3' } },
  { id: 'sub', content: '−', action: { type: 'typed', arg: '-' } },
  { id: '0n', content: '0', variant: 'muted', action: { type: 'typed', arg: '0' } },
  { id: 'dot', content: '.', variant: 'muted', action: { type: 'typed', arg: '.' } },
  { id: 'eq', content: '=', variant: 'muted', action: { type: 'typed', arg: '=' } },
  { id: 'add', content: '+', action: { type: 'typed', arg: '+' } },
]

const controlButtons = [
  { id: 'fn', content: 'functions', span: 2, variant: 'muted' },
  { id: 'space', content: 'SPACE', span: 2, variant: 'muted', action: { type: 'write', arg: '\\ ' } },
  { id: 'left', content: '←', variant: 'muted', action: { type: 'key', arg: 'Left' } },
  { id: 'right', content: '→', variant: 'muted', action: { type: 'key', arg: 'Right' } },
  { id: 'bs', content: '⌫', span: 2, variant: 'muted', action: { type: 'key', arg: 'Backspace' } },
  { id: 'enter', content: '↵', span: 2, tall: true, variant: 'primary', action: { type: 'key', arg: 'Enter' } },
]

const keyboardButtonClasses = (button) => {
  const classes = [
    'font-mono-custom',
    'flex',
    'items-center',
    'justify-center',
    'min-w-0',
    'rounded-[10px]',
    'border',
    'px-2',
    'text-center',
    'text-[12px]',
    'leading-none',
    'transition',
    'whitespace-nowrap',
    'sm:rounded-[12px]',
    'sm:text-[13px]',
    button.tall ? 'h-16' : 'h-9 sm:h-10',
    button.span === 2 ? 'col-span-2' : '',
    button.span === 4 ? 'col-span-4' : '',
  ]

  if (button.variant === 'primary') {
    classes.push('border-[#1a1814]', 'bg-[#1a1814]', 'text-white', 'hover:bg-[#2d2a25]')
  } else if (button.variant === 'muted') {
    classes.push(
      'border-[#d7d1c7]',
      'bg-[#f0ece4]',
      'text-[#1a1814]',
      'hover:border-[#1a1814]',
      'hover:bg-[#ebe4d8]',
    )
  } else {
    classes.push(
      'border-[#d1cec7]',
      'bg-white',
      'text-[#1a1814]',
      'hover:border-[#1a1814]',
      'hover:bg-[#f2ede4]',
    )
  }

  if (button.id === activeKeyId.value) {
    classes.push('scale-[0.98]', 'border-[#1a1814]', 'bg-[#efe7db]')
  }

  return classes.join(' ')
}

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

  if (activeKeyTimeoutId) {
    clearTimeout(activeKeyTimeoutId)
  }

  removeFieldListeners?.()

  if (mathFieldRef.value?.revert) {
    mathFieldRef.value.revert()
  }
})
</script>

<template>
  <div class="space-y-3">
    <div
      class="relative rounded-[14px] border border-[#e3dcd1] bg-[#fffdfa] px-3 py-2.5 shadow-[0_6px_18px_rgba(26,24,20,0.04)] sm:rounded-[16px] sm:px-4 sm:py-3"
      :class="isFocused ? 'border-[#1a1814]' : ''"
      @click="focusMathField"
    >
      <span
        v-if="!currentLatex"
        class="pointer-events-none absolute left-3 top-2.5 text-[14px] text-[#8a857c]/80 sm:left-4 sm:top-3 sm:text-[15px]"
      >
        {{ placeholder }}
      </span>

      <div ref="mathFieldHostRef" class="answer-mq-host"></div>

      <span
        v-if="hasLoadError"
        class="mt-1 block text-[11px] uppercase tracking-[0.12em] text-[#b91c1c]"
      >
        Math editor failed to load
      </span>
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        @click="handleFormulaToggle"
        class="inline-flex h-10 w-full items-center justify-center rounded-[16px] border border-[#d1cec7] bg-[#faf8f4] px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1a1814] transition hover:border-[#1a1814] hover:bg-[#f2ede4] sm:w-auto sm:rounded-[18px] sm:px-5 sm:text-[12px] sm:whitespace-nowrap"
      >
        {{ toggleLabel }}
      </button>
    </div>

    <div
      v-if="isFormulaPanelOpen"
      class="rounded-[14px] border border-[#e3dcd1] bg-[#faf8f4] p-3 shadow-[0_10px_24px_rgba(26,24,20,0.06)] sm:rounded-[16px] sm:p-4"
    >
      <div class="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1.08fr)_minmax(240px,0.92fr)]">
        <div class="grid grid-cols-4 gap-2.5 sm:gap-3">
          <button
            v-for="button in symbolButtons"
            :key="button.id"
            type="button"
            :class="keyboardButtonClasses(button)"
            @mousedown.prevent="handleKeyboardButton(button)"
          >
            <span v-if="button.isHtml" v-html="button.content"></span>
            <span v-else>{{ button.content }}</span>
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2.5 sm:gap-3">
          <button
            v-for="button in numberButtons"
            :key="button.id"
            type="button"
            :class="keyboardButtonClasses(button)"
            @mousedown.prevent="handleKeyboardButton(button)"
          >
            <span v-if="button.isHtml" v-html="button.content"></span>
            <span v-else>{{ button.content }}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            v-for="button in controlButtons"
            :key="button.id"
            type="button"
            :class="keyboardButtonClasses(button)"
            @mousedown.prevent="handleKeyboardButton(button)"
          >
            <span v-if="button.isHtml" v-html="button.content"></span>
            <span v-else>{{ button.content }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.answer-mq-host) {
  min-height: 2.6rem;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

:deep(.answer-mq-host.mq-editable-field) {
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  font-size: 14px !important;
  line-height: 1.65 !important;
  color: #1a1814 !important;
  font-family: 'DM Sans', sans-serif !important;
}

@media (min-width: 640px) {
  :deep(.answer-mq-host.mq-editable-field) {
    font-size: 15px !important;
    line-height: 1.7 !important;
  }
}

:deep(.answer-mq-host .mq-root-block) {
  padding: 0.15rem 0 0.1rem !important;
  white-space: nowrap !important;
}

:deep(.answer-mq-host .mq-math-mode),
:deep(.answer-mq-host .mq-math-mode *) {
  color: #1a1814 !important;
}

:deep(.answer-mq-host .mq-focused) {
  box-shadow: none !important;
}

:deep(.answer-mq-host .mq-cursor) {
  border-left: 2px solid #1a1814 !important;
}

:deep(.answer-mq-host .mq-selection),
:deep(.answer-mq-host .mq-selection .mq-non-leaf),
:deep(.answer-mq-host .mq-selection span) {
  background: rgba(26, 24, 20, 0.12) !important;
  color: #1a1814 !important;
}

:deep(.answer-mq-host .mq-empty .mq-root-block:before) {
  content: '' !important;
}
</style>
