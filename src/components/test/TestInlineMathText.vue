<script setup>
import { computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  tag: {
    type: String,
    default: 'span',
  },
  wrapperClass: {
    type: String,
    default: '',
  },
})

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const normalizeLatex = (value) =>
  String(value)
    .replace(/\\placeholder\s*\{[^}]*\}/g, '\\square')
    .replace(/\\placeholder\b/g, '\\square')

const renderInlineFormula = (value) => {
  try {
    return katex.renderToString(normalizeLatex(value), {
      throwOnError: false,
      strict: 'ignore',
      displayMode: false,
    })
  } catch {
    return escapeHtml(value)
  }
}

const renderedHtml = computed(() => {
  const source = String(props.text || '')
  const pattern = /\\\(([\s\S]*?)\\\)/g

  if (!pattern.test(source)) {
    return escapeHtml(source).replace(/\n/g, '<br>')
  }

  pattern.lastIndex = 0
  const chunks = []
  let lastIndex = 0
  let match

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      chunks.push(escapeHtml(source.slice(lastIndex, match.index)).replace(/\n/g, '<br>'))
    }

    chunks.push(renderInlineFormula(match[1]))
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < source.length) {
    chunks.push(escapeHtml(source.slice(lastIndex)).replace(/\n/g, '<br>'))
  }

  return chunks.join('')
})
</script>

<template>
  <component :is="tag" :class="wrapperClass">
    <span class="math-inline-text" v-html="renderedHtml"></span>
  </component>
</template>

<style scoped>
.math-inline-text {
  white-space: normal;
}

.math-inline-text :deep(.katex) {
  font-size: 1em;
}
</style>
