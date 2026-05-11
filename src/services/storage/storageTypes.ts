import {
  Assignment,
  EvaluationResult,
  ProviderSettings
} from '../../types/index'

export interface StorageData {
  assignments: Assignment[]
  activeAssignmentId: string | null
  evaluations: EvaluationResult[]
  providerSettings: ProviderSettings
}

export interface StorageService {
  initialize(): Promise<void>
  getAll(): Promise<StorageData>

  // Assignments
  getAssignments(): Promise<Assignment[]>
  getAssignment(id: string): Promise<Assignment | null>
  saveAssignment(assignment: Assignment): Promise<void>
  deleteAssignment(id: string): Promise<void>

  // Active Assignment
  getActiveAssignment(): Promise<Assignment | null>
  setActiveAssignment(id: string | null): Promise<void>

  // Evaluations
  getEvaluations(): Promise<EvaluationResult[]>
  saveEvaluation(result: EvaluationResult): Promise<void>
  deleteEvaluation(id: string): Promise<void>

  // Provider Settings
  getProviderSettings(): Promise<ProviderSettings>
  saveProviderSettings(settings: ProviderSettings): Promise<void>

  // Cleanup
  clearAll(): Promise<void>
}
