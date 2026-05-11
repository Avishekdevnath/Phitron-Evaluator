// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

afterEach(() => cleanup())
import React from 'react'
import FillPanel from './FillPanel'
import type { EvaluationResult } from '../../types/index'

beforeEach(() => {
  global.chrome = {
    storage: {
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  } as any
})

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
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
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
    // both badge "✓ Applied" and button "✓ Applied — Re-apply" contain "Applied"
    expect(screen.getAllByText(/applied/i).length).toBeGreaterThan(0)
  })
})
