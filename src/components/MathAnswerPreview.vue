<script setup>
import { computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const renderedMarkup = computed(() => {
  if (!props.modelValue) {
    return ''
  }

  try {
    return katex.renderToString(props.modelValue, {
      throwOnError: false,
      displayMode: true,
    })
  } catch {
    return props.modelValue
  }
})
</script>

<template>
  <div
    v-if="modelValue"
    class="overflow-x-auto rounded-[14px] border border-black/10 bg-[#faf8f4] px-3 py-3 text-black"
    v-html="renderedMarkup"
  ></div>
</template>

<style scoped>
:deep(.katex-display) {
  margin: 0;
  text-align: left;
}
</style>
