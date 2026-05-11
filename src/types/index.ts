// Assignment Types
export interface Assignment {
  id: string
  title: string
  course?: string
  type?: string
  totalMarks: number
  version: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  questions: Question[]
}

export interface Question {
  id: string
  number: string
  title: string
  prompt: string
  maxMarks: number
  answerType?: 'theory' | 'code' | 'mixed' | 'math' | 'diagram'
  rubricCriteria?: string[]
  referenceScript?: string
  notes?: string
}

// Submission Types
export interface Submission {
  id: string
  name: string
  source: 'text' | 'script' | 'colab' | 'docs'
  blocks: SubmissionBlock[]
  rawContent: string
  uploadedAt: string
}

export interface SubmissionBlock {
  id: string
  type: 'heading' | 'paragraph' | 'code' | 'markdown' | 'output'
  content: string
  order: number
  sourceMeta?: Record<string, string>
}

// Evaluation Types
export type GradingStrictness = 'lenient' | 'balanced' | 'strict'

export interface ModalQuestion {
  number: string
  maxMarks: number
  prompt?: string
}

export interface SubmissionInfo {
  studentName: string
  assignmentName: string
  submissionDate?: string
  colabLink?: string
  email?: string
  notes?: string
  totalMarks?: number
  questionsFromModal?: ModalQuestion[]
}

export interface EvaluationResult {
  id: string
  assignmentId: string
  assignmentVersion: number
  submissionId: string
  submissionName: string
  strictness: GradingStrictness
  totalScore: number
  maxScore: number
  generatedAt: string
  questionResults: QuestionResult[]
  submissionInfo?: SubmissionInfo
}

export interface QuestionResult {
  questionId: string
  questionNumber: string
  awardedMarks: number
  maxMarks: number
  summary: string
  strengths: string[]
  mistakes: string[]
  suggestions: string[]
  rubricAlignment: string
  aiCopyPercentage: number
  confidence: 'high' | 'medium' | 'low'
  status: 'complete' | 'partial' | 'skipped'
}

// Evaluator Settings
export interface EvaluatorSettings {
  strictness: GradingStrictness
  detectAI: boolean
  feedbackFormat: 'html' | 'plaintext'
}

// Provider Types
export interface ProviderSettings {
  mode: 'default' | 'custom'
  provider: 'openai'
  apiKey?: string
  model?: string
  evaluatorSettings?: EvaluatorSettings
}

// Mapping Types
export interface QuestionMapping {
  questionId: string
  mappedBlocks: SubmissionBlock[]
  confidence: number
  strategy: 'explicit' | 'keyword' | 'proximity' | 'ai_fallback'
}

// Error Types
export interface AppError extends Error {
  code: string
  details?: Record<string, any>
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR'
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class StorageError extends Error implements AppError {
  code = 'STORAGE_ERROR'
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
    this.name = 'StorageError'
    Object.setPrototypeOf(this, StorageError.prototype)
  }
}

export class ProviderError extends Error implements AppError {
  code = 'PROVIDER_ERROR'
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
    this.name = 'ProviderError'
    Object.setPrototypeOf(this, ProviderError.prototype)
  }
}
