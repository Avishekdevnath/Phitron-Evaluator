import {
  Assignment,
  EvaluationResult,
  GradingStrictness,
  QuestionResult,
} from '../../types/index'
import { QuestionMapping } from '../mapping/mappingTypes'
import { NormalizedSubmission } from '../submission/submissionTypes'

export interface EvaluationInput {
  assignment: Assignment
  submission: NormalizedSubmission
  questionMappings: QuestionMapping[]
  strictness: GradingStrictness
}

export interface EvaluationService {
  evaluate(input: EvaluationInput): Promise<EvaluationResult>
}
