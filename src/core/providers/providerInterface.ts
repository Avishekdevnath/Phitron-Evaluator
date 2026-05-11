import {
  GradingStrictness,
  Question,
  QuestionResult,
  SubmissionBlock,
} from '../../types/index'

export interface EvaluationPromptInput {
  question: {
    title: string
    prompt: string
    maxMarks: number
    rubricCriteria?: string[]
    referenceScript?: string
  }
  strictness: GradingStrictness
  submission: {
    content: string
    blocks: SubmissionBlock[]
  }
}

export interface AIProvider {
  testConnection(): Promise<boolean>
  generateStructuredEvaluation(input: EvaluationPromptInput): Promise<QuestionResult>
}
