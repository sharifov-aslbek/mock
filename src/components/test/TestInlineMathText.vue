<script setup>
import { computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { normalizeTestText } from '@/utils/testText'

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

const escapeTextSegment = (value) => escapeHtml(value).replace(/\n/g, '<br>')

const PLAIN_WORD_PATTERN = /^[A-Za-z\u00C0-\u024F\u0400-\u04FF'ʻ’`-]{2,}$/u
const MATH_FUNCTION_NAMES = new Set(['sin', 'cos', 'tan', 'cot', 'log', 'ln', 'lim', 'max', 'min'])
const KNOWN_LATEX_COMMANDS = new Set([
  'alpha',
  'approx',
  'beta',
  'cdot',
  'cdots',
  'cos',
  'cot',
  'div',
  'dots',
  'frac',
  'gamma',
  'ge',
  'int',
  'lambda',
  'ldots',
  'le',
  'left',
  'lim',
  'ln',
  'log',
  'max',
  'min',
  'mu',
  'neq',
  'phi',
  'pi',
  'placeholder',
  'pm',
  'prod',
  'quad',
  'qquad',
  'right',
  'sin',
  'sqrt',
  'sum',
  'tan',
  'theta',
  'times',
])
const LATEX_COMMAND_PATTERN = /\\[A-Za-z]+|\\[|()[\]{}]/

const cleanupTextEscapes = (value) =>
  String(value)
    .replace(/\\\s+/g, ' ')
    .replace(/\\([A-Za-z\u00C0-\u024F\u0400-\u04FF'ʻ’`-]{2,})\\?/gu, (_, word) =>
      KNOWN_LATEX_COMMANDS.has(word.toLowerCase()) ? `\\${word}` : word,
    )

const normalizeMathWrappers = (value) =>
  String(value)
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, '$1')
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, '$1')

const normalizeLatex = (value) =>
  String(value)
    .replace(/\\{2,}(?=(alpha|approx|beta|cdot|cdots|cos|cot|div|dots|frac|gamma|ge|int|lambda|ldots|le|left|lim|ln|log|max|min|mu|neq|phi|pi|placeholder|pm|prod|quad|qquad|right|sin|sqrt|sum|tan|theta|times)\b)/g, '\\')
    .replace(/\\\s+/g, ' ')
    .replace(/\\placeholder\s*\{[^}]*\}/g, '\\square')
    .replace(/\\placeholder\b/g, '\\square')

const renderFormula = (value, displayMode = false) => {
  try {
    return katex.renderToString(normalizeLatex(value), {
      throwOnError: true,
      strict: 'ignore',
      displayMode,
    })
  } catch {
    return escapeHtml(value)
  }
}

// 🔥 latex borligini aniqlash (auto-detect)
const hasLatex = (text) => {
  return /\\(frac|sqrt|cdot|le|ge|times|div)/.test(text)
}

const isMathLikeToken = (token) => {
  const trimmedToken = token.trim()

  if (!trimmedToken) {
    return false
  }

  const normalizedToken = trimmedToken.replace(/^\\+/, '').replace(/\\+$/, '')
  const lowercaseToken = normalizedToken.toLowerCase()

  if (MATH_FUNCTION_NAMES.has(lowercaseToken)) {
    return true
  }

  if (PLAIN_WORD_PATTERN.test(normalizedToken)) {
    return false
  }

  if (/^[A-Za-z]$/.test(normalizedToken)) {
    return true
  }

  if (LATEX_COMMAND_PATTERN.test(trimmedToken) || hasLatex(trimmedToken)) {
    return true
  }

  if (/^\d+(?:[.,]\d+)?$/.test(normalizedToken)) {
    return false
  }

  if (/^(?:[A-Za-z]\(.*\)|\(?[A-Za-z](?:,[A-Za-z])+\)?=?)$/.test(trimmedToken)) {
    return true
  }

  if (/[=<>^_()[\]{}|+\-*/]/.test(trimmedToken)) {
    return true
  }

  if (/[0-9]/.test(trimmedToken) && /[A-Za-z]/.test(trimmedToken)) {
    return true
  }

  return false
}

const renderMathSegment = (value) => {
  const match = String(value).match(/^(\s*)([\s\S]*?)(\s*)$/)
  const leadingWhitespace = match?.[1] || ''
  const coreValue = match?.[2] || ''
  const trailingWhitespace = match?.[3] || ''

  if (!coreValue) {
    return escapeTextSegment(value)
  }

  const renderedFormula = renderFormula(coreValue, false)
  const isPlainFallback = renderedFormula === escapeHtml(coreValue)

  if (isPlainFallback) {
    return escapeTextSegment(cleanupTextEscapes(value))
  }

  return (
    escapeTextSegment(leadingWhitespace) +
    renderedFormula +
    escapeTextSegment(trailingWhitespace)
  )
}

const renderLooseContent = (source) =>
  (String(source).match(/\s+|[^\s]+/g) || [])
    .map((token) => {
      if (/^\s+$/.test(token)) {
        return escapeTextSegment(token)
      }

      return isMathLikeToken(token)
        ? renderMathSegment(token)
        : escapeTextSegment(cleanupTextEscapes(token))
    })
    .join('')

const renderMixedContent = (source) => {
  const pattern = /\$\$([\s\S]*?)\$\$|\\\(([\s\S]*?)\\\)/g
  let result = ''
  let lastIndex = 0

  for (const match of source.matchAll(pattern)) {
    const matchIndex = match.index ?? 0
    const matchedValue = match[0] || ''
    const blockFormula = match[1]
    const inlineFormula = match[2]

    result += renderLooseContent(source.slice(lastIndex, matchIndex))
    result += renderFormula(blockFormula ?? inlineFormula ?? '', Boolean(blockFormula))

    lastIndex = matchIndex + matchedValue.length
  }

  result += renderLooseContent(source.slice(lastIndex))
  return result
}

const renderedHtml = computed(() => {
  const normalizedSource = normalizeMathWrappers(normalizeTestText(props.text))

  if (!normalizedSource) {
    return ''
  }

  const hasWrappedLatex =
    /\$\$[\s\S]*?\$\$/.test(normalizedSource)

  if (hasWrappedLatex) {
    return renderMixedContent(normalizedSource)
  }

  return renderLooseContent(normalizedSource)
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
  overflow-wrap: anywhere;
  word-break: break-word;
}

.math-inline-text :deep(.katex) {
  font-size: 1.08em;
  max-width: 100%;
}

.math-inline-text :deep(.katex-display) {
  margin: 0.3em 0;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
