<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Mathematics } from '@tiptap/extension-mathematics'
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

const formulaInput = ref('')
const isFormulaPanelOpen = ref(false)
const activeFormulaPos = ref(null)

const keyboardRows = [
  [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '+', value: '+' },
    { label: '-', value: '-' },
  ],
  [
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '×', value: '*' },
    { label: '÷', value: '/' },
  ],
  [
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
  ],
  [
    { label: '0', value: '0', span: 2 },
    { label: '.', value: '.' },
    { label: '√', value: 'sqrt(x)' },
    { label: '^', value: '^' },
  ],
  [
    { label: 'x', value: 'x' },
    { label: 'y', value: 'y' },
    { label: 'π', value: 'π' },
    { label: '=', value: '=' },
    { label: '⌫', value: '__backspace__', variant: 'danger' },
  ],
  [
    { label: 'sin', value: 'sin(x)' },
    { label: 'log', value: 'log(x)' },
    { label: 'frac', value: 'frac(a,b)' },
    { label: 'C', value: '__clear__', variant: 'danger' },
  ],
]

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const normalizeContent = (value) => {
  const normalizedValue = typeof value === 'string' ? value.trim() : ''

  if (!normalizedValue) {
    return '<p></p>'
  }

  if (normalizedValue.startsWith('<')) {
    return value
  }

  return `<p>${escapeHtml(value)}</p>`
}

const latexToFriendlyMath = (value) => {
  if (!value) {
    return ''
  }

  return value
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, 'frac($1,$2)')
    .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)')
    .replace(/\\pi/g, 'π')
    .replace(/\\(sin|cos|tan|log|ln)\s*/g, '$1')
}

