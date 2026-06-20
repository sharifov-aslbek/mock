<script setup>
import { computed, ref } from 'vue'
import MathQuillField from '@/components/math/MathQuillField.vue'
import MathQuillKeyboard from '@/components/math/MathQuillKeyboard.vue'
import MathText from '@/components/math/MathText.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Math Input',
  },
  description: {
    type: String,
    default: "Formula yozing, keyin uni savol matniga kursor turgan joyga qo'shing.",
  },
  actionLabel: {
    type: String,
    default: 'Insert into question',
  },
})

const emit = defineEmits(['update:modelValue', 'insert'])
const mathFieldRef = ref(null)
const isKeyboardVisible = ref(false)

const previewValue = computed(() => (props.modelValue.trim() ? `\\(${props.modelValue}\\)` : ''))

const handleAction = (action) => {
  const mathField = mathFieldRef.value

  if (!mathField || props.disabled) {
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
  <div class="rounded-[1.5rem] border border-orange-200 bg-[linear-gradient(160deg,rgba(255,247,237,0.96),rgba(255,255,255,0.98))] p-4 shadow-[0_24px_60px_-40px_rgba(154,52,18,0.55)]">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-sm font-semibold text-neutral-900">{{ title }}</p>
        <p class="text-xs leading-5 text-neutral-600">{{ description }}</p>
      </div>
      <button
        type="button"
        class="rounded-md border border-orange-200 bg-white/80 px-3 py-1.5 text-sm text-orange-700 hover:bg-orange-50 hover:text-orange-800 disabled:opacity-50"
        :disabled="disabled"
        @click="isKeyboardVisible = !isKeyboardVisible"
      >
        Keyboard
      </button>
    </div>

    <div class="mt-4 space-y-3">
      <MathQuillField
        ref="mathFieldRef"
        :model-value="modelValue"
        :disabled="disabled"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <div class="rounded-2xl border border-dashed border-orange-200 bg-white/80 p-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700">
            Preview
          </p>
          <button
            type="button"
            class="rounded-md bg-orange-600 px-3 py-1.5 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
            :disabled="disabled || !modelValue.trim()"
            @click="emit('insert')"
          >
            {{ actionLabel }}
          </button>
        </div>

        <MathText
          v-if="previewValue"
          :value="previewValue"
          class-name="mt-3 text-base text-neutral-900"
        />
      </div>
    </div>

    <MathQuillKeyboard
      :is-visible="isKeyboardVisible"
      @action="handleAction"
      @close="isKeyboardVisible = false"
    />
  </div>
</template>
