# Phitron Form Auto-Fill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inject an AI-powered preview panel into the Phitron grading modal that auto-fills the mark input and Quill feedback editor with scaled evaluation results.

**Architecture:** A new content script (`phitronContent.ts`) runs on `phitron.io/instructor-dashboard/*`, uses MutationObserver to detect when the assignment modal opens, and mounts a React `FillPanel` component into it via `ReactDOM.createRoot`. The panel reads `lastEvaluationResult` from `chrome.storage.local`, scales the total score to match the modal's "out of X" deadline penalty, shows a preview with an editable overall comment, and fills the form on instructor approval.

**Tech Stack:** TypeScript, React 18, ReactDOM.createRoot, Vitest, @testing-library/react, Chrome MV3 content scripts, Vite 5 rollup multi-entry

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/utils/feedbackFormatter.ts` | Create | Pure functions: score scaling, overall comment synthesis, Hybrid-B HTML generation |
| `src/utils/feedbackFormatter.test.ts` | Create | Vitest unit tests for feedbackFormatter |
| `src/contentScript/phitronFormFiller.ts` | Create | DOM helpers: readOutOf, fillMarkInput (React-controlled), fillQuillEditor (two-strategy) |
| `src/contentScript/phitronFormFiller.test.ts` | Create | jsdom tests for form filler |
| `src/components/phitron/FillPanel.tsx` | Create | React preview panel — collapsed/expanded, editable comment, apply button |
| `src/components/phitron/FillPanel.test.tsx` | Create | RTL tests for FillPanel |
| `src/contentScript/phitronContent.ts` | Create | Content script entry — observer, ReactDOM mount, cleanup |
| `vite.config.ts` | Modify | Add `phitronContent` build entry |
| `public/manifest.json` | Modify | Add phitron.io content_scripts + host_permissions |

---

### Task 1: feedbackFormatter utility

**Files:**
- Create: `src/utils/feedbackFormatter.ts`
- Create: `src/utils/feedbackFormatter.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/utils/feedbackFormatter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  scaleTotal,
  generateOverallComment,
  generateFeedbackHTML,
} from './feedbackFormatter'
import type { EvaluationResult, QuestionResult } from '../types/index'

const makeQuestion = (overrides: Partial<QuestionResult> = {}): QuestionResult => ({
  questionId: 'q1',
  questionNumber: '1',
  awardedMarks: 10,
  maxMarks: 10,
  summary: 'Good work.',
  strengths: ['Correct answer'],
  mistakes: [],
  suggestions: [],
  rubricAlignment: '',
  aiCopyPercentage: 0,
  confidence: 'high',
  status: 'complete',
  ...overrides,
})

const makeResult = (overrides: Partial<EvaluationResult> = {}): EvaluationResult => ({
  id: 'r1',
  assignmentId: 'a1',
  assignmentVersion: 1,
  submissionId: 's1',
  submissionName: 'student_notebook.ipynb',
  strictness: 'balanced',
  totalScore: 85,
  maxScore: 100,
  generatedAt: '2026-05-03T00:00:00Z',
  questionResults: [makeQuestion()],
  ...overrides,
})

describe('scaleTotal', () => {
  it('returns totalScore unchanged when outOf equals maxScore', () => {
    expect(scaleTotal(85, 100, 100)).toBe(85)
  })

  it('scales down when outOf is less than maxScore', () => {
    expect(scaleTotal(100, 100, 90)).toBe(90)
  })

  it('rounds to nearest integer', () => {
    expect(scaleTotal(85, 100, 90)).toBe(77) // 85 * 0.9 = 76.5 → 77
  })

  it('returns 0 when totalScore is 0', () => {
    expect(scaleTotal(0, 100, 90)).toBe(0)
  })

  it('throws when maxScore is 0', () => {
    expect(() => scaleTotal(85, 0, 90)).toThrow('maxScore cannot be zero')
  })
})

