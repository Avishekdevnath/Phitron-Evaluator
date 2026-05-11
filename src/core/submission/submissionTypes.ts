import { SubmissionBlock } from '../../types/index'

export interface SubmissionCreateInput {
  name: string
  source: 'text' | 'script'
  content: string
}

export interface NormalizedSubmission {
  id: string
  name: string
  source: 'text' | 'script'
  blocks: SubmissionBlock[]
  rawContent: string
  createdAt: string
}

export interface SubmissionNormalizer {
  normalize(input: SubmissionCreateInput): Promise<NormalizedSubmission>
}
