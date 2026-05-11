import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EvaluationEngineImpl } from './evaluationEngine'
import { settingsService } from '../../services/settings/settingsService'
import { Assignment, SubmissionBlock } from '../../types/index'
import { NormalizedSubmission } from '../submission/submissionTypes'
import { QuestionMapping } from '../mapping/mappingTypes'

vi.mock('../../services/settings/settingsService')

describe('EvaluationEngine', () => {
  let engine: EvaluationEngineImpl

  beforeEach(() => {
    engine = new EvaluationEngineImpl()
    vi.clearAllMocks()
  })

  it('should throw when no API key configured', async () => {
    vi.mocked(settingsService.getProviderSettings).mockResolvedValue({
      mode: 'custom',
      provider: 'openai',
    })

    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 10,
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          number: '1',
          title: 'Q1',
          prompt: 'Test question',
          maxMarks: 10,
        },
      ],
    }

    const mockSubmission: NormalizedSubmission = {
      id: 's1',
      name: 'Student A',
      source: 'text',
      blocks: [],
      rawContent: 'Answer',
      createdAt: new Date().toISOString(),
    }

    await expect(
      engine.evaluate({
        assignment: mockAssignment,
        submission: mockSubmission,
        questionMappings: [],
        strictness: 'balanced',
      })
    ).rejects.toThrow('OpenAI API key is not configured')
  })

  it('should throw when assignment has no questions', async () => {
    vi.mocked(settingsService.getProviderSettings).mockResolvedValue({
      mode: 'custom',
      provider: 'openai',
      apiKey: 'sk-test',
    })

    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 0,
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    }

    const mockSubmission: NormalizedSubmission = {
      id: 's1',
      name: 'Student A',
      source: 'text',
      blocks: [],
      rawContent: 'Answer',
      createdAt: new Date().toISOString(),
    }

    await expect(
      engine.evaluate({
        assignment: mockAssignment,
        submission: mockSubmission,
        questionMappings: [],
        strictness: 'balanced',
      })
    ).rejects.toThrow('Assignment must have at least one question')
  })

  it('should create evaluation result with correct structure', async () => {
    vi.mocked(settingsService.getProviderSettings).mockResolvedValue({
      mode: 'custom',
      provider: 'openai',
      apiKey: 'sk-test123456789',
    })

    // Mock fetch for OpenAI - for both testConnection and generateStructuredEvaluation
    let callCount = 0
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++
      // First call is testConnection (to models endpoint)
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: [{ id: 'gpt-4' }] }), { status: 200 })
        )
      }
      // Subsequent calls are generateStructuredEvaluation (to chat.completions)
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    awardedMarks: 8,
                    maxMarks: 10,
                    summary: 'Good answer',
                    strengths: ['Clear'],
                    mistakes: [],
                    suggestions: ['More detail'],
                    rubricAlignment: 'Aligned',
                    aiCopyPercentage: 35,
                    confidence: 'high',
                    status: 'complete',
                  }),
                },
              },
            ],
          }),
          { status: 200 }
        )
      )
    })

    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 10,
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          number: '1',
          title: 'Q1',
          prompt: 'Test question',
          maxMarks: 10,
        },
      ],
    }

    const mockBlock: SubmissionBlock = {
      id: 'b1',
      type: 'paragraph',
      content: 'Student answer',
      order: 0,
    }

    const mockSubmission: NormalizedSubmission = {
      id: 's1',
      name: 'Student A',
      source: 'text',
      blocks: [mockBlock],
      rawContent: 'Student answer',
      createdAt: new Date().toISOString(),
    }

    const mockMapping: QuestionMapping = {
      questionId: 'q1',
      questionNumber: '1',
      mappedBlocks: [mockBlock],
      confidence: 'high',
      strategy: 'explicit',
    }

    const result = await engine.evaluate({
      assignment: mockAssignment,
      submission: mockSubmission,
      questionMappings: [mockMapping],
      strictness: 'strict',
    })

    expect(result.id).toBeDefined()
    expect(result.assignmentId).toBe('1')
    expect(result.submissionId).toBe('s1')
    expect(result.strictness).toBe('strict')
    expect(result.maxScore).toBe(10)
    expect(result.questionResults.length).toBe(1)
    expect(result.questionResults[0].aiCopyPercentage).toBe(35)
  })

  it('should handle missing answers', async () => {
    vi.mocked(settingsService.getProviderSettings).mockResolvedValue({
      mode: 'custom',
      provider: 'openai',
      apiKey: 'sk-test123456789',
    })

    // Mock fetch - first call is testConnection, second is for the one answered question
    let callCount = 0
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: [{ id: 'gpt-4' }] }), { status: 200 })
        )
      }
      // Second call for the answered question
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    awardedMarks: 5,
                    maxMarks: 10,
                    summary: 'Good answer',
                    strengths: ['Clear'],
                    mistakes: [],
                    suggestions: ['More detail'],
                    rubricAlignment: 'Aligned',
                    aiCopyPercentage: 20,
                    confidence: 'high',
                    status: 'complete',
                  }),
                },
              },
            ],
          }),
          { status: 200 }
        )
      )
    })

    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 20,
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          number: '1',
          title: 'Q1',
          prompt: 'Test',
          maxMarks: 10,
        },
        {
          id: 'q2',
          number: '2',
          title: 'Q2',
          prompt: 'Test',
          maxMarks: 10,
        },
      ],
    }

    const mockSubmission: NormalizedSubmission = {
      id: 's1',
      name: 'Student A',
      source: 'text',
      blocks: [],
      rawContent: '',
      createdAt: new Date().toISOString(),
    }

    // Only Q1 is answered
    const mockMapping: QuestionMapping = {
      questionId: 'q1',
      questionNumber: '1',
      mappedBlocks: [{ id: 'b1', type: 'paragraph', content: 'Answer', order: 0 }],
      confidence: 'high',
      strategy: 'explicit',
    }

    const result = await engine.evaluate({
      assignment: mockAssignment,
      submission: mockSubmission,
      questionMappings: [mockMapping],
      strictness: 'balanced',
    })

    expect(result.questionResults.length).toBe(2)
    expect(result.questionResults[1].status).toBe('skipped')
    expect(result.questionResults[1].awardedMarks).toBe(0)
    expect(result.questionResults[1].aiCopyPercentage).toBe(0)
  })
})
