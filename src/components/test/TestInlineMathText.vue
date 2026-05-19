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
    .replace(/\\left\b/g, '')
    .replace(/\\right\b/g, '')
    .replace(/\\([()[\]])/g, '$1')
    .replace(/\\%/g, '%')
    .replace(/\\(?=$|[.,;:!?])/g, '')
    .replace(/\\\s+/g, ' ')
    .replace(/\\([A-Za-z\u00C0-\u024F\u0400-\u04FF'ʻ’`-]{2,})\\?/gu, (_, word) =>
      KNOWN_LATEX_COMMANDS.has(word.toLowerCase()) ? `\\${word}` : word,
    )

const normalizeMixedSource = (value) =>
  String(value)
    .replace(/\\left\b/g, '')
    .replace(/\\right\b/g, '')
    .replace(/\\([()[\]])/g, '$1')
    .replace(/\\%/g, '%')
    .replace(/\\(?=$|[.,;:!?])/g, '')
    .replace(/\u2212/g, '-')
    .replace(/\bc\s+o\s+s\b/gi, 'cos')
    .replace(/\bs\s+i\s+n\b/gi, 'sin')
    .replace(/\bt\s+a\s+n\b/gi, 'tan')
    .replace(/\bl\s+o\s+g\b/gi, 'log')
    .replace(/\bl\s+n\b/gi, 'ln')
    .replace(/\\\s+/g, ' ')

const normalizeMathWrappers = (value) =>
  String(value)
    .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, '$1')
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, '$1')

