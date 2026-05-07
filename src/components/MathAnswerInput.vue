<script setup>
import { computed, ref } from 'vue'
import MathQuillField from '@/components/math/MathQuillField.vue'
import MathQuillKeyboard from '@/components/math/MathQuillKeyboard.vue'

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
    <MathQuillField
      ref="mathFieldRef"
      compact
      :model-value="modelValue"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
      @toggle-keyboard="handleFormulaToggle"
    />

    <div class="flex justify-end">
      <button
        type="button"
        class="inline-flex h-10 w-full items-center justify-center rounded-[16px] border border-[#d1cec7] bg-[#faf8f4] px-4 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1a1814] transition hover:border-[#1a1814] hover:bg-[#f2ede4] sm:w-auto sm:rounded-[18px] sm:px-5 sm:text-[12px] sm:whitespace-nowrap"
        @click="handleFormulaToggle"
      >
        {{ toggleLabel }}
      </button>
    </div>

    <MathQuillKeyboard
      :is-visible="isFormulaPanelOpen"
      @action="handleKeyboardAction"
      @close="isFormulaPanelOpen = false"
    />
  </div>
</template>
