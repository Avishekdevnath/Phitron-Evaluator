import { Question, SubmissionBlock } from '../../types/index'
import { QuestionMapping, AnswerMapper } from './mappingTypes'

export class AnswerMapperImpl implements AnswerMapper {
  async mapSubmissionToQuestions(
    questions: Question[],
    blocks: SubmissionBlock[]
  ): Promise<QuestionMapping[]> {
    const mappings: QuestionMapping[] = []

    for (const question of questions) {
      const mapping = this.mapQuestion(question, blocks)
      mappings.push(mapping)
    }

    return mappings
  }

  private mapQuestion(question: Question, blocks: SubmissionBlock[]): QuestionMapping {
    // Strategy 1: Look for explicit question number/title match
    const explicitMatch = this.findExplicitMatch(question, blocks)
    if (explicitMatch.length > 0) {
      return {
        questionId: question.id,
        questionNumber: question.number,
        mappedBlocks: explicitMatch,
        confidence: 'high',
        strategy: 'explicit',
      }
    }

    // Strategy 2: Keyword-based matching
    const keywordMatch = this.findKeywordMatch(question, blocks)
    if (keywordMatch.blocks.length > 0) {
      return {
        questionId: question.id,
        questionNumber: question.number,
        mappedBlocks: keywordMatch.blocks,
        confidence: keywordMatch.confidence,
        strategy: 'keyword',
      }
    }

    // Strategy 3: Proximity-based matching (sequential assignment)
    const proximityMatch = this.findProximityMatch(question, blocks)
    return {
      questionId: question.id,
      questionNumber: question.number,
      mappedBlocks: proximityMatch,
      confidence: 'low',
      strategy: 'proximity',
    }
  }

  private findExplicitMatch(question: Question, blocks: SubmissionBlock[]): SubmissionBlock[] {
    const result: SubmissionBlock[] = []
    const qNum = question.number.toLowerCase().trim()

    for (const block of blocks) {
      const content = block.content.toLowerCase().trim()

      // Only match on headings - explicit match must be in a heading
      if (block.type !== 'heading') continue

      // Check if heading starts with question number
      if (content.startsWith(qNum) || content.includes(`question ${qNum}`)) {
        // Collect this heading and following paragraphs until next heading
        result.push(block)
        const blockIndex = blocks.indexOf(block)
        for (let i = blockIndex + 1; i < blocks.length; i++) {
          if (blocks[i].type === 'heading') break
          result.push(blocks[i])
        }
        break
      }
    }

    return result
  }

  private findKeywordMatch(
    question: Question,
    blocks: SubmissionBlock[]
  ): { blocks: SubmissionBlock[]; confidence: 'medium' | 'low' } {
    const keywords = this.extractKeywords(question.prompt)
    if (keywords.length === 0) {
      return { blocks: [], confidence: 'low' }
    }

    const result: SubmissionBlock[] = []
    let matchScore = 0

    for (const block of blocks) {
      let score = 0
      const content = block.content.toLowerCase()

      for (const keyword of keywords) {
        if (content.includes(keyword.toLowerCase())) {
          score += 1
        }
      }

      // Require at least 50% of keywords to match for a meaningful match
      if (score / keywords.length >= 0.5) {
        result.push(block)
        matchScore += score
      }
    }

    return {
      blocks: result,
      confidence: matchScore > keywords.length * 0.5 ? 'medium' : 'low',
    }
  }

  private findProximityMatch(question: Question, blocks: SubmissionBlock[]): SubmissionBlock[] {
    // Sequential strategy: assign blocks in order to questions
    // This is a fallback when explicit or keyword matching fails
    if (blocks.length === 0) return []

    // Try to split blocks roughly evenly among questions
    // For simplicity, just return first 2-3 blocks as a baseline
    return blocks.slice(0, Math.max(1, Math.ceil(blocks.length / 3)))
  }

  private extractKeywords(text: string): string[] {
    // Extract meaningful keywords from the question prompt
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
    ])

    const words = text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !stopWords.has(word))

    // Return top 5 keywords
    return [...new Set(words)].slice(0, 5)
  }
}

export const answerMapper = new AnswerMapperImpl()
