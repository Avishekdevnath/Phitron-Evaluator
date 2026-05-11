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
