import { v4 as uuidv4 } from 'uuid'
import { SubmissionBlock, ValidationError } from '../../types/index'
import { SubmissionCreateInput, NormalizedSubmission, SubmissionNormalizer } from './submissionTypes'
import { validateSubmissionContent } from '../../utils/validation'

export class SubmissionNormalizerImpl implements SubmissionNormalizer {
  async normalize(input: SubmissionCreateInput): Promise<NormalizedSubmission> {
    validateSubmissionContent(input.content)

    const blocks = this.parseContent(input.content, input.source)

    return {
      id: uuidv4(),
      name: input.name,
      source: input.source,
      blocks,
      rawContent: input.content,
      createdAt: new Date().toISOString(),
    }
  }

  private parseContent(content: string, source: 'text' | 'script'): SubmissionBlock[] {
    if (source === 'script') {
      return this.parseScriptContent(content)
    }
    return this.parseTextContent(content)
  }

  private parseTextContent(content: string): SubmissionBlock[] {
    const lines = content.split('\n')
    const blocks: SubmissionBlock[] = []
    let currentParagraph = ''
    let blockOrder = 0

    for (const line of lines) {
      const trimmed = line.trim()

      // Detect headings (lines that start with #)
      if (trimmed.startsWith('#')) {
        if (currentParagraph.trim()) {
          blocks.push({
            id: uuidv4(),
            type: 'paragraph',
            content: currentParagraph.trim(),
            order: blockOrder++,
          })
          currentParagraph = ''
        }

        blocks.push({
          id: uuidv4(),
          type: 'heading',
          content: trimmed.replace(/^#+\s*/, ''),
          order: blockOrder++,
        })
      }
      // Detect code blocks (lines between ``` markers)
      else if (trimmed.startsWith('```')) {
        if (currentParagraph.trim()) {
          blocks.push({
            id: uuidv4(),
            type: 'paragraph',
            content: currentParagraph.trim(),
            order: blockOrder++,
          })
          currentParagraph = ''
        }
      }
      // Detect blank lines (paragraph breaks)
      else if (!trimmed) {
        if (currentParagraph.trim()) {
          blocks.push({
            id: uuidv4(),
            type: 'paragraph',
            content: currentParagraph.trim(),
            order: blockOrder++,
          })
          currentParagraph = ''
        }
      }
      // Regular content
      else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmed
      }
    }

    // Add any remaining paragraph
    if (currentParagraph.trim()) {
      blocks.push({
        id: uuidv4(),
        type: 'paragraph',
        content: currentParagraph.trim(),
        order: blockOrder++,
      })
    }

    // If no blocks were created, create a single paragraph block
    if (blocks.length === 0) {
      blocks.push({
        id: uuidv4(),
        type: 'paragraph',
        content: content.trim(),
        order: 0,
      })
    }

    return blocks
  }

  private parseScriptContent(content: string): SubmissionBlock[] {
    // For scripts, treat the entire content as a code block
    const blocks: SubmissionBlock[] = [
      {
        id: uuidv4(),
        type: 'code',
        content: content,
        order: 0,
      },
    ]

    return blocks
  }
}

export const submissionNormalizer = new SubmissionNormalizerImpl()
