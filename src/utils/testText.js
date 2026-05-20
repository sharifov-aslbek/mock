const BLOCK_CLOSING_TAGS_PATTERN =
  /<\/(address|article|aside|blockquote|caption|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)>/gi
const LINE_BREAK_TAGS_PATTERN = /<br\s*\/?>/gi
const LIST_ITEM_OPENING_TAG_PATTERN = /<li\b[^>]*>/gi
const ALL_TAGS_PATTERN = /<[^>]+>/g

const decodeHtmlEntities = (value) => {
  if (typeof document === 'undefined') {
    return value
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

const normalizeSpacing = (value) =>
  String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(?:^|\s)(?:\/\s*){2,}(?=\s|$)/g, ' ')
    .replace(/^\s*\/+\s*$/gm, '')
    .trim()

// Some upstream JSON deserializers turn `\text{...}` into `<TAB>ext{...}` -
// the `\t` was interpreted as the JSON escape for a horizontal tab and stopped
// being a LaTeX command. Restore the `\` prefix before whitespace normalization
// collapses the tab and we lose the only signal that this was originally math.
// Also covers `\textbf`, `\textit`, `\textrm`, etc.
const restoreLatexEscapes = (value) =>
  String(value)
    .replace(/\text([a-z]*)\{/g, '\\text$1{')
    .replace(/(?<![\\A-Za-z])ext([a-z]*)\{/g, '\\text$1{')

export const normalizeTestText = (value) => {
  if (typeof value !== 'string') {
    return ''
  }

  let normalizedValue = restoreLatexEscapes(value).trim()

  if (!normalizedValue) {
    return ''
  }

  if (normalizedValue.includes('<')) {
    normalizedValue = normalizedValue
      .replace(LINE_BREAK_TAGS_PATTERN, '\n')
      .replace(LIST_ITEM_OPENING_TAG_PATTERN, '• ')
      .replace(BLOCK_CLOSING_TAGS_PATTERN, '\n')
      .replace(ALL_TAGS_PATTERN, ' ')

    normalizedValue = decodeHtmlEntities(normalizedValue)
  }

  return normalizeSpacing(normalizedValue)
}

export const toPlainTestText = (value) => normalizeTestText(value).replace(/\n+/g, ' ').trim()
