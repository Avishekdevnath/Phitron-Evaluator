import { Question, SubmissionBlock } from '../../types/index'

export interface QuestionMapping {
  questionId: string
  questionNumber: string
  mappedBlocks: SubmissionBlock[]
  confidence: 'high' | 'medium' | 'low'
  strategy: 'explicit' | 'keyword' | 'proximity'
}

export interface AnswerMapper {
  mapSubmissionToQuestions(
    questions: Question[],
    blocks: SubmissionBlock[]
  ): Promise<QuestionMapping[]>
}
