import { describe, it, expect } from 'vitest'
import { SubmissionNormalizerImpl } from './submissionNormalizer'

describe('SubmissionNormalizer', () => {
  const normalizer = new SubmissionNormalizerImpl()

  it('should normalize text content with paragraphs', async () => {
    const input = {
      name: 'Student Answer 1',
      source: 'text' as const,
      content: 'This is the first paragraph.\n\nThis is the second paragraph.',
    }

    const result = await normalizer.normalize(input)

    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.blocks[0].type).toBe('paragraph')
    expect(result.rawContent).toBe(input.content)
  })

  it('should detect headings in text', async () => {
    const input = {
      name: 'Answer with heading',
      source: 'text' as const,
      content: '# Question 1\n\nThis is my answer.',
    }

    const result = await normalizer.normalize(input)

    const headingBlock = result.blocks.find(b => b.type === 'heading')
    expect(headingBlock).toBeDefined()
    expect(headingBlock?.content).toBe('Question 1')
  })

  it('should normalize script content as code block', async () => {
    const scriptContent = 'function hello() {\n  console.log("Hello");\n}'
    const input = {
      name: 'Script submission',
      source: 'script' as const,
      content: scriptContent,
    }

    const result = await normalizer.normalize(input)

    expect(result.blocks.length).toBe(1)
    expect(result.blocks[0].type).toBe('code')
    expect(result.blocks[0].content).toBe(scriptContent)
  })

  it('should set correct block order', async () => {
    const input = {
      name: 'Ordered blocks',
      source: 'text' as const,
      content: 'First\n\nSecond\n\nThird',
    }

    const result = await normalizer.normalize(input)

    result.blocks.forEach((block, index) => {
      expect(block.order).toBe(index)
    })
  })

  it('should create single block for simple text', async () => {
    const input = {
      name: 'Simple answer',
      source: 'text' as const,
      content: 'Just a simple answer',
    }

    const result = await normalizer.normalize(input)

    expect(result.blocks.length).toBeGreaterThan(0)
    expect(result.blocks[0].content).toContain('simple')
  })

  it('should throw on empty content', async () => {
    const input = {
      name: 'Empty',
      source: 'text' as const,
      content: '',
    }

    await expect(normalizer.normalize(input)).rejects.toThrow()
  })

  it('should handle multiline paragraphs', async () => {
    const input = {
      name: 'Multiline answer',
      source: 'text' as const,
      content: 'Line 1\nLine 2\nLine 3\n\nNew paragraph',
    }

    const result = await normalizer.normalize(input)

    expect(result.blocks.length).toBeGreaterThan(1)
  })
})
