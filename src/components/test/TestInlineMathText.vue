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

const TRIG_ALIAS_NAMES = ['sin', 'cos', 'tan', 'cot', 'ctg', 'tg']
const DUPLICATED_TRIG_ALIAS_PATTERN = new RegExp(
  `\\b(${TRIG_ALIAS_NAMES.join('|')})\\s+\\1(?=\\s*\\d)`,
  'gi',
)
const DEGREE_MARK_PATTERN = String.raw`(?:∘|°|º|˚|ᵒ|o|о|\\circ)`
const DUPLICATED_DEGREE_POWER_PATTERN = new RegExp(
  String.raw`\^\s*\{\s*${DEGREE_MARK_PATTERN}(?:\s*${DEGREE_MARK_PATTERN})+\s*\}`,
  'gi',
)
const DEGREE_POWER_PATTERN = new RegExp(
  String.raw`\^\s*\{\s*${DEGREE_MARK_PATTERN}\s*\}`,
  'gi',
)
const BRACED_DEGREE_AFTER_NUMBER_PATTERN = new RegExp(
  String.raw`(\d)\s*\{\s*${DEGREE_MARK_PATTERN}\s*\}`,
  'gi',
)
const BARE_DEGREE_POWER_PATTERN = new RegExp(
  String.raw`\^\s*${DEGREE_MARK_PATTERN}\b`,
  'gi',
)
const VISIBLE_DEGREE_MARK_PATTERN = String.raw`(?:∘|°|º|˚|ᵒ|\\circ)`
const NUMBER_DEGREE_MARK_PATTERN = new RegExp(
  String.raw`(\d)\s*${VISIBLE_DEGREE_MARK_PATTERN}`,
  'gi',
)

const normalizeMangledTrigExpressions = (value) =>
  String(value)
    .replace(/\u2061/g, ' ')
    .replace(DUPLICATED_TRIG_ALIAS_PATTERN, '$1')
    .replace(DUPLICATED_DEGREE_POWER_PATTERN, '^{\\circ}')
    .replace(DEGREE_POWER_PATTERN, '^{\\circ}')
    .replace(BRACED_DEGREE_AFTER_NUMBER_PATTERN, '$1^{\\circ}')
    .replace(BARE_DEGREE_POWER_PATTERN, '^{\\circ}')
    .replace(NUMBER_DEGREE_MARK_PATTERN, '$1^{\\circ}')

const SQRT_SHORTHAND_PATTERN = /\\sqrt\s*([A-Za-z0-9])/g
const BARE_SQRT_SHORTHAND_PATTERN = /(?<![\\A-Za-z])sqrt\s*([A-Za-z0-9])/gi
const BARE_FRAC_COMMAND_PATTERN = /(?<![\\A-Za-z])frac(?=\s*(?:\{|[A-Za-z0-9]))/gi
// `\sqrt[n]value` (or bare `sqrt[n]value`) — KaTeX wants `\sqrt[n]{value}`.
// Wrap the value in braces so the n-th-root parses reliably even when the
// argument isn't braced in the source.
const NTH_ROOT_SHORTHAND_PATTERN = /\\sqrt\s*\[([^\]]+)\]\s*([A-Za-z0-9])/g
const BARE_NTH_ROOT_SHORTHAND_PATTERN = /(?<![\\A-Za-z])sqrt\s*\[([^\]]+)\]\s*([A-Za-z0-9])/gi

const normalizeMalformedLatexCommands = (value) =>
  String(value)
    .replace(BARE_FRAC_COMMAND_PATTERN, '\\frac')
    .replace(BARE_NTH_ROOT_SHORTHAND_PATTERN, '\\sqrt[$1]{$2}')
    .replace(NTH_ROOT_SHORTHAND_PATTERN, '\\sqrt[$1]{$2}')
    .replace(BARE_SQRT_SHORTHAND_PATTERN, '\\sqrt{$1}')
    .replace(SQRT_SHORTHAND_PATTERN, '\\sqrt{$1}')

