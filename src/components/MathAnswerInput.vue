<script setup>
import { computed, ref } from 'vue'
import MathQuillField from '@/components/math/MathQuillField.vue'
import MathQuillKeyboard from '@/components/math/MathQuillKeyboard.vue'
import { useTestStore } from '@/stores/test'
import { isMathSubject } from '@/utils/subjects'

const testStore = useTestStore()
// The math keyboard only makes sense for math tests — hide it for history,
// native language, etc. (free-answer typing still works via the field).
const isMathTest = computed(() => isMathSubject(testStore.currentTest?.subject))

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
const mathFieldRef = ref(null)
const textFieldRef = ref(null)
const isFormulaPanelOpen = ref(false)

const toggleLabel = computed(() =>
  isFormulaPanelOpen.value ? props.closeLabel : props.openLabel,
)

const handleFormulaToggle = () => {
  isFormulaPanelOpen.value = !isFormulaPanelOpen.value

  if (isFormulaPanelOpen.value) {
    window.setTimeout(() => {
      mathFieldRef.value?.focus()
    }, 0)
  }
}

// Plain-text path: history / native-language free answers are ordinary prose
// (e.g. a person's name like "Ali Sattor"), so spaces and normal typing must
// work. MathQuill hijacks the spacebar as a cursor-move, which mangles such
// answers — so for non-math tests we use a real <textarea> instead.
const handleTextInput = (event) => {
  emit('update:modelValue', event.target.value)
}

// Escape hatch: reset the field. For math, MathQuill's clear() rebuilds the
// editor tree from scratch (also recovers a stuck field). For plain text we
// just empty the model and refocus the textarea.
const clearField = () => {
  if (isMathTest.value) {
    mathFieldRef.value?.clear()
    return
  }
  emit('update:modelValue', '')
  window.setTimeout(() => textFieldRef.value?.focus(), 0)
}

const handleKeyboardAction = (action) => {
  const mathField = mathFieldRef.value

  if (!mathField || !action) {
    return
  }

  if (action.type === 'cmd') mathField.cmd(action.arg)
  if (action.type === 'write') mathField.write(action.arg)
  if (action.type === 'typed') mathField.typedText(action.arg)
  if (action.type === 'key') mathField.keystroke(action.arg)
  if (action.type === 'custom' && action.fn === 'system') {
    mathField.write('\\left\\{\\right.')
    mathField.keystroke('Left')
  }
}
</script>

<template>
  <div class="space-y-3">
    <textarea
      v-if="!isMathTest"
      ref="textFieldRef"
      :value="modelValue"
      :placeholder="placeholder"
      rows="3"
      class="min-h-[96px] w-full resize-none rounded-2xl border border-[#e0ddd7] bg-white p-6 text-[16px] leading-[1.6] text-[#1a1814] shadow-[0_2px_8px_rgba(15,23,42,0.04)] outline-none transition-all duration-150 placeholder:text-[#9b958c] hover:border-[#bcb7ad] focus:border-[#1a1814] focus:shadow-[0_4px_14px_rgba(15,23,42,0.08)] focus:outline-none"
      @input="handleTextInput"
    ></textarea>

    <MathQuillField
      v-else
      ref="mathFieldRef"
      compact
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <div
      v-if="modelValue || isMathTest"
      class="flex flex-col gap-2 sm:flex-row sm:justify-end"
    >
      <button
        v-if="modelValue"
        type="button"
        class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[16px] border border-[#e0ddd7] bg-white px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a857c] transition hover:border-[#1a1814] hover:text-[#1a1814] sm:w-auto sm:rounded-[18px] sm:px-5 sm:text-[12px] sm:whitespace-nowrap"
        @click="clearField"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
        Tozalash
      </button>
      <button
        v-if="isMathTest"
        type="button"
        class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[16px] border border-[#d1cec7] bg-[#faf8f4] px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1a1814] transition hover:border-[#1a1814] hover:bg-[#f2ede4] sm:w-auto sm:rounded-[18px] sm:px-5 sm:text-[12px] sm:whitespace-nowrap"
        @click="handleFormulaToggle"
      >
        <svg
          v-if="isFormulaPanelOpen"
          class="h-4 w-4 transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 18 18 6M6 6l12 12" />
        </svg>
        <svg
          v-else
          class="h-4 w-4 transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
        </svg>
        {{ toggleLabel }}
      </button>
    </div>

    <MathQuillKeyboard
      v-if="isMathTest"
      :is-visible="isFormulaPanelOpen"
      @action="handleKeyboardAction"
      @close="isFormulaPanelOpen = false"
    />
  </div>
</template>
