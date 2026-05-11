import { describe, it, expect } from 'vitest'
import { AnswerMapperImpl } from './answerMapper'
import { Question, SubmissionBlock } from '../../types/index'

describe('AnswerMapper', () => {
  const mapper = new AnswerMapperImpl()

  it('should find explicit question number match', async () => {
    const questions: Question[] = [
      {
        id: '1',
        number: '1',
        title: 'Q1',
        prompt: 'What is X?',
        maxMarks: 10,
      },
    ]

    const blocks: SubmissionBlock[] = [
      {
        id: '1',
        type: 'heading',
        content: '1. Answer to Q1',
        order: 0,
      },
      {
        id: '2',
        type: 'paragraph',
        content: 'This is my answer',
        order: 1,
      },
    ]

    const mappings = await mapper.mapSubmissionToQuestions(questions, blocks)

    expect(mappings).toHaveLength(1)
    expect(mappings[0].strategy).toBe('explicit')
    expect(mappings[0].confidence).toBe('high')
    expect(mappings[0].mappedBlocks.length).toBeGreaterThan(0)
  })

  it('should find keyword-based match', async () => {
    const questions: Question[] = [
      {
        id: '1',
        number: '1',
        title: 'Photosynthesis',
        prompt: 'Explain the process of photosynthesis',
        maxMarks: 10,
      },
    ]

    const blocks: SubmissionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        content:
          'Photosynthesis is the process where plants convert light energy into chemical energy',
        order: 0,
      },
    ]

    const mappings = await mapper.mapSubmissionToQuestions(questions, blocks)

    expect(mappings).toHaveLength(1)
    expect(mappings[0].mappedBlocks.length).toBeGreaterThan(0)
  })

  it('should handle multiple questions', async () => {
    const questions: Question[] = [
      {
        id: '1',
        number: '1',
        title: 'Q1',
        prompt: 'First question',
        maxMarks: 5,
      },
      {
        id: '2',
        number: '2',
        title: 'Q2',
        prompt: 'Second question',
        maxMarks: 5,
      },
    ]

    const blocks: SubmissionBlock[] = [
      {
        id: '1',
        type: 'heading',
        content: '1. Answer',
        order: 0,
      },
      {
        id: '2',
        type: 'paragraph',
        content: 'First answer',
        order: 1,
      },
      {
        id: '3',
        type: 'heading',
        content: '2. Answer',
        order: 2,
      },
      {
        id: '4',
        type: 'paragraph',
        content: 'Second answer',
        order: 3,
      },
    ]

    const mappings = await mapper.mapSubmissionToQuestions(questions, blocks)

    expect(mappings).toHaveLength(2)
    expect(mappings.every(m => m.mappedBlocks.length > 0)).toBe(true)
  })

  it('should return proximity fallback when no match found', async () => {
    const questions: Question[] = [
      {
        id: '1',
        number: '1',
        title: 'Question',
        prompt: 'What is the meaning of life?',
        maxMarks: 10,
      },
    ]

    const blocks: SubmissionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        content: 'Random text that does not match the question',
        order: 0,
      },
    ]

    const mappings = await mapper.mapSubmissionToQuestions(questions, blocks)

    expect(mappings).toHaveLength(1)
    expect(mappings[0].strategy).toBe('proximity')
    expect(mappings[0].confidence).toBe('low')
  })

  it('should handle empty blocks', async () => {
    const questions: Question[] = [
      {
        id: '1',
        number: '1',
        title: 'Q1',
        prompt: 'Question',
        maxMarks: 10,
      },
    ]

    const blocks: SubmissionBlock[] = []

    const mappings = await mapper.mapSubmissionToQuestions(questions, blocks)

    expect(mappings).toHaveLength(1)
    expect(mappings[0].mappedBlocks).toHaveLength(0)
  })

  it('should set appropriate confidence levels', async () => {
    const questions: Question[] = [
      {
        id: '1',
        number: '1',
        title: 'Biology',
        prompt: 'Discuss cellular respiration and mitochondrial function',
        maxMarks: 10,
      },
    ]

    const highConfidenceBlocks: SubmissionBlock[] = [
      {
        id: '1',
        type: 'heading',
        content: '1.',
        order: 0,
      },
      {
        id: '2',
        type: 'paragraph',
        content: 'Cellular respiration occurs in mitochondria',
        order: 1,
      },
    ]

    const mappings = await mapper.mapSubmissionToQuestions(questions, highConfidenceBlocks)

    expect(mappings[0].confidence).toBeDefined()
    expect(['high', 'medium', 'low']).toContain(mappings[0].confidence)
  })
})