// Trig / log functions and Greek letter names used by `detachGreekFromCommands`
// to repair commands like `\sinalpha` (one stuck token) into `\sin\alpha`.
const TRIG_AND_LOG_FUNCTIONS = [
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh',
  'log', 'ln',
]
const GREEK_LETTER_NAMES = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta',
  'theta', 'vartheta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi',
  'varpi', 'rho', 'varrho', 'sigma', 'varsigma', 'tau', 'upsilon', 'phi',
  'varphi', 'chi', 'psi', 'omega',
]
const STUCK_TRIG_GREEK_PATTERN = new RegExp(
  `\\\\(${TRIG_AND_LOG_FUNCTIONS.join('|')})(${GREEK_LETTER_NAMES.join('|')})\\b`,
  'g',
)

// API text sometimes glues a trig command and a Greek letter together as a
// single token (e.g. `\sinalpha`, `\cosalpha`). KaTeX cannot resolve that —
// reinsert the missing backslash so the formula renders as `\sin\alpha`.
const detachGreekFromCommands = (value) =>
  String(value).replace(STUCK_TRIG_GREEK_PATTERN, '\\$1\\$2 ')

// API text often contains math function names without the leading backslash
// (e.g. `sin810^{o}`, `sqrt{2}`, `ctg45`). KaTeX then renders each letter as a
// separate italic variable instead of as a single operator — `sin810` becomes
// `s·i·n·810`, which overflows narrow columns and reads as garbage. Reinsert
// the missing backslash so the operator renders as one semantic unit, and
// translate the Russian/Uzbek aliases (ctg, tg, sh, ch, th) at the same time.
const BARE_MATH_FUNCTION_PATTERN = /(?<![\\A-Za-z])(arcsin|arccos|arctan|arcctg|arctg|sinh|cosh|tanh|sqrt|sin|cos|tan|cot|sec|csc|log|ln|lim|max|min|ctg|tg|sh|ch|th)(?![A-Za-z])/g
const BARE_MATH_FUNCTION_REPLACEMENTS = {
  sin: '\\sin', cos: '\\cos', tan: '\\tan', cot: '\\cot', sec: '\\sec', csc: '\\csc',
  arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan',
  arctg: '\\arctan', arcctg: '\\operatorname{arcctg}',
  sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh',
  log: '\\log', ln: '\\ln', lim: '\\lim', max: '\\max', min: '\\min',
  sqrt: '\\sqrt',
  ctg: '\\operatorname{ctg}', tg: '\\tan', sh: '\\sinh', ch: '\\cosh', th: '\\tanh',
}

const normalizeBareMathFunctions = (value) =>
  String(value).replace(
    BARE_MATH_FUNCTION_PATTERN,
    (_, name) => `${BARE_MATH_FUNCTION_REPLACEMENTS[name]} `,
  )

// Map Unicode math glyphs the API ships inside formulas to their LaTeX
// equivalents. KaTeX throws on `∘` (U+2218 RING OPERATOR) and `°` (U+00B0
// DEGREE SIGN) in math mode, which causes the whole formula to fall back
// to raw text. Replacing them with `\circ` keeps the formula renderable.
const UNICODE_MATH_GLYPH_REPLACEMENTS = [
  [/∘/g, '\\circ '],
  [/°/g, '\\circ '],
  [/×/g, '\\times '],
  [/÷/g, '\\div '],
  [/≤/g, '\\le '],
  [/≥/g, '\\ge '],
  [/≠/g, '\\ne '],
  [/√/g, '\\sqrt '],
  [/·/g, '\\cdot '],
  [/…/g, '\\ldots '],
  [/∞/g, '\\infty '],
]

