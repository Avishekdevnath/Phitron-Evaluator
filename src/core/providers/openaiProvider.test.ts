import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpenAIProvider } from './openaiProvider'
import { ProviderError } from '../../types/index'

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider

  beforeEach(() => {
    provider = new OpenAIProvider('sk-test123456789')
    vi.clearAllMocks()
  })

  it('should test connection successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))

    const result = await provider.testConnection()

    expect(result).toBe(true)
  })

  it('should handle connection failure', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 }))

    const result = await provider.testConnection()

    expect(result).toBe(false)
  })

  it('should generate structured evaluation', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              awardedMarks: 8,
              summary: 'Good answer',
              strengths: ['Clear explanation'],
              mistakes: ['Minor typo'],
              suggestions: ['Proofread'],
              rubricAlignment: 'Aligned',
              aiCopyPercentage: 42,
              confidence: 'high',
              status: 'complete',
            }),
          },
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await provider.generateStructuredEvaluation({
      question: {
        title: 'Q1',
        prompt: 'Answer this',
        maxMarks: 10,
      },
      strictness: 'balanced',
      submission: {
        content: 'Student answer',
        blocks: [],
      },
    })

    expect(result.awardedMarks).toBe(8)
    expect(result.summary).toBe('Good answer')
    expect(result.aiCopyPercentage).toBe(42)
    expect(result.confidence).toBe('high')
  })

  it('should default missing AI copy likelihood to zero', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              awardedMarks: 8,
              summary: 'Good answer',
              strengths: ['Clear explanation'],
              mistakes: [],
              suggestions: [],
              rubricAlignment: 'Aligned',
              confidence: 'high',
              status: 'complete',
            }),
          },
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await provider.generateStructuredEvaluation({
      question: {
        title: 'Q1',
        prompt: 'Answer this',
        maxMarks: 10,
      },
      strictness: 'balanced',
      submission: {
        content: 'Student answer',
        blocks: [],
      },
    })

    expect(result.aiCopyPercentage).toBe(0)
  })

  it('should clamp AI copy likelihood within 0 to 100', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              awardedMarks: 8,
              summary: 'Good answer',
              strengths: [],
              mistakes: [],
              suggestions: [],
              rubricAlignment: 'Aligned',
              aiCopyPercentage: 250,
              confidence: 'medium',
              status: 'complete',
            }),
          },
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await provider.generateStructuredEvaluation({
      question: {
        title: 'Q1',
        prompt: 'Answer this',
        maxMarks: 10,
      },
      strictness: 'strict',
      submission: {
        content: 'Student answer',
        blocks: [],
      },
    })

    expect(result.aiCopyPercentage).toBe(100)
  })

  it('should include strictness instructions in the OpenAI prompt', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              awardedMarks: 6,
              summary: 'Acceptable answer',
              strengths: [],
              mistakes: [],
              suggestions: [],
              rubricAlignment: 'Aligned',
              aiCopyPercentage: 15,
              confidence: 'medium',
              status: 'partial',
            }),
          },
        },
      ],
    }

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )
    global.fetch = fetchMock

    await provider.generateStructuredEvaluation({
      question: {
        title: 'Q1',
        prompt: 'Answer this',
        maxMarks: 10,
      },
      strictness: 'strict',
      submission: {
        content: 'Student answer',
        blocks: [],
      },
    })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.messages[1].content).toContain('Strictness: strict')
    expect(body.messages[1].content).toContain('Penalize missing detail')
  })

  it('should clamp marks within range', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              awardedMarks: 500,
              summary: 'Test',
              strengths: [],
              mistakes: [],
              suggestions: [],
              rubricAlignment: 'Test',
              confidence: 'medium',
              status: 'complete',
            }),
          },
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 })
    )

    const result = await provider.generateStructuredEvaluation({
      question: {
        title: 'Q1',
        prompt: 'Answer',
        maxMarks: 10,
      },
      strictness: 'balanced',
      submission: {
        content: 'Answer',
        blocks: [],
      },
    })

    expect(result.awardedMarks).toBeLessThanOrEqual(10)
  })

  it('should throw on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { message: 'Invalid API key' },
        }),
        { status: 401 }
      )
    )

    await expect(
      provider.generateStructuredEvaluation({
        question: {
          title: 'Q1',
          prompt: 'Answer',
          maxMarks: 10,
        },
        strictness: 'balanced',
        submission: {
          content: 'Answer',
          blocks: [],
        },
      })
    ).rejects.toThrow(ProviderError)
  })

  it('should handle invalid JSON response', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: 'Invalid JSON{',
              },
            },
          ],
        }),
        { status: 200 }
      )
    )

    await expect(
      provider.generateStructuredEvaluation({
        question: {
          title: 'Q1',
          prompt: 'Answer',
          maxMarks: 10,
        },
        strictness: 'balanced',
        submission: {
          content: 'Answer',
          blocks: [],
        },
      })
    ).rejects.toThrow(ProviderError)
  })
})
