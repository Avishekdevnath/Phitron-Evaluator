import { v4 as uuidv4 } from 'uuid'
import { Assignment, EvaluationResult, ProviderError } from '../../types/index'
import { OpenAIProvider } from '../providers/openaiProvider'
import { settingsService } from '../../services/settings/settingsService'
import { EvaluationInput, EvaluationService } from './evaluationTypes'

export class EvaluationEngineImpl implements EvaluationService {
  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const strictness = input.strictness || 'balanced'

    // Validate inputs
    if (!input.assignment) {
      throw new Error('Assignment is required')
    }
    if (!input.submission) {
      throw new Error('Submission is required')
    }
    if (input.assignment.questions.length === 0) {
      throw new Error('Assignment must have at least one question')
    }

    // Get provider settings
    const settings = await settingsService.getProviderSettings()
    if (!settings.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set it in Settings.')
    }

    const provider = new OpenAIProvider(settings.apiKey)

    // Test connection
    const connected = await provider.testConnection()
    if (!connected) {
      throw new ProviderError('Failed to connect to OpenAI API. Check your API key.', {})
    }

    // Evaluate each question
    const questionResults = await Promise.all(
      input.assignment.questions.map(question => {
        const mapping = input.questionMappings.find(m => m.questionId === question.id)
        if (!mapping || mapping.mappedBlocks.length === 0) {
          // No answer provided for this question
          return Promise.resolve({
            questionId: question.id,
            questionNumber: question.number,
            awardedMarks: 0,
            maxMarks: question.maxMarks,
            summary: 'No answer provided',
            strengths: [],
            mistakes: ['No submission for this question'],
            suggestions: ['Provide an answer for this question'],
            rubricAlignment: 'N/A - No answer',
            aiCopyPercentage: 0,
            confidence: 'high' as const,
            status: 'skipped' as const,
          })
        }

        // Extract content from mapped blocks
        const content = mapping.mappedBlocks
          .map(b => b.content)
          .join('\n\n')

        return provider.generateStructuredEvaluation({
          question: {
            title: question.title,
            prompt: question.prompt,
            maxMarks: question.maxMarks,
            rubricCriteria: question.rubricCriteria,
            referenceScript: question.referenceScript,
          },
          strictness,
          submission: {
            content,
            blocks: mapping.mappedBlocks,
          },
        })
      })
    )

    // Add question IDs and numbers
    const fullResults = questionResults.map((result, index) => ({
      ...result,
      questionId: input.assignment.questions[index].id,
      questionNumber: input.assignment.questions[index].number,
    }))

    // Calculate total score
    const totalScore = fullResults.reduce((sum, r) => sum + r.awardedMarks, 0)

    return {
      id: uuidv4(),
      assignmentId: input.assignment.id,
      assignmentVersion: input.assignment.version,
      submissionId: input.submission.id,
      submissionName: input.submission.name,
      strictness,
      totalScore,
      maxScore: input.assignment.totalMarks,
      generatedAt: new Date().toISOString(),
      questionResults: fullResults,
    }
  }
}

export const evaluationEngine = new EvaluationEngineImpl()