const normalizeUnicodeMathGlyphs = (value) => {
  let result = String(value)
  for (const [pattern, replacement] of UNICODE_MATH_GLYPH_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

const normalizeLatex = (value) =>
  detachGreekFromCommands(
    normalizeMalformedLatexCommands(
      normalizeBareMathFunctions(normalizeUnicodeMathGlyphs(String(value))),
    )
      .replace(/\\aplha\b/g, '\\alpha')
      .replace(/\\{2,}(?=(alpha|approx|beta|cdot|cdots|cos|cot|div|dots|frac|gamma|ge|int|lambda|ldots|le|left|lim|ln|log|max|min|mu|neq|phi|pi|placeholder|pm|prod|quad|qquad|right|sin|sqrt|sum|tan|theta|times)\b)/g, '\\')
      .replace(/\\\s+/g, ' ')
      .replace(/\\placeholder\s*\{[^}]*\}/g, '\\square')
      .replace(/\\placeholder\b/g, '\\square'),
  )

// Constructs that KaTeX renders cramped in default \textstyle (inline) —
// fractions especially become unreadably small inside another fraction. For
// these we prepend `\displaystyle` so the formula keeps its inline flow but
// uses display-mode sizing (taller numerators, larger subscripts, etc.).
const DISPLAYSTYLE_TRIGGER_PATTERN =
  /\\(?:frac|dfrac|sqrt|sum|int|iint|iiint|prod|coprod|lim|binom|cfrac)\b/

const renderFormula = (value, displayMode = false) => {
  try {
    const normalizedValue = normalizeLatex(value)
    const shouldForceDisplayInline =
      !displayMode && DISPLAYSTYLE_TRIGGER_PATTERN.test(normalizedValue)
    const finalValue = shouldForceDisplayInline
      ? `\\displaystyle ${normalizedValue}`
      : normalizedValue

    return katex.renderToString(finalValue, {
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

// Tokenize the source while keeping `\command{...}{...}` runs as single
// tokens, even when their interior contains whitespace. The naive whitespace
// tokenizer would split `\frac{3\sin\alpha + 2}{...}` into two halves that
// KaTeX cannot render — so each half falls back to plain text and the
// formula breaks. Balancing braces here keeps the LaTeX expression intact.
const tokenizeWithBalancedBraces = (source) => {
  const text = String(source)
  const tokens = []
  const length = text.length
  let index = 0

  const skipBalancedBraces = (startIndex) => {
    if (text[startIndex] !== '{') {
      return startIndex
    }

    let depth = 1
    let cursor = startIndex + 1

    while (cursor < length && depth > 0) {
      const character = text[cursor]
      if (character === '{') {
        depth += 1
      } else if (character === '}') {
        depth -= 1
      }
      cursor += 1
    }

    return cursor
  }

  while (index < length) {
    const character = text[index]

    if (/\s/.test(character)) {
      let cursor = index + 1
      while (cursor < length && /\s/.test(text[cursor])) {
        cursor += 1
      }
      tokens.push(text.slice(index, cursor))
      index = cursor
      continue
    }

    // \command possibly followed by [optional]{required}... groups. We accept
    // both `{...}` and `[...]` so things like \sqrt[n]{value} stay as one
    // token (KaTeX needs both arguments together to render nth roots).
    if (character === '\\' && /[A-Za-z]/.test(text[index + 1] || '')) {
      let cursor = index + 1
      while (cursor < length && /[A-Za-z]/.test(text[cursor])) {
        cursor += 1
      }

      while (cursor < length) {
        let lookahead = cursor
        while (lookahead < length && /\s/.test(text[lookahead])) {
          lookahead += 1
        }
        const nextChar = text[lookahead]
        if (nextChar === '{') {
          const afterBrace = skipBalancedBraces(lookahead)
          if (afterBrace === lookahead) {
            break
          }
          cursor = afterBrace
          continue
        }
        if (nextChar === '[') {
          // Scan to the matching `]` (no nesting needed — optional args in
          // LaTeX are flat).
          let bracketCursor = lookahead + 1
          while (bracketCursor < length && text[bracketCursor] !== ']') {
            bracketCursor += 1
          }
          if (bracketCursor >= length) {
            break
          }
          cursor = bracketCursor + 1
          continue
        }
        break
      }

      tokens.push(text.slice(index, cursor))
      index = cursor
      continue
    }

    let cursor = index + 1
    while (cursor < length && !/\s/.test(text[cursor])) {
      // Stop before a fresh \command so it can become its own token and pick
      // up its trailing brace groups in the next iteration.
      if (text[cursor] === '\\' && /[A-Za-z]/.test(text[cursor + 1] || '')) {
        break
      }
      cursor += 1
    }
    tokens.push(text.slice(index, cursor))
    index = cursor
  }

  return tokens
}

const renderLooseContent = (source) =>
  tokenizeWithBalancedBraces(source)
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

// Collapse whitespace inside `\sqrt[n] value` / `sqrt [n] value` constructs
// BEFORE tokenisation so the tokenizer keeps the whole expression together.
// Otherwise `\sqrt [x] 9` becomes three tokens (`\sqrt`, `[x]`, `9`) and the
// downstream normaliser never sees them as one nth-root.
const collapseNthRootWhitespace = (value) =>
  String(value)
    .replace(/\\sqrt\s*\[([^\]]+)\]\s*([A-Za-z0-9])/g, '\\sqrt[$1]{$2}')
    .replace(/(?<![\\A-Za-z])sqrt\s*\[([^\]]+)\]\s*([A-Za-z0-9])/gi, '\\sqrt[$1]{$2}')
    // Also wrap a single-char radicand right after a closed `[…]` whose
    // value isn't braced, e.g. `\sqrt[3]2x` → `\sqrt[3]{2}x`.
    .replace(/\\sqrt\[([^\]]+)\]\s+([A-Za-z0-9])/g, '\\sqrt[$1]{$2}')

const preprocessTestText = (value) =>
  normalizeMangledTrigExpressions(
    demangleSemicolons(
      collapseNthRootWhitespace(
        String(value).replace(DISPLAYLINES_PATTERN, (_, body) => `\n${body}\n`),
      ),
    ),
  )

// Full LaTeX environments such as \begin{cases}...\end{cases} or \begin{matrix}.
// Some API text arrives without the leading backslashes (`begin{cases}...`),
// so accept both forms and normalize before handing it to KaTeX. The trailing
// `*` covers starred variants such as `cases*` or `align*`.
const ENV_BLOCK_PATTERN = /\\?begin\s*\{[A-Za-z]+\*?\}[\s\S]*?\\?end\s*\{[A-Za-z]+\*?\}/g

// Environments where each row must be separated by `\\`. When the API sends a
// row-based environment without separators (one long body with multiple `&`),
// we inject `\\` between conditions so KaTeX renders multi-line correctly.
const ROW_BASED_ENVIRONMENTS = new Set([
  'cases', 'cases*', 'aligned', 'matrix', 'pmatrix', 'bmatrix',
  'Bmatrix', 'vmatrix', 'Vmatrix', 'array', 'gathered', 'split',
  'align', 'align*', 'eqnarray', 'eqnarray*', 'gather', 'gather*',
])

const normalizeEnvironmentRows = (environmentName, body) => {
  if (!ROW_BASED_ENVIRONMENTS.has(environmentName) || /\\\\/.test(body)) {
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
  equation: 'aligned',
  'equation*': 'aligned',
  multline: 'gathered',
  'multline*': 'gathered',
  'cases*': 'cases',
}

// Normalize an environment body the same way we treat inline formulas (greek
// detachment, bare trig → `\sin`, unicode glyphs → `\circ`), but WITHOUT the
// `\\\s+` → ' ' substitution that would eat row separators. Otherwise KaTeX
// throws on `\sinalpha` / `∘` inside a `cases` and the whole block falls back
// to raw text.
const normalizeEnvironmentBody = (value) =>
  detachGreekFromCommands(
    normalizeBareMathFunctions(normalizeUnicodeMathGlyphs(String(value))),
  )

const normalizeEnvironmentFormula = (value) => {
  const normalizedValue = String(value)
    .trim()
    .replace(/\\?begin\s*\{/g, '\\begin{')
    .replace(/\\?end\s*\{/g, '\\end{')

  // The body of the env (between begin/end) might still contain stuck
  // commands, bare functions or unicode glyphs that KaTeX rejects. Apply
  // env-safe normalization to the body, then ensure rows are separated.
  return normalizedValue.replace(
    /\\begin\s*\{([A-Za-z]+\*?)\}([\s\S]*?)\\end\s*\{\1\}/g,
    (_, environmentName, body) => {
      const renderName = ENV_NAME_FALLBACKS[environmentName] || environmentName
      const normalizedBody = normalizeEnvironmentBody(
        normalizeEnvironmentRows(environmentName, body),
      )
      return `\\begin{${renderName}}${normalizedBody}\\end{${renderName}}`
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
    .replace(/\\?begin\s*\{[A-Za-z]+\*?\}/g, '')
    .replace(/\\?end\s*\{[A-Za-z]+\*?\}/g, '')
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
  font-size: 1.2em;
  max-width: 100%;
  display: inline-block;
  vertical-align: middle;
}

.math-inline-text :deep(.katex-display) {
  margin: 0.3em 0;
}
</style>