const friendlyMathToLatex = (value) => {
  if (!value) {
    return ''
  }

  let nextValue = value

  nextValue = nextValue.replace(/π/g, '\\pi')
  nextValue = nextValue.replace(/\bfrac\s*\(([^,()]+)\s*,\s*([^()]+)\)/g, '\\frac{$1}{$2}')
  nextValue = nextValue.replace(/\bsqrt\s*\(([^()]+)\)/g, '\\sqrt{$1}')
  nextValue = nextValue.replace(/√\s*\(([^()]+)\)/g, '\\sqrt{$1}')
  nextValue = nextValue.replace(/√([A-Za-z0-9]+)/g, '\\sqrt{$1}')
  nextValue = nextValue.replace(/\b(sin|cos|tan|log|ln)\s*\(/g, '\\$1(')

  return nextValue
}

const openFormulaEditor = (latex = '', pos = null) => {
  formulaInput.value = latexToFriendlyMath(latex || '')
  activeFormulaPos.value = typeof pos === 'number' ? pos : null
  isFormulaPanelOpen.value = true
}

const closeFormulaEditor = () => {
  formulaInput.value = ''
  activeFormulaPos.value = null
  isFormulaPanelOpen.value = false
  editor.value?.setEditable(true)
  editor.value?.chain().focus().run()
}

const editor = useEditor({
  content: normalizeContent(props.modelValue),
  extensions: [
    StarterKit.configure({
      blockquote: false,
      bulletList: false,
      codeBlock: false,
      code: false,
      heading: false,
      horizontalRule: false,
      listItem: false,
      orderedList: false,
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    Mathematics.configure({
      inlineOptions: {
        onClick: (node, pos) => {
          openFormulaEditor(node.attrs.latex, pos)
        },
      },
      katexOptions: {
        throwOnError: false,
        strict: 'ignore',
      },
    }),
  ],
  editorProps: {
    attributes: {
      class: 'answer-editor-content',
    },
    handleKeyDown(_, event) {
      if (event.key === 'Enter') {
        event.preventDefault()
        return true
      }

      return false
    },
  },
  onUpdate: ({ editor: currentEditor }) => {
    emit('update:modelValue', currentEditor.getHTML())
  },
})

const toggleLabel = computed(() =>
  isFormulaPanelOpen.value ? props.closeLabel : props.openLabel,
)

const handleFormulaToggle = () => {
  if (isFormulaPanelOpen.value) {
    closeFormulaEditor()
    editor.value?.chain().focus().run()
    return
  }

  openFormulaEditor()
  editor.value?.setEditable(false)
  editor.value?.chain().focus().run()
}

const syncFormulaToEditor = () => {
  const currentEditor = editor.value
  const friendlyValue = formulaInput.value.trim()
  const latex = friendlyMathToLatex(friendlyValue)

  if (!currentEditor) {
    return
  }

  if (!latex) {
    if (activeFormulaPos.value !== null) {
      currentEditor.chain().focus().deleteInlineMath({ pos: activeFormulaPos.value }).run()
      activeFormulaPos.value = null
    }
    return
  }

  if (activeFormulaPos.value !== null) {
    const updated = currentEditor
      .chain()
      .focus()
      .updateInlineMath({ pos: activeFormulaPos.value, latex })
      .run()

    if (!updated) {
      const insertionPos = currentEditor.state.selection.from
      currentEditor.chain().focus().insertInlineMath({ latex }).run()
      activeFormulaPos.value = insertionPos
    }
  } else {
    const insertionPos = currentEditor.state.selection.from
    currentEditor.chain().focus().insertInlineMath({ latex }).run()
    activeFormulaPos.value = insertionPos
  }
}

const appendQuickFormula = (value) => {
  if (value === '__backspace__') {
    formulaInput.value = formulaInput.value.trimEnd().slice(0, -1).trimEnd()
    return
  }

  if (value === '__clear__') {
    formulaInput.value = ''
    return
  }

  formulaInput.value = formulaInput.value
    ? `${formulaInput.value} ${value}`
    : value
}

watch(
  () => props.modelValue,
  (value) => {
    const currentEditor = editor.value

    if (!currentEditor) {
      return
    }

    const normalizedContent = normalizeContent(value)

    if (normalizedContent !== currentEditor.getHTML()) {
      currentEditor.commands.setContent(normalizedContent, false)
    }
  },
)

watch(formulaInput, () => {
  if (!isFormulaPanelOpen.value) {
    return
  }

  syncFormulaToEditor()
})

watch(isFormulaPanelOpen, (value) => {
  if (!editor.value) {
    return
  }

  editor.value.setEditable(!value)
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="space-y-3">
    <div class="rounded-[16px] border border-[#e3dcd1] bg-[#fffdfa] px-4 py-3 shadow-[0_6px_18px_rgba(26,24,20,0.04)]">
      <EditorContent v-if="editor" :editor="editor" />
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        @click="handleFormulaToggle"
        class="inline-flex h-10 items-center justify-center rounded-[18px] border border-[#d1cec7] bg-[#faf8f4] px-5 text-[12px] font-medium uppercase tracking-[0.08em] text-[#1a1814] transition hover:border-[#1a1814] hover:bg-[#f2ede4] sm:whitespace-nowrap"
      >
        {{ toggleLabel }}
      </button>
    </div>

    <div
      v-if="isFormulaPanelOpen"
      class="rounded-[16px] border border-[#e3dcd1] bg-[#faf8f4] p-4 shadow-[0_10px_24px_rgba(26,24,20,0.06)]"
    >
      <div class="space-y-2">
        <div
          v-for="(row, rowIndex) in keyboardRows"
          :key="rowIndex"
          class="grid grid-cols-5 gap-2"
        >
          <button
            v-for="button in row"
            :key="button.label"
            type="button"
            @click="appendQuickFormula(button.value)"
            class="font-mono-custom flex h-10 items-center justify-center rounded-[12px] border border-[#d1cec7] bg-white px-2 text-[13px] text-[#1a1814] transition hover:border-[#1a1814] hover:bg-[#f2ede4]"
            :class="[
              button.span === 2 ? 'col-span-2' : '',
              button.variant === 'danger' ? 'text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white' : '',
            ]"
          >
            {{ button.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.answer-editor-content) {
  min-height: 2.6rem;
  outline: none;
  color: #1a1814;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  line-height: 1.7;
}

:deep(.answer-editor-content p) {
  margin: 0;
}

:deep(.answer-editor-content p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: rgba(138, 133, 124, 0.75);
  pointer-events: none;
  float: left;
  height: 0;
}

:deep(.answer-editor-content .tiptap-mathematics-render) {
  display: inline-flex;
  align-items: center;
  margin: 0 0.15rem;
  border-radius: 0.5rem;
  background: rgba(26, 24, 20, 0.04);
  padding: 0.08rem 0.35rem;
  cursor: pointer;
}

:deep(.answer-editor-content .tiptap-mathematics-render--editable:hover) {
  background: rgba(26, 24, 20, 0.08);
}

:deep(.answer-editor-content .inline-math-error) {
  color: #b91c1c;
}
</style>
