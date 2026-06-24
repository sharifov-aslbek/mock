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

// Last LaTeX we read back cleanly from MathQuill. Used to recover if a later
// edit corrupts MathQuill's internal tree (see recover()).
const lastGoodLatex = ref('')

const syncFromMathField = () => {
  const mathField = mathFieldRef.value

  if (!mathField) {
    return
  }

  const nextLatex = normalizeLatexInput(mathField.latex())
  currentLatex.value = nextLatex
  lastGoodLatex.value = nextLatex

  if (!isApplyingExternalUpdate.value) {
    emit('update:modelValue', nextLatex)
  }
}

// This old MathQuill build can throw internal "prayer failed" assertions on
// some edit sequences. Most are NON-fatal — MathQuill keeps working fine — so
// we must not "recover" by reverting to a previous value: doing that silently
// undoes valid keystrokes and makes typing feel broken. We just swallow the
// error so it can't crash the handler; the Tozalash/clear button is the escape
// hatch for the rare case the field actually gets stuck.
const safeOp = (fn) => {
  try {
    fn()
  } catch (error) {
    console.warn('[MathQuillField] ignored a MathQuill error:', error)
  }
}

// Reset the field to empty. Always works (latex('') rebuilds the tree from
// scratch), so it doubles as the escape hatch for a stuck field.
const clear = () => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) {
    return
  }
  isApplyingExternalUpdate.value = true
  try {
    mathField.latex('')
  } catch {
    /* ignore */
  }
  isApplyingExternalUpdate.value = false
  lastGoodLatex.value = ''
  currentLatex.value = ''
  emit('update:modelValue', '')
  try {
    mathField.focus()
  } catch {
    /* ignore */
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

  // Space advances the cursor out of the current sub-block (root, exponent,
  // fraction…) instead of injecting a "\ " space inside it. Injecting a space
  // used to trap the cursor inside the construct (e.g. typing inside a root,
  // pressing space, then being unable to type after it — producing malformed
  // output like \sqrt{3\ }).
  if (event.key === ' ' || event.code === 'Space') {
    event.preventDefault()
    safeOp(() => mathField.keystroke('Right'))
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
  safeOp(() => mathField.cmd(latexCmd))
}

const write = (latex) => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) return
  mathField.focus()
  safeOp(() => mathField.write(latex))
}

const typedText = (text) => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) return
  mathField.focus()
  safeOp(() => mathField.typedText(text))
}

const keystroke = (key) => {
  const mathField = mathFieldRef.value
  if (!mathField || props.disabled) return
  mathField.focus()
  safeOp(() => mathField.keystroke(key))
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
  clear,
})
</script>

<template>
  <div class="relative" @focus.capture="emit('focus')">
    <div
      class="mq-shell relative rounded-2xl border border-[#e0ddd7] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-150 hover:border-[#bcb7ad]"
      :class="[
        disabled ? 'pointer-events-none opacity-60' : '',
        isFocused ? 'border-[#1a1814] shadow-[0_4px_14px_rgba(15,23,42,0.08)]' : '',
        (!currentLatex && isFocused) ? 'mq-hide-native-caret' : '',
      ]"
      @click="focus"
    >
      <!-- A clear blinking caret, shown only when THIS field is focused and
           empty (i.e. the user clicked into it), so just the active field shows
           a cursor — never every empty field at once. MathQuill's own thin
           caret is hidden in that state so there's exactly one cursor; once the
           user types, this hides and MathQuill's caret takes over. -->
      <span
        v-if="!currentLatex && isFocused"
        class="mq-fake-caret"
        aria-hidden="true"
      ></span>

      <span
        v-if="!currentLatex && placeholder"
        class="pointer-events-none absolute inset-y-0 flex items-center text-[15px] font-normal text-[#9b958c]"
        :class="isFocused ? 'left-[34px]' : 'left-5'"
      >
        {{ placeholder }}
      </span>

      <!-- IMPORTANT: this element is owned by MathQuill, which adds its own
           classes (mq-editable-field, mq-math-mode, mq-focused) directly to the
           DOM. Do NOT put a *changing* :class binding here — Vue would re-patch
           the class attribute on every keystroke/focus change and clobber
           MathQuill's classes, breaking all of MathQuill's CSS. `compact` is a
           fixed prop, so its binding never changes and is safe. State-dependent
           classes (e.g. mq-hide-native-caret) live on the shell instead. -->
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

/* Custom typing indicator shown while the field is empty. Sits at the field's
   text start (matches the 24px content padding) and blinks like a native caret. */
.mq-fake-caret {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 22px;
  background: #1a1814;
  border-radius: 1px;
  pointer-events: none;
  z-index: 2;
  animation: mq-caret-blink 1.06s steps(1, end) infinite;
}

@keyframes mq-caret-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

/* While the custom caret is showing (empty field), hide MathQuill's own thin
   caret so there is exactly one cursor. */
:deep(.mq-hide-native-caret .mq-cursor) {
  display: none !important;
}

/* MathQuill's input proxy is a real <textarea>. A global textarea reset
   (Tailwind preflight: resize:vertical + a focus outline) was overriding
   MathQuill's own hiding rules, leaving a visible ~177x48 box with a resize
   grip and focus ring on click. Force it back to an invisible 1px proxy so the
   only thing the user sees is our caret. Input still works (it stays focused). */
:deep(.mq-field-root .mq-textarea textarea),
:deep(.mq-field-root textarea) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  resize: none !important;
  opacity: 0 !important;
  clip: rect(0 0 0 0) !important;
  -webkit-appearance: none !important;
  appearance: none !important;
}

/* ---------------------------------------------------------------------------
   Field container. We present MathQuill's editable field as a large, padded
   text box (it defaults to a small inline field with a 1px border + blue focus
   glow). Everything below is intentional container/caret styling only — the
   math layout itself (exponents, fractions, roots, parens…) is left to
   MathQuill's own CSS, which is loaded and wins the cascade. Do NOT re-add
   per-construct layout overrides here; they fight MathQuill and cause the
   "fix one thing, break another" churn.
   --------------------------------------------------------------------------- */
:deep(.mq-field-root.mq-editable-field) {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 96px;
  max-height: 400px;
  overflow: auto;
  padding: 24px;
  margin: 0;
  font-size: 16px;
  color: #1a1814;
  background: transparent;
  border: none;
  box-shadow: none;
  outline: none;
  cursor: text;
}

:deep(.mq-compact) {
  min-height: 96px;
  padding: 24px;
}

:deep(.mq-field-root.mq-editable-field.mq-focused) {
  box-shadow: none;
  outline: none;
}

/* MathQuill's own caret (shown once the user has typed content). Our custom
   empty-field caret is .mq-fake-caret above. */
:deep(.mq-field-root .mq-cursor) {
  border-left: 2px solid #1a1814;
}

/* Selection highlight */
:deep(.mq-field-root .mq-selection),
:deep(.mq-field-root .mq-selection .mq-non-leaf),
:deep(.mq-field-root .mq-selection span) {
  background-color: rgba(37, 99, 235, 0.15);
}

/* Suppress MathQuill's empty-field 'c' placeholder glyph — we draw our own
   caret + placeholder. */
:deep(.mq-field-root .mq-empty .mq-root-block:before) {
  content: '' !important;
}
</style>
