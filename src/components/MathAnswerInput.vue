<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import jquery from 'jquery'
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
  doneLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'done'])

const editorRef = ref(null)
let mathField = null
let mathQuillPromise

const keyboardRows = [
  [
    { key: '1', label: '1', action: 'text', value: '1' },
    { key: '2', label: '2', action: 'text', value: '2' },
    { key: '3', label: '3', action: 'text', value: '3' },
    { key: 'plus', label: '+', action: 'text', value: '+' },
    { key: 'minus', label: '-', action: 'text', value: '-' },
  ],
  [
    { key: '4', label: '4', action: 'text', value: '4' },
    { key: '5', label: '5', action: 'text', value: '5' },
    { key: '6', label: '6', action: 'text', value: '6' },
    { key: 'times', label: '*', action: 'text', value: '*' },
    { key: 'divide', label: '/', action: 'text', value: '/' },
  ],
  [
    { key: '7', label: '7', action: 'text', value: '7' },
    { key: '8', label: '8', action: 'text', value: '8' },
    { key: '9', label: '9', action: 'text', value: '9' },
    { key: 'left-paren', label: '(', action: 'text', value: '(' },
    { key: 'right-paren', label: ')', action: 'text', value: ')' },
  ],
  [
    { key: '0', label: '0', action: 'text', value: '0', span: 2 },
    { key: 'comma', label: ',', action: 'text', value: ',' },
    { key: 'sqrt', label: '√', action: 'cmd', value: '\\sqrt' },
    { key: 'power', label: '^', action: 'write', value: '^{}', after: ['Left'] },
  ],
  [
    { key: 'x', label: 'x', action: 'text', value: 'x' },
    { key: 'y', label: 'y', action: 'text', value: 'y' },
    { key: 'pi', label: 'π', action: 'latex', value: '\\pi' },
    { key: 'equal', label: '=', action: 'text', value: '=' },
    { key: 'delete', label: 'DEL', action: 'keystroke', value: 'Backspace', variant: 'danger' },
  ],
]

const focusEditor = () => {
  if (mathField) {
    mathField.focus()
  }
}

const syncValue = () => {
  if (!mathField) {
    return
  }

  emit('update:modelValue', mathField.latex())
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

  if (key.action === 'cmd') {
    mathField.cmd(key.value)
  } else if (key.action === 'keystroke') {
    mathField.keystroke(key.value)
  } else if (key.action === 'latex') {
    mathField.write(key.value)
  } else if (key.action === 'text') {
    mathField.typedText(key.value)
  } else {
    mathField.write(key.value)
  }

  executeAfterKeys(key.after)
  focusEditor()
  syncValue()
}

const handleDone = () => {
  emit('done')
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

  focusEditor()
})

watch(
  () => props.modelValue,
  (value) => {
    if (mathField && value !== mathField.latex()) {
      mathField.latex(value || '')
    }
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
  <div class="w-full max-w-[420px] rounded-[18px] border border-black/10 bg-[#f8f4ec] p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
    <div class="rounded-[14px] border border-black/12 bg-white px-4 py-3">
      <div ref="editorRef" class="math-answer-editor min-h-7"></div>
      <div v-if="!modelValue" class="math-placeholder mt-1 text-sm text-black/30">
        {{ placeholder }}
      </div>
    </div>

    <div class="mt-3 space-y-2">
      <div
        v-for="(row, rowIndex) in keyboardRows"
        :key="rowIndex"
        class="grid grid-cols-5 gap-2"
      >
        <button
          v-for="key in row"
          :key="key.key"
          type="button"
          @click="handleKeyboardPress(key)"
          class="flex h-12 items-center justify-center rounded-[12px] border border-black/12 bg-white px-2 text-xl font-medium text-black transition hover:border-black hover:bg-black hover:text-white"
          :class="[
            key.span === 2 ? 'col-span-2' : '',
            key.variant === 'danger' ? 'text-red-600 hover:border-red-600 hover:bg-red-600 hover:text-white' : '',
          ]"
        >
          {{ key.label }}
        </button>
      </div>
    </div>

    <button
      type="button"
      @click="handleDone"
      class="mt-4 flex h-12 w-full items-center justify-center rounded-[14px] bg-[#1f1b17] text-lg font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-black"
    >
      {{ doneLabel }}
    </button>
  </div>
</template>

<style scoped>
.math-answer-editor:deep(.mq-editable-field),
.math-answer-editor:deep(.mq-math-mode) {
  border: 0;
  box-shadow: none;
  font-size: 1.05rem;
  min-height: 1.75rem;
  padding: 0;
}

.math-answer-editor:deep(.mq-focused) {
  box-shadow: none;
}

.math-answer-editor:deep(.mq-root-block) {
  min-height: 1.75rem;
}

.math-placeholder {
  pointer-events: none;
}
</style>
