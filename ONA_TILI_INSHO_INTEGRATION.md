# Ona tili — Insho (Essay) AI Analysis · Frontend Integration Guide

**Audience:** backend developer wiring the real API + Gemini grading.
**Status:** the UI is DONE and demo-visible at `/ona-tili-demo-natija` (DEV only). It renders sample data through the exact same components production will use — connecting it is a data swap, not a rebuild.

---

## 1. What exists on the frontend

| File | Role |
|---|---|
| `src/components/onatili/EssayAnalysisSection.vue` | **The integration surface.** Renders the whole "Insho tahlili" section (band/so'z/xato strip, on-topic + plagiarism checks, color-coded inline error highlights, issue inspector, category filters) from the **raw Gemini JSON** — no preprocessing needed. |
| `src/utils/essayAnalysis.js` | Production constants (`ESSAY_BAND_MAX = 24`, category labels/colors) + `normalizeEssayAnalysis(raw)` — a tolerant normalizer (missing categories, empty lists, string bands, unknown future criteria keys all render safely). |
| `src/utils/essayAnalysisApi.js` | `fetchEssayAnalysis(testAttemptId)` — client for the **proposed** endpoint (§3). The only file to touch if the final contract differs. |
| `src/views/OnaTiliDemoResultPage.vue` | The natija page: score overview + review table (same design as the live ExplanationPage) + the essay section. Currently grades against a demo key from localStorage. |
| `src/data/onaTiliDemoAnalysis.js` | DEMO ONLY: unofficial answer key, sample essay, captured Gemini response, sample band total. Deleted/ignored once live. |

### Component usage (this is all the wiring there is)

```vue
<EssayAnalysisSection
  :analysis="data.analysis"     <!-- raw Gemini JSON, pass-through -->
  :essay-text="data.essayText"  <!-- the essay the AI graded -->
  :band-total="data.bandTotal"  <!-- overall band, e.g. 17 -->
  :band-max="data.bandMax"      <!-- 24 -->
/>                               <!-- omit `sample` in production -->
```

---

## 2. The AI (Gemini) response the frontend consumes

Pass it through **unchanged** from Gemini:

```jsonc
{
  "on_topic": true,
  "copied_suspected": false,
  "global_notes": "Insho belgilangan mavzu bo'yicha ...",
  "error_criteria": {
    "c5_structure":   { "errors": [ { "quote": "...", "issue": "...", "error_type": "..." } ] },
    "c6_repetition":  { "errors": [] },
    "c7_spelling":    { "errors": [ /* ... */ ] },
    "c8_punctuation": { "errors": [ /* ... */ ] },
    "c9_affix":       { "errors": [ /* ... */ ] },
    "c10_word_style": { "errors": [ /* ... */ ] },
    "c12_register":   { "errors": [] }
  },
  "judgment_criteria": {
    "c1_style":      { "reasoning": "...", "band": "2" },
    "c2_viewpoints": { "reasoning": "...", "band": "1" }
    // c3, c4, ... — whatever the final prompt returns
  }
}
```

Notes:
- **`quote` must be a verbatim substring of the essay text** — that's how inline highlights anchor. Apostrophe variants (`’ ‘ ʻ \` ´` vs `'`) are normalized on both sides, so those never break a match. A quote that isn't found still shows in the right-hand inspector (no crash, just no inline anchor).
- Unknown criteria keys are appended and rendered with a fallback label/color — adding a criterion to the prompt does **not** require a frontend release.
- **Scoring**: 12 mezon (c1–c12) × 0–2 ball = **24**. The frontend does NOT sum bands itself — send the overall total (see §3).

---

## 3. Proposed endpoint (confirm shape, then implement)

```
GET /api/user-test-attempt/essay-analysis?testAttemptId=987      (Authorize)

→ { "code": 200, "message": "Ok👍🏿", "data": {
      "bandTotal": 17,
      "bandMax": 24,
      "essayText": "…the student's essay the AI graded…",
      "analysis": { …raw Gemini JSON from §2… }
  } }
```

- Standard envelope, camelCase, `code === 200` checked by the client.
- Grading is async → while pending, return a non-200 `code` (e.g. 202/404) with a message; the frontend shows a "tahlil tayyorlanmoqda" state and can poll.
- If you change the path/shape, update **only** `src/utils/essayAnalysisApi.js`.

---

## 4. Going live — checklist

1. **Objective part (Q1–44)** — nothing new: publish the MotherTongue `Test` and the existing `start-test → user-answer → submit → get-results` pipeline replaces the demo's localStorage + demo key (same code path the math tests use; see `ONA_TILI_BACKEND_HANDOFF.md` in the workspace root for entity mapping + photo-upload deliverables).
2. **Essay** — implement §3; on the results page call `fetchEssayAnalysis(attemptId)` and feed `EssayAnalysisSection` (drop the `sample` prop).
3. Frontend follow-ups when 1–2 land (our side): swap `OnaTiliDemoResultPage` data sources to `get-results` + `fetchEssayAnalysis`, drop the DEV-only gating on the routes, delete `src/data/onaTiliDemo*`.

### Known demo-only stubs (flagged in code)
- **Answer key** in `onaTiliDemoAnalysis.js` is unofficial (design preview grading only).
- **Murakkablik (difficulty)** badges use a deterministic placeholder until content carries real difficulty metadata.
- **Report flag** button shows a demo notice; wire it to the real problem-report flow used by other tests.
- Handwritten (photo) essays need the upload endpoint + OCR/manual path before AI analysis applies; typed essays work end-to-end with §3 as-is.
