---
name: milliymock-test-page
description: Build a subject's exam-taking page in MilliyMock's ONE canonical format. Use whenever creating or fixing a test/exam UI for any subject (math, ona tili, tarix, fizika, biologiya, …) so every subject looks and behaves identically. Covers the paper-sheet layout, the shared render components, the canonical question types, and the i18n labels.
---

# MilliyMock canonical test-taking page

Every subject's exam UI must look and behave **identically**. There is exactly one
pattern. Do not invent per-subject question rendering — reuse the shared
components below and adapt the subject's data into the canonical question shapes.
If a subject needs something new (e.g. Biology's drawing upload), add it as an
*extra block* around the canonical components, never as a replacement.

## The golden rule

Never hand-roll option buttons, answer inputs, dropdowns, or number gutters.
Render through these shared components only:

| Component | File | Renders |
|---|---|---|
| `TestQuestionBlock` | `src/components/test/TestQuestionBlock.vue` | one standalone question: MCQ **or** FreeAnswer |
| `TestQuestionGroup` | `src/components/test/TestQuestionGroup.vue` | a grouped block: matching (dropdown + option bank) **and/or** multi-part a/b/c FreeAnswer, with the left-bar `orderLabel` header |
| `TestEssayQuestion` | `src/components/test/TestEssayQuestion.vue` | essay (type text **or** upload photos) — used by Ona tili |
| `TestOptionButtons` | `src/components/test/TestOptionButtons.vue` | the A/B/C/D option list (used inside the two above) |
| `MathAnswerInput` | `src/components/MathAnswerInput.vue` | the "Erkin javob" box — MathQuill for math, plain textarea otherwise |
| `TestFloatingTools` | `src/components/test/TestFloatingTools.vue` | the fixed top-right countdown timer |
| `TestBottomBar` | `src/components/test/TestBottomBar.vue` | the fixed bottom answered-count + finish button |

The live `/test` route (`src/views/TestPage.vue`) is the backend-driven reference
implementation. A **self-contained demo page** for a single subject (no backend)
is done exactly like `src/views/BiologyDemoPage.vue` — study it as the template.

## The paper sheet (page shell)

Copy this shell verbatim; only the header content changes:

- Page: `min-h-screen bg-[#f5f3ef] pb-[190px] pt-2 sm:pb-[220px] sm:pt-6`
- Sheet: `mx-auto max-w-[920px] rounded-[28px] border border-[#e0ddd7] bg-white ... sm:rounded-[32px] sm:px-10 sm:py-10 lg:px-16`
- Header (keep it minimal — NO icon/eyebrow, NO section-legend chips): just the
  `font-serif-custom` title → `{{ minutes }} daqiqa • {{ n }} savol` mono line →
  `border-b` rule. Adding badges/chips/eyebrows here is "excessive" and diverges
  from the real exam — don't.
- Section divider: centered mono uppercase label with a `h-px flex-1 bg-[#e0ddd7]`
  rule on each side (this is the exam's "A QISM" divider). No number, no range.
- Body: `space-y-8 sm:space-y-10`, one child per render row.
- Mount `TestFloatingTools` (timer) and `TestBottomBar` (answered + finish).

## The question card (every question, every subject)

**Every render row sits in the same card.** There is one card style, and it is
already baked into the shared components — never add, remove, or restyle it at
the page level, and never render a question "bare" on the sheet:

```
rounded-[22px] border border-[#e5ded3] bg-[#fffdfa] p-4
shadow-[0_8px_22px_rgba(26,24,20,0.04)] sm:rounded-[20px] sm:p-6
```

It lives on the root element of `TestQuestionBlock.vue`, `TestQuestionGroup.vue`
and `BiologyAiQuestion.vue`, so a standalone MCQ, a standalone free answer, a
matching group, a multi-part a/b/c group and an AI-checked question all read as
the same object on the page. A grouped card additionally opens with the stem
rail `border-l-[3px] border-[#5b5750] pl-3.5 sm:pl-4`; a standalone card has no
rail — the number gutter alone marks it.

If you ever see one subject's question in a card and another subject's outside
one, the bug is a component that lost this class string — fix it in the shared
component, not on the page.

## Canonical question types

Adapt every subject's data into one of these. Types are read tolerantly
(`type` or `questionType`).

- **MultipleChoice** — any non-FreeAnswer/Essay/Matching type. `options: [{ id, letter, text }]`.
  → `TestQuestionBlock` (single) or a question inside `TestQuestionGroup`.
- **FreeAnswer** — open answer. Renders the `Erkin javob` label + `MathAnswerInput`
  with placeholder `Javobingizni shu yerga yozing`. Numeric answers use this too
  (do NOT build a custom "raqam" input).
- **Matching** — shared option bank (`optionBank: [{ id, letter, text }]`) + a
  `Tanlang` dropdown per question. Option ids MUST be **numeric** (the component
  coerces with `Number()`). Only inside `TestQuestionGroup`.
- **Essay** — `TestEssayQuestion` (Ona tili only).

**Multi-part questions (a/b/c):** one `TestQuestionGroup` where `title` = the
shared stem, `orderLabel` = the question number (e.g. `"36"`, shown with the left
bar), and `questions` = each part as `{ id, type:'FreeAnswer', text, groupSubLabel:'a' }`.
When a group has no Matching question, its `orderLabel` shows as the big left-bar
number; matching groups instead number each row (33/34/35) next to the dropdown.

## Wiring TestQuestionBlock

```vue
<TestQuestionBlock
  :question="{ id, type:'MultipleChoice'|'FreeAnswer', text, displayOrder, showOrder:true, options }"
  :selected-answer="answers[id]"
  :free-answer-value="resolveFreeAnswer(id)"
  :image-alt="t('testPage.imageAlt')"
  :free-answer-label="t('testPage.freeAnswerLabel')"
  :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
  :open-math-label="t('testPage.openMathInput')"
  :close-math-label="t('testPage.closeMathInput')"
  @update-option="(qid, optId) => answers[qid] = optId"
  @update-free-answer="(qid, val) => freeAnswers[qid] = val"
/>
```

## Wiring TestQuestionGroup

```vue
<TestQuestionGroup
  :title="stemOrPassage"
  :order-label="String(order)"
  :option-bank="bank"                     // [{ id:Number, letter, text }] — matching only
  :questions="questions"                  // [{ id, type:'Matching'|'FreeAnswer', text, matchingOptions?, groupSubLabel? }]
  :selected-answers="matchingAnswers"     // id → numeric option id
  :resolve-free-answer="resolveFreeAnswer"
  :option-bank-label="t('testPage.optionBank')"     // "Variantlar"
  :select-option-label="t('testPage.selectOption')" // "Tanlang"
  :free-answer-label="t('testPage.freeAnswerLabel')"
  :free-answer-placeholder="t('testPage.freeAnswerPlaceholder')"
  image-alt=""
  @update-matching-answer="(qid, optId) => matchingAnswers[qid] = optId ? Number(optId) : ''"
  @update-free-answer="(qid, val) => freeAnswers[qid] = val"
/>
```

## i18n labels (never hardcode)

Always pull from `t('testPage.*')` so uz/ru both work. Key values (uz):

- `minutes` = "daqiqa", `questionsLabel` = "savol", `answered` = "javob berildi"
- `finish` = "NATIJALAR SAHIFASIGA O‘TISH"  ← the bottom-bar button label
- `optionBank` = "Variantlar", `selectOption` = "Tanlang"
- `freeAnswerLabel` = "Erkin javob", `freeAnswerPlaceholder` = "Javobingizni shu yerga yozing"
- `openMathInput` / `closeMathInput`, `imageAlt` = "Savol rasmi"

## Answer state shape

Keep four reactive maps keyed by question id:

- `answers` — MCQ option id
- `matchingAnswers` — chosen bank id (numeric)
- `freeAnswers` — free-answer / essay / multi-part text (parts keyed like `41a`)
- plus any subject-specific store (e.g. Biology `aiUploads` keyed by order)

`answeredCount` counts one slot per order: a multi-part or matching order counts
when answered per that subject's rule.

## Subject-specific extras (the ONLY place to deviate)

When a subject needs more than the canonical types, render the extra as a sibling
block around the canonical component — never replace it:

- **Biology 41–43 (AI-checked, image-only):** `BiologyAiQuestion.vue` renders the
  canonical group card (left-bar number + stem, a/b/c parts) but the parts are
  **read-only prompts with NO answer boxes** — the whole answer is a single image
  upload (`BiologyDrawingUpload.vue`, an "AI tekshiradi" dropzone with in-browser
  compression). These are graded purely from the uploaded photo.
- **Ona tili essay:** `TestEssayQuestion` (type-or-photo).
- **Math:** `MathAnswerInput` auto-shows the MathQuill keyboard because
  `isMathSubject(testStore.currentTest?.subject)` is true; nothing extra to do.

## Registering a new subject

1. Add the subject to `SUBJECT_FILTER_OPTIONS` + an icon in `src/utils/subjects.js`.
2. Add a route in `src/router/index.js` (`subjectKey` + SEO meta).
3. Build the page from `BiologyDemoPage.vue` (demo) or wire the backend `/test` flow.

## Verify

Reload the page and confirm every question row is wrapped in the shared card
(`bg-[#fffdfa]`, `border-[#e5ded3]`, radius 22/20) — no bare questions — and,
for each type: MCQ options, `Tanlang` dropdowns +
`Variantlar` bank, `Erkin javob` boxes with `Javobingizni shu yerga yozing`,
multi-part left-bar groups, the countdown, and the `NATIJALAR SAHIFASIGA O‘TISH`
bottom bar — plus zero console errors and a working answered counter.
