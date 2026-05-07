<script setup>
import TestInlineMathText from '@/components/test/TestInlineMathText.vue'

defineProps({
  value: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
  as: {
    type: String,
    default: 'div',
    validator: (value) => ['div', 'span'].includes(value),
  },
  emptyFallback: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <TestInlineMathText
    :tag="as"
    :text="value?.trim() || emptyFallback"
    :wrapper-class="className"
  />
</template>
