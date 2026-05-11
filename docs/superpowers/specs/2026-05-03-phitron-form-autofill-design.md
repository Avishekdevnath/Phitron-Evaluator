# Phitron Form Auto-Fill Design

**Date:** 2026-05-03  
**Feature:** Auto-fill Phitron grading modal with AI evaluation results  
**Status:** Approved for implementation

---

## Problem

After evaluating a student's Colab notebook via the extension, the instructor must manually re-enter the AI's score and feedback into the Phitron grading modal. This is redundant and error-prone.

## Goal

When an instructor opens the Phitron assignment grading modal, the extension detects it, shows a preview panel with the AI evaluation result (scaled to the modal's max marks), and lets the instructor review/edit before applying to the form with one click.

---

## Architecture

### Two content scripts

| Script | URL Match | Responsibility |
|--------|-----------|----------------|
| `src/contentScript/content.ts` (existing) | `colab.research.google.com/*` | Extract notebook, run AI eval, store result |
| `src/contentScript/phitronContent.ts` (new) | `*://phitron.io/instructor-dashboard/*` | Detect modal, inject preview panel, fill form |

### Manifest changes
- Add new `content_scripts` entry for `phitronContent.ts`
- Add `*://phitron.io/*` to `host_permissions`

### Data flow
1. Instructor evaluates Colab notebook → result stored in `chrome.storage.local` as `lastEvaluationResult`
2. Instructor navigates to `phitron.io/instructor-dashboard/my-assignment`
3. Instructor opens student grading modal
4. `phitronContent.ts` detects modal via MutationObserver → reads `lastEvaluationResult` → injects `FillPanel`
5. Instructor reviews panel → clicks "Apply to Form"
6. Extension fills `obtainMark` input + Quill editor

---

## Mark Scaling

The Phitron modal shows an "out of X" span next to the mark input. X may be less than the assignment's total marks due to late submission penalties (e.g. 90 for 2nd deadline, 80 for 3rd).

**Scaling formula:**
```
if (result.maxScore === 0) → show error, abort fill
scale = outOf / result.maxScore
scaledTotal = Math.round(result.totalScore * scale)
```

**Per-question marks in feedback text: show original AI marks, NOT scaled.**
Only `obtainMark` (the single total field) gets the scaled value. Scaling each question mark separately causes rounding mismatch (e.g. 30+30+31=91 ≠ 90). Feedback text shows raw marks for transparency.

**DOM selectors:**
- Mark input: `input[name="obtainMark"]`
- Out-of span: `.font-weight-bold.pl-2` (the bold span after "out of" text)

---

## Preview Panel UI

Injected as first child of `.assignment-evaluation-form`, above student info section.

### Collapsed state (default)
```
┌─────────────────────────────────────────────┐
│ ✨ AI Evaluation Ready  76/90  [Expand ▼]   │
└─────────────────────────────────────────────┘
```

### Expanded state
```
┌─────────────────────────────────────────────┐
│ ✨ AI Evaluation Ready              [▲]      │
├─────────────────────────────────────────────┤
│ Score: 85/100 × 0.9 = 76  (out of 90)       │
│                                             │
│ Overall Comment:        [editable textarea] │
│ "Student showed..."                         │
│                                             │
│ Q1 10/10 ✓  Q2 8/9 ⚠  Q3 5/5 ✓  ...       │
│                                             │
│           [✨ Apply to Form]                │
└─────────────────────────────────────────────┘
```

### States
- **Has result:** Show submission name from result (e.g. "alex_smith_midterm.ipynb") so instructor can verify it matches the current student before applying. Show score + editable overall comment + question summary rows + Apply button.
- **No result:** Show muted message "No evaluation yet — run from Colab first"
- **Applied:** Apply button changes to "✓ Applied — Re-apply", green badge shown

### Style
Panel uses Bootstrap classes (matching Phitron's existing UI) — NOT Tailwind. Injected via plain CSS string, scoped under a `.phitron-ai-panel` class.

### React injection
`phitronContent.ts` creates a plain `<div class="phitron-ai-panel">` and inserts it as first child of `.assignment-evaluation-form`. Then mounts `FillPanel` into that div via `ReactDOM.createRoot(container).render(...)`. This isolates our React tree from Phitron's. On modal close, call `root.unmount()` and remove the div.

---

## Feedback Format (Hybrid-B)

What gets written into the Quill editor on Apply:

```
Examiner Feedback: {instructor's edited overall comment}

# Question - 1
 {question title} → {q.awardedMarks} / {q.maxMarks}

# Question - 2
 {question title} → {q.awardedMarks} / {q.maxMarks}
 ✗ {first mistake}
 💡 {first suggestion}

# Question - 3
 {question title} → 0 / {q.maxMarks}
 ✗ Question not attempted.

Important Instructions:
 → Do not post on Facebook, if you have any marks-related issues.
 → Make sure to read all the requirements carefully, If you have any marks-related confusion.
 → If you are confident and If there is a mistake from the examiner's end, give a recheck request.
 → If your recheck reason was not valid, 2 marks will be deducted from your current marks.
 → Please check the documentation below for more information about how to recheck.

We have a recheck option, so please refrain from posting to the group.
If your recheck reason is valid you will get marks, if not valid 2 marks will be deducted.
```

### Rules
| Question status | What to show |
|----------------|--------------|
| `complete` (awarded == max) | Title + score only |
| `partial` (awarded < max, > 0) | Title + score + first mistake + first suggestion |
| `skipped` (awarded == 0) | Title + score + "Question not attempted." |

### Overall comment pre-fill
Build from `result.questionResults[].summary` fields:
- Join all non-empty `summary` strings with a space into one paragraph
- Truncate to 300 chars if over limit
- Fallback if all summaries empty: `"Please review the feedback below for each question."`

Instructor can edit before applying.

---

## Quill Editor Injection

Quill is a controlled rich text editor — cannot set innerHTML directly. Use two-strategy approach:

```ts
const qlContainer = modal.querySelector('.ql-container')
const editor = modal.querySelector('.ql-editor') as HTMLElement
const html = generateFeedbackHTML(result, overallComment)

// Strategy 1: Quill global API (works if page exposes Quill)
const quill = (window as any).Quill?.find(qlContainer)
if (quill) {
  quill.clipboard.dangerouslyPasteHTML(html)
} else {
  // Strategy 2: execCommand on contenteditable (Chrome fallback)
  editor.focus()
  document.execCommand('selectAll', false, '')
  document.execCommand('insertHTML', false, html)
}
```

`generateFeedbackHTML` produces semantic HTML matching Quill's output format (paragraphs, `<strong>` tags for bold, matching the existing feedback style seen in Mark History).

---

## React Input Filling

The `obtainMark` input is React-controlled. Direct `.value =` assignment is ignored.

```ts
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
)!.set!
nativeInputValueSetter.call(input, scaledTotal.toString())
input.dispatchEvent(new Event('input', { bubbles: true }))
input.dispatchEvent(new Event('change', { bubbles: true }))
```

---

## Modal Detection

```ts
const observer = new MutationObserver(() => {
  const form = document.querySelector(
    '.ReactModal__Content .assignment-evaluation-form'
  )
  if (form && !form.querySelector('.phitron-ai-panel')) {
    injectPanel(form)
  }
})
observer.observe(document.body, { childList: true, subtree: true })
```

Panel is removed automatically when modal closes (form node leaves DOM).

---

## New Files

| File | Purpose |
|------|---------|
| `src/contentScript/phitronContent.ts` | Content script entry point — observer + injection logic |
| `src/components/phitron/FillPanel.tsx` | Preview panel React component |
| `src/utils/feedbackFormatter.ts` | Hybrid-B format builder → HTML string |

## Modified Files

| File | Change |
|------|--------|
| `manifest.json` | Add phitron.io content_scripts + host_permissions |
| `vite.config.ts` | Add phitronContent as new entry point |