describe('generateOverallComment', () => {
  it('joins non-empty summaries with space', () => {
    const questions = [
      makeQuestion({ summary: 'Good work.' }),
      makeQuestion({ questionNumber: '2', summary: 'Minor errors.' }),
    ]
    expect(generateOverallComment(questions)).toBe('Good work. Minor errors.')
  })

  it('skips empty summaries', () => {
    const questions = [
      makeQuestion({ summary: '' }),
      makeQuestion({ questionNumber: '2', summary: 'Nice job.' }),
    ]
    expect(generateOverallComment(questions)).toBe('Nice job.')
  })

  it('returns fallback when all summaries empty', () => {
    const questions = [makeQuestion({ summary: '' })]
    expect(generateOverallComment(questions)).toBe(
      'Please review the feedback below for each question.'
    )
  })

  it('truncates to 300 chars', () => {
    const questions = [makeQuestion({ summary: 'a'.repeat(400) })]
    expect(generateOverallComment(questions).length).toBeLessThanOrEqual(300)
  })
})

describe('generateFeedbackHTML', () => {
  it('includes overall comment in first paragraph', () => {
    const result = makeResult()
    const html = generateFeedbackHTML(result, 'Great effort.')
    expect(html).toContain('Great effort.')
  })

  it('includes question number and marks for complete question', () => {
    const result = makeResult({
      questionResults: [
        makeQuestion({ questionNumber: '1', awardedMarks: 10, maxMarks: 10, status: 'complete' }),
      ],
    })
    const html = generateFeedbackHTML(result, '')
    expect(html).toContain('Question - 1')
    expect(html).toContain('10 / 10')
  })

  it('includes mistake and suggestion for partial question', () => {
    const result = makeResult({
      questionResults: [
        makeQuestion({
          questionNumber: '2',
          awardedMarks: 8,
          maxMarks: 10,
          status: 'partial',
          mistakes: ['Sign error in derivative'],
          suggestions: ['Use a1 * (1 - a1)'],
        }),
      ],
    })
    const html = generateFeedbackHTML(result, '')
    expect(html).toContain('Sign error in derivative')
    expect(html).toContain('Use a1 * (1 - a1)')
  })

  it('shows "Question not attempted" for skipped question', () => {
    const result = makeResult({
      questionResults: [
        makeQuestion({
          questionNumber: '3',
          awardedMarks: 0,
          maxMarks: 10,
          status: 'skipped',
          mistakes: [],
          suggestions: [],
        }),
      ],
    })
    const html = generateFeedbackHTML(result, '')
    expect(html).toContain('Question not attempted')
  })

  it('includes boilerplate footer', () => {
    const result = makeResult()
    const html = generateFeedbackHTML(result, '')
    expect(html).toContain('Do not post on Facebook')
    expect(html).toContain('recheck request')
  })

  it('does NOT include mistake block for complete question', () => {
    const result = makeResult({
      questionResults: [makeQuestion({ status: 'complete', mistakes: ['some mistake'] })],
    })
    const html = generateFeedbackHTML(result, '')
    expect(html).not.toContain('some mistake')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```
npm test -- --reporter=verbose feedbackFormatter
```

Expected: All FAIL with `"Cannot find module './feedbackFormatter'"`

- [ ] **Step 3: Implement feedbackFormatter.ts**

Create `src/utils/feedbackFormatter.ts`:

```ts
import type { EvaluationResult, QuestionResult } from '../types/index'

const BOILERPLATE = [
  'Important Instructions:',
  ' → Do not post on Facebook, if you have any marks-related issues.',
  ' → Make sure to read all the requirements carefully, If you have any marks-related confusion.',
  ' → If you are confident and If there is a mistake from the examiner\'s end, give a recheck request.',
  ' → If your recheck reason was not valid, 2 marks will be deducted from your current marks.',
  ' → Please check the documentation below for more information about how to recheck.',
  '',
  'We have a recheck option, so please refrain from posting to the group.',
  'If your recheck reason is valid you will get marks, if not valid 2 marks will be deducted.',
].join('\n')

export function scaleTotal(totalScore: number, maxScore: number, outOf: number): number {
  if (maxScore === 0) throw new Error('maxScore cannot be zero')
  return Math.round((totalScore / maxScore) * outOf)
}

export function generateOverallComment(questions: QuestionResult[]): string {
  const joined = questions
    .map(q => q.summary)
    .filter(Boolean)
    .join(' ')
  const text = joined || 'Please review the feedback below for each question.'
  return text.length > 300 ? text.slice(0, 300) : text
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildQuestionBlock(q: QuestionResult): string {
  const lines: string[] = [
    `<p><strong style="font-size:15px"># Question - ${q.questionNumber}</strong></p>`,
    `<p><em class="ql-padding-2" style="font-size:15px;"> ${escapeHtml(q.summary || q.questionNumber)} → ${q.awardedMarks} / ${q.maxMarks}</em></p>`,
  ]
  if (q.status === 'partial') {
    if (q.mistakes[0]) lines.push(`<p><span style="font-size:15px;"> ✗ ${escapeHtml(q.mistakes[0])}</span></p>`)
    if (q.suggestions[0]) lines.push(`<p><span style="font-size:15px;"> 💡 ${escapeHtml(q.suggestions[0])}</span></p>`)
  } else if (q.status === 'skipped') {
    lines.push(`<p><span style="font-size:15px;"> ✗ Question not attempted.</span></p>`)
  }
  return lines.join('')
}

export function generateFeedbackHTML(result: EvaluationResult, overallComment: string): string {
  const header =
    `<p><strong style="font-size:15px;">Examiner Feedback: </strong>` +
    `<span style="font-size:15px;">${escapeHtml(overallComment)}</span></p><p><br></p>`

  const questionBlocks = result.questionResults
    .map(buildQuestionBlock)
    .join('<p><br></p>')

  const footer =
    `<p><br></p><p><span style="font-size:15px;">` +
    escapeHtml(BOILERPLATE).replace(/\n/g, '<br>') +
    `</span></p>`

  return header + questionBlocks + footer
}
```

- [ ] **Step 4: Run tests — verify they pass**

```
npm test -- --reporter=verbose feedbackFormatter
```

Expected: All PASS

- [ ] **Step 5: Commit**

```
git add src/utils/feedbackFormatter.ts src/utils/feedbackFormatter.test.ts
git commit -m "feat: add feedback formatter with scaling, comment synthesis, Hybrid-B HTML"
```

---

### Task 2: phitronFormFiller DOM utilities

**Files:**
- Create: `src/contentScript/phitronFormFiller.ts`
- Create: `src/contentScript/phitronFormFiller.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/contentScript/phitronFormFiller.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readOutOf, fillMarkInput, fillQuillEditor } from './phitronFormFiller'

function buildModal(outOfValue: string, inputValue = '0') {
  const modal = document.createElement('div')
  modal.innerHTML = `
    <div class="assignment-evaluation-form">
      <input name="obtainMark" type="number" value="${inputValue}" />
      <span class="font-weight-bold pl-2">${outOfValue}</span>
      <div class="ql-container">
        <div class="ql-editor" contenteditable="true"><p></p></div>
      </div>
    </div>
  `
  return modal
}

describe('readOutOf', () => {
  it('reads numeric value from out-of span', () => {
    expect(readOutOf(buildModal('90'))).toBe(90)
  })

  it('returns 100 when span not found', () => {
    expect(readOutOf(document.createElement('div'))).toBe(100)
  })

  it('returns 100 when span contains non-numeric text', () => {
    expect(readOutOf(buildModal('N/A'))).toBe(100)
  })
})

describe('fillMarkInput', () => {
  it('dispatches input and change events after setting value', () => {
    const modal = buildModal('100', '0')
    const input = modal.querySelector('input[name="obtainMark"]') as HTMLInputElement
    const inputSpy = vi.fn()
    const changeSpy = vi.fn()
    input.addEventListener('input', inputSpy)
    input.addEventListener('change', changeSpy)

    fillMarkInput(modal, 76)

    expect(inputSpy).toHaveBeenCalledTimes(1)
    expect(changeSpy).toHaveBeenCalledTimes(1)
  })

  it('does not throw when input not found', () => {
    expect(() => fillMarkInput(document.createElement('div'), 76)).not.toThrow()
  })
})

describe('fillQuillEditor', () => {
  beforeEach(() => {
    ;(window as any).Quill = undefined
  })

  it('sets ql-editor innerHTML when no Quill global', () => {
    const modal = buildModal('100')
    fillQuillEditor(modal, '<p>Hello</p>')
    const editor = modal.querySelector('.ql-editor') as HTMLElement
    expect(editor.innerHTML).toContain('Hello')
  })

  it('uses Quill global when available', () => {
    const modal = buildModal('100')
    const qlContainer = modal.querySelector('.ql-container')
    const mockQuill = { clipboard: { dangerouslyPasteHTML: vi.fn() } }
    ;(window as any).Quill = { find: vi.fn().mockReturnValue(mockQuill) }

    fillQuillEditor(modal, '<p>Test</p>')

    expect((window as any).Quill.find).toHaveBeenCalledWith(qlContainer)
    expect(mockQuill.clipboard.dangerouslyPasteHTML).toHaveBeenCalledWith('<p>Test</p>')
  })

  it('does not throw when ql-editor not found', () => {
    expect(() => fillQuillEditor(document.createElement('div'), '<p>Test</p>')).not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```
npm test -- --reporter=verbose phitronFormFiller
```

Expected: All FAIL with `"Cannot find module './phitronFormFiller'"`

- [ ] **Step 3: Implement phitronFormFiller.ts**

Create `src/contentScript/phitronFormFiller.ts`:

```ts
export function readOutOf(modal: Element): number {
  const span = modal.querySelector<HTMLElement>('.font-weight-bold.pl-2')
  if (!span) return 100
  const val = parseInt(span.textContent ?? '', 10)
  return isNaN(val) ? 100 : val
}

export function fillMarkInput(modal: Element, value: number): void {
  const input = modal.querySelector<HTMLInputElement>('input[name="obtainMark"]')
  if (!input) return
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  if (nativeSetter) {
    nativeSetter.call(input, String(value))
  } else {
    input.value = String(value)
  }
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export function fillQuillEditor(modal: Element, html: string): void {
  const qlContainer = modal.querySelector('.ql-container')
  const editor = modal.querySelector<HTMLElement>('.ql-editor')
  if (!editor) return

  // Strategy 1: Quill global API (preferred — keeps Quill internal state in sync)
  const quillGlobal = (window as any).Quill
  if (quillGlobal && qlContainer) {
    const quill = quillGlobal.find(qlContainer)
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(html)
      return
    }
  }

  // Strategy 2: Direct innerHTML fallback
  editor.innerHTML = html
}
```

- [ ] **Step 4: Run tests — verify they pass**

```
npm test -- --reporter=verbose phitronFormFiller
```

Expected: All PASS

- [ ] **Step 5: Commit**

```
git add src/contentScript/phitronFormFiller.ts src/contentScript/phitronFormFiller.test.ts
git commit -m "feat: add Phitron form filler DOM utilities with React input + Quill strategies"
```

---

### Task 3: FillPanel React component

**Files:**
- Create: `src/components/phitron/FillPanel.tsx`
- Create: `src/components/phitron/FillPanel.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/phitron/FillPanel.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import FillPanel from './FillPanel'
import type { EvaluationResult } from '../../types/index'

const mockResult: EvaluationResult = {
  id: 'r1',
  assignmentId: 'a1',
  assignmentVersion: 1,
  submissionId: 's1',
  submissionName: 'student.ipynb',
  strictness: 'balanced',
  totalScore: 85,
  maxScore: 100,
  generatedAt: '2026-05-03T00:00:00Z',
  questionResults: [
    {
      questionId: 'q1',
      questionNumber: '1',
      awardedMarks: 10,
      maxMarks: 10,
      summary: 'Good work.',
      strengths: [],
      mistakes: [],
      suggestions: [],
      rubricAlignment: '',
      aiCopyPercentage: 0,
      confidence: 'high',
      status: 'complete',
    },
  ],
}

describe('FillPanel', () => {
  it('shows "No evaluation yet" when result is null', () => {
    render(<FillPanel result={null} outOf={100} onApply={vi.fn()} />)
    expect(screen.getByText(/No evaluation yet/i)).toBeTruthy()
  })

  it('shows submission name when result exists', () => {
    render(<FillPanel result={mockResult} outOf={100} onApply={vi.fn()} />)
    expect(screen.getByText(/student\.ipynb/i)).toBeTruthy()
  })

  it('shows scaled score in collapsed badge', () => {
    render(<FillPanel result={mockResult} outOf={90} onApply={vi.fn()} />)
    // 85 * 0.9 = 76.5 → 77
    expect(screen.getByText(/77\/90/)).toBeTruthy()
  })

  it('expands when toggle clicked', () => {
    render(<FillPanel result={mockResult} outOf={100} onApply={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('calls onApply with scaled score and HTML string when Apply clicked', () => {
    const onApply = vi.fn()
    render(<FillPanel result={mockResult} outOf={90} onApply={onApply} />)
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    fireEvent.click(screen.getByRole('button', { name: /apply to form/i }))
    expect(onApply).toHaveBeenCalledOnce()
    const [scaledTotal, html] = onApply.mock.calls[0]
    expect(scaledTotal).toBe(77)
    expect(typeof html).toBe('string')
    expect(html.length).toBeGreaterThan(0)
  })

  it('shows applied badge after apply', () => {
    render(<FillPanel result={mockResult} outOf={100} onApply={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    fireEvent.click(screen.getByRole('button', { name: /apply to form/i }))
    expect(screen.getByText(/applied/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```
npm test -- --reporter=verbose FillPanel
```

Expected: All FAIL with `"Cannot find module './FillPanel'"`

- [ ] **Step 3: Implement FillPanel.tsx**

Create `src/components/phitron/FillPanel.tsx`:

```tsx
import React, { useState } from 'react'
import type { EvaluationResult } from '../../types/index'
import {
  scaleTotal,
  generateOverallComment,
  generateFeedbackHTML,
} from '../../utils/feedbackFormatter'

interface FillPanelProps {
  result: EvaluationResult | null
  outOf: number
  onApply: (scaledTotal: number, html: string) => void
}

export default function FillPanel({ result, outOf, onApply }: FillPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [applied, setApplied] = useState(false)
  const [overallComment, setOverallComment] = useState(() =>
    result ? generateOverallComment(result.questionResults) : ''
  )

  const scaledTotal =
    result && result.maxScore > 0
      ? scaleTotal(result.totalScore, result.maxScore, outOf)
      : 0

  const handleApply = () => {
    if (!result) return
    onApply(scaledTotal, generateFeedbackHTML(result, overallComment))
    setApplied(true)
  }

  const statusColor = (status: string) =>
    status === 'complete' ? 'badge-success' : status === 'partial' ? 'badge-warning' : 'badge-danger'

  return (
    <div className="phitron-ai-panel-root card mb-3 border-primary" style={{ borderRadius: 6 }}>
      {/* Header — always visible */}
      <div
        className="card-header d-flex justify-content-between align-items-center bg-primary text-white py-2 px-3"
        style={{ borderRadius: expanded ? '6px 6px 0 0' : 6 }}
      >
        <span>
          <strong>✨ AI Evaluation Ready</strong>
          {result && (
            <span className="badge badge-light text-dark ml-2">{scaledTotal}/{outOf}</span>
          )}
          {applied && (
            <span className="badge badge-success ml-2">✓ Applied</span>
          )}
        </span>
        <button
          aria-label={expanded ? 'collapse' : 'expand'}
          className="btn btn-sm btn-outline-light py-0"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* No-result collapsed hint */}
      {!expanded && !result && (
        <div className="card-body py-2 text-muted small">
          No evaluation yet — run from Colab first.
        </div>
      )}

      {/* Expanded body */}
      {expanded && (
        <div className="card-body">
          {!result ? (
            <p className="text-muted mb-0">No evaluation yet — run from Colab first.</p>
          ) : (
            <>
              <div className="mb-2 small text-muted">
                <strong>Notebook:</strong> {result.submissionName}
                <span className="mx-2">|</span>
                <strong>Score:</strong> {result.totalScore}/{result.maxScore} ×{' '}
                {(outOf / result.maxScore).toFixed(2)} = <strong>{scaledTotal}</strong>{' '}
                (out of {outOf})
              </div>

              <div className="form-group mb-2">
                <label className="small font-weight-bold mb-1">Overall Comment</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={overallComment}
                  onChange={e => setOverallComment(e.target.value)}
                />
              </div>

              <div className="mb-3">
                {result.questionResults.map(q => (
                  <span
                    key={q.questionId}
                    className={`badge ${statusColor(q.status)} mr-1 mb-1`}
                    title={`Q${q.questionNumber}: ${q.awardedMarks}/${q.maxMarks}`}
                  >
                    Q{q.questionNumber} {q.awardedMarks}/{q.maxMarks}
                  </span>
                ))}
              </div>

              <button
                aria-label="apply to form"
                className="btn btn-primary btn-sm w-100"
                onClick={handleApply}
              >
                {applied ? '✓ Applied — Re-apply' : '✨ Apply to Form'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```
npm test -- --reporter=verbose FillPanel
```

Expected: All PASS

- [ ] **Step 5: Commit**

```
git add src/components/phitron/FillPanel.tsx src/components/phitron/FillPanel.test.tsx
git commit -m "feat: add FillPanel component for Phitron modal AI preview"
```

---

### Task 4: Phitron content script

**Files:**
- Create: `src/contentScript/phitronContent.ts`

No automated unit test — content script wires DOM + React and requires Chrome APIs. Verified in Task 6 manual test.

- [ ] **Step 1: Create phitronContent.ts**

Create `src/contentScript/phitronContent.ts`:

```ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import FillPanel from '../components/phitron/FillPanel'
import { fillMarkInput, fillQuillEditor, readOutOf } from './phitronFormFiller'
import type { EvaluationResult } from '../types/index'

const STORAGE_KEY = 'lastEvaluationResult'
const PANEL_ROOT_CLASS = 'phitron-ai-panel-root'

function loadResult(): Promise<EvaluationResult | null> {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, data => {
      try {
        const raw = data[STORAGE_KEY]
        resolve(raw ? (JSON.parse(raw) as EvaluationResult) : null)
      } catch {
        resolve(null)
      }
    })
  })
}

async function injectPanel(form: Element): Promise<void> {
  // Guard: already injected (synchronous check before any await)
  if (form.querySelector(`.${PANEL_ROOT_CLASS}`)) return

  // Create and insert container synchronously so re-entrant calls are blocked
  // even across the async gap of loadResult()
  const container = document.createElement('div')
  container.className = PANEL_ROOT_CLASS
  form.insertBefore(container, form.firstChild)

  const result = await loadResult()
  const outOf = readOutOf(form)

  const root = ReactDOM.createRoot(container)

  root.render(
    React.createElement(FillPanel, {
      result,
      outOf,
      onApply: (scaledTotal: number, html: string) => {
        fillMarkInput(form, scaledTotal)
        fillQuillEditor(form, html)
      },
    })
  )

  // Unmount when modal closes (container leaves DOM)
  const cleanup = new MutationObserver(() => {
    if (!document.contains(container)) {
      root.unmount()
      cleanup.disconnect()
    }
  })
  cleanup.observe(document.body, { childList: true, subtree: true })
}

const modalObserver = new MutationObserver(() => {
  const form = document.querySelector(
    '.ReactModal__Content .assignment-evaluation-form'
  )
  if (form && !form.querySelector(`.${PANEL_ROOT_CLASS}`)) {
    injectPanel(form)
  }
})

modalObserver.observe(document.body, { childList: true, subtree: true })
```

- [ ] **Step 2: Commit**

```
git add src/contentScript/phitronContent.ts
git commit -m "feat: add Phitron content script — modal observer + React panel injection"
```

---

### Task 5: Build config + manifest

**Files:**
- Modify: `vite.config.ts`
- Modify: `public/manifest.json`

- [ ] **Step 1: Add phitronContent entry to vite.config.ts**

In `vite.config.ts`, inside `rollupOptions.input`, add one line:

```ts
input: {
  popup: path.resolve(__dirname, 'popup.html'),
  options: path.resolve(__dirname, 'options.html'),
  sidepanel: path.resolve(__dirname, 'sidepanel.html'),
  content: path.resolve(__dirname, 'src/contentScript/content.ts'),
  phitronContent: path.resolve(__dirname, 'src/contentScript/phitronContent.ts'),
},
```

- [ ] **Step 2: Update public/manifest.json**

Replace `public/manifest.json` with:

```json
{
  "manifest_version": 3,
  "name": "Phitron Assignment Evaluator",
  "version": "0.1.0",
  "description": "AI-powered assignment evaluator for educators",
  "permissions": [
    "storage",
    "scripting",
    "activeTab",
    "sidePanel"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Phitron Evaluator"
  },
  "options_page": "options.html",
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "host_permissions": [
    "https://api.openai.com/*",
    "*://phitron.io/*"
  ],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    },
    {
      "matches": ["*://phitron.io/instructor-dashboard/*"],
      "js": ["phitronContent.js"],
      "run_at": "document_end"
    }
  ]
}
```

- [ ] **Step 3: Build and verify output**

```
npm run build
```

Expected: Build succeeds. Verify `dist/phitronContent.js` exists:

```
dir dist\phitronContent.js
```

Expected: File listed with non-zero size.

- [ ] **Step 4: Commit**

```
git add vite.config.ts public/manifest.json
git commit -m "feat: add phitronContent build entry and manifest permissions"
```

---

### Task 6: Manual integration test

Requires Chrome with built extension loaded. No automated test.

- [ ] **Step 1: Load extension**

1. Open `chrome://extensions`
2. Enable Developer mode (top right toggle)
3. Click "Load unpacked" → select the `dist/` folder

- [ ] **Step 2: Full happy path**

1. Open any Google Colab notebook
2. Click extension popup → "Evaluate This Notebook" → wait for completion
3. Navigate to `phitron.io/instructor-dashboard/my-assignment?assType=Assignments+Done`
4. Open any student's grading modal
5. Verify: blue `✨ AI Evaluation Ready  XX/YY  [▼]` banner appears at top of modal
6. Click `[▼]` to expand
7. Verify: submission filename shown, scaled score calculation shown, overall comment textarea pre-filled, per-question badges visible
8. Edit overall comment if desired
9. Click "✨ Apply to Form"
10. Verify: `obtainMark` input now shows scaled score
11. Verify: Quill editor filled with Hybrid-B formatted feedback including question blocks and boilerplate footer
12. Verify: banner shows `✓ Applied` green badge

- [ ] **Step 3: Test late submission scaling**

1. Find a student modal where "out of" shows `90` instead of `100`
2. Expand panel — verify score shown as `AI_score × 0.90 = scaled`
3. Apply — verify `obtainMark` input matches scaled value

- [ ] **Step 4: Test stale result visibility**

1. Evaluate Student A's notebook
2. Open Student B's modal on Phitron
3. Expand panel — verify Student A's filename is visible so instructor knows it's mismatched

- [ ] **Step 5: Test no-result state**

1. Open Chrome DevTools → Application tab → Extension Storage → Clear `lastEvaluationResult`
2. Open any Phitron grading modal
3. Verify: panel shows "No evaluation yet — run from Colab first"