const normalizeLatex = (value) =>
  String(value)
    .replace(/\\aplha\b/g, '\\alpha')
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

  if (/^\\[A-Za-z]+/.test(trimmedToken) || KNOWN_LATEX_COMMANDS.has(lowercaseToken)) {
    return true
  }

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

  if (/[=<>^_()[\]{}|+\-*/∠°]/.test(trimmedToken)) {
    return true
  }

  if (/[0-9]/.test(trimmedToken) && /[A-Za-z]/.test(trimmedToken)) {
    return true
  }

  if (/[0-9]/.test(trimmedToken) && /[;,:]/.test(trimmedToken)) {
    return true
  }

  if (/^[+\-<>=|∠°]+$/.test(trimmedToken)) {
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

  // A run with no real typesetting need (fractions, sub/superscripts, LaTeX
  // commands) that is either long or contains a word-length letter sequence is
  // almost always mangled text, not a formula. KaTeX would render it as one
  // atomic, non-wrapping blob that overflows the layout — whereas plain text
  // wraps and adapts to any width, so it always falls onto the next line.
  const needsKatex = /\\[A-Za-z]+|[\^_{}]/.test(coreValue)
  const looksLikeMangledText =
    coreValue.length > 20 ||
    /[A-Za-z\u00C0-\u024F\u0400-\u04FF]{6,}/.test(coreValue)

  if (!needsKatex && looksLikeMangledText) {
    return escapeTextSegment(cleanupTextEscapes(value))
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

// A `$$…$$` / `\(…\)` span that — once LaTeX command names are removed — still
// contains a word-length letter run is prose the API wrapped in math
// delimiters, not a real formula. Typesetting it with KaTeX collapses every
// space and emits one atomic, non-wrapping line that overflows its column.
const looksLikeProseBlock = (value) =>
  /[A-Za-zÀ-ɏЀ-ӿ]{5,}/.test(
    String(value).replace(/\\[A-Za-z]+/g, ' '),
  )

const renderMixedContent = (source) => {
  const pattern = /\$\$([\s\S]*?)\$\$|\\\(([\s\S]*?)\\\)/g
  let result = ''
  let lastIndex = 0

  for (const match of source.matchAll(pattern)) {
    const matchIndex = match.index ?? 0
    const matchedValue = match[0] || ''
    const blockFormula = match[1]
    const inlineFormula = match[2]
    const formulaBody = blockFormula ?? inlineFormula ?? ''

    result += renderLooseContent(source.slice(lastIndex, matchIndex))

    // Prose wrapped in math delimiters: tokenize it word-by-word so the line
    // wraps. Genuine math tokens inside still get typeset individually.
    result += looksLikeProseBlock(formulaBody)
      ? renderLooseContent(formulaBody)
      : renderFormula(formulaBody, Boolean(blockFormula))

    lastIndex = matchIndex + matchedValue.length
  }

  result += renderLooseContent(source.slice(lastIndex))
  return result
}

// `\displaylines{...}` (the API also sends it without the backslash) wraps a
// block whose word spacing and row breaks are collapsed into semicolons.
const DISPLAYLINES_PATTERN = /\\?displaylines\s*\{([\s\S]*?)\}/g

// API text frequently arrives "mangled": the spaces between words and the line
// breaks have been collapsed into semicolons (`Kutubxonada;5;xil;matematika`,
// or `;;`/`;;;` for row breaks). Such text gets mis-detected as a single math
// formula and renders as one unreadable, overflowing KaTeX blob. Recover a
// normal layout by turning *glued* semicolons (no space on either side) back
// into spaces / line breaks. Genuine punctuation (`a; b`, with a trailing
// space) and numeric coordinates (`(2;5)`) are left untouched.
const demangleSemicolons = (value) =>
  String(value)
    .replace(/\s*;{2,}\s*/g, '\n')
    .replace(/(?<=\S);(?=\S)/g, (_match, offset, source) =>
      /\d/.test(source[offset - 1]) && /\d/.test(source[offset + 1]) ? ';' : ' ',
    )
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()

const preprocessTestText = (value) =>
  demangleSemicolons(
    String(value).replace(DISPLAYLINES_PATTERN, (_, body) => `\n${body}\n`),
  )

// Full LaTeX environments such as \begin{cases}...\end{cases} or \begin{matrix}.
// Some API text arrives without the leading backslashes (`begin{cases}...`),
// so accept both forms and normalize before handing it to KaTeX.
const ENV_BLOCK_PATTERN = /\\?begin\s*\{[A-Za-z*]+\}[\s\S]*?\\?end\s*\{[A-Za-z*]+\}/g

const normalizeEnvironmentRows = (environmentName, body) => {
  if (environmentName !== 'cases' || /\\\\/.test(body)) {
    return body
  }

  const ampersandCount = (body.match(/&/g) || []).length

  if (ampersandCount <= 1) {
    return body
  }

  return body.replace(/\s+(?=[^&\s]+\s*&)/g, ' \\\\\\\\ ')
}

// KaTeX cannot typeset some LaTeX environments standalone (they are only valid
// nested inside another). Map them to the equivalent environment KaTeX *can*
// render on its own, otherwise the whole block falls back to a raw string.
const ENV_NAME_FALLBACKS = {
  split: 'aligned',
  align: 'aligned',
  'align*': 'aligned',
  eqnarray: 'aligned',
  'eqnarray*': 'aligned',
  gather: 'gathered',
  'gather*': 'gathered',
}

const normalizeEnvironmentFormula = (value) => {
  const normalizedValue = String(value)
    .trim()
    .replace(/\\?begin\s*\{/g, '\\begin{')
    .replace(/\\?end\s*\{/g, '\\end{')

  return normalizedValue.replace(
    /\\begin\s*\{([A-Za-z*]+)\}([\s\S]*?)\\end\s*\{\1\}/g,
    (_, environmentName, body) => {
      const renderName = ENV_NAME_FALLBACKS[environmentName] || environmentName
      return `\\begin{${renderName}}${normalizeEnvironmentRows(environmentName, body)}\\end{${renderName}}`
    },
  )
}

// Render a complete environment block as one KaTeX formula. It is passed raw,
// without the loose normalization that would strip the `\\` row separators.
const renderEnvFormula = (value) => {
  const normalizedValue = normalizeEnvironmentFormula(value)

  try {
    return katex.renderToString(normalizedValue, {
      throwOnError: true,
      strict: 'ignore',
      displayMode: false,
    })
  } catch {
    return escapeHtml(value)
  }
}

// API text sometimes wraps a plain *sentence* in \begin{...}...\end{...}
// (often `split`, which KaTeX cannot even typeset standalone). Strip the
// environment shell and its alignment markers so the sentence can be rendered
// as ordinary wrapping text instead of an overflowing KaTeX blob.
const stripEnvironmentShell = (value) =>
  String(value)
    .replace(/\\?begin\s*\{[A-Za-z*]+\}/g, '')
    .replace(/\\?end\s*\{[A-Za-z*]+\}/g, '')
    .replace(/\\\\/g, '\n')
    .replace(/(?<!\\)&/g, ' ')

const renderPlainOrMixed = (source) => {
  const normalizedSource = normalizeMathWrappers(normalizeMixedSource(source))

  if (!normalizedSource) {
    return ''
  }

  const hasWrappedLatex = /\$\$[\s\S]*?\$\$/.test(normalizedSource)

  return hasWrappedLatex ? renderMixedContent(normalizedSource) : renderLooseContent(normalizedSource)
}

const renderedHtml = computed(() => {
  const baseText = preprocessTestText(normalizeTestText(props.text))

  if (!baseText) {
    return ''
  }

  // Pull out \begin{...}...\end{...} blocks first — the loose tokenizer would
  // split them on whitespace and never hand them to KaTeX as a single formula.
  const envMatches = [...baseText.matchAll(ENV_BLOCK_PATTERN)]

  if (!envMatches.length) {
    return renderPlainOrMixed(baseText)
  }

  let result = ''
  let lastIndex = 0

  for (const envMatch of envMatches) {
    const matchIndex = envMatch.index ?? 0
    const envInner = stripEnvironmentShell(envMatch[0])

    result += renderPlainOrMixed(baseText.slice(lastIndex, matchIndex))
    // A sentence the API wrapped in \begin{...}...\end{...} is prose, not a
    // formula — render it as wrapping text rather than one KaTeX block.
    result += looksLikeProseBlock(envInner)
      ? renderPlainOrMixed(envInner)
      : renderEnvFormula(envMatch[0])

    lastIndex = matchIndex + envMatch[0].length
  }

  result += renderPlainOrMixed(baseText.slice(lastIndex))
  return result
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
  display: inline-block;
  vertical-align: middle;
  overflow-x: auto;
  overflow-y: hidden;
}

.math-inline-text :deep(.katex-display) {
  margin: 0.3em 0;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>
