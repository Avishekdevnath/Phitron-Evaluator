// Global service initialization and exports
// This module is imported by app entry points to ensure services are initialized

export { storageService } from './services/storage/storageService'
export type { StorageService } from './services/storage/storageTypes'

export { assignmentService } from './core/assignment/assignmentService'
export type { AssignmentService } from './core/assignment/assignmentTypes'

export { historyService } from './services/history/historyService'
export type { HistoryService } from './services/history/historyService'

export { settingsService } from './services/settings/settingsService'
export type { SettingsService } from './services/settings/settingsService'

export { OpenAIProvider } from './core/providers/openaiProvider'
export type { AIProvider } from './core/providers/providerInterface'

export { submissionNormalizer } from './core/submission/submissionNormalizer'
export type { SubmissionNormalizer, NormalizedSubmission } from './core/submission/submissionTypes'

export { answerMapper } from './core/mapping/answerMapper'
export type { AnswerMapper, QuestionMapping } from './core/mapping/mappingTypes'

export { evaluationEngine } from './core/evaluation/evaluationEngine'
export type { EvaluationService } from './core/evaluation/evaluationTypes'

export { questionParser } from './core/parsing/questionParser'
export type { QuestionParserService } from './core/parsing/questionParser'

// Type exports
export * from './types/index'

// Validation exports
export * from './utils/validation'

// Initialize storage service on import
import { storageService } from './services/storage/storageService'

storageService.initialize().catch(err => {
  console.error('[Phitron] Failed to initialize storage service:', err)
})

console.log('[Phitron] Extension initialized')
