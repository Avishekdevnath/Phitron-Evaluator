import { EvaluationResult } from '../../types/index'
import { storageService } from '../storage/storageService'

export interface HistoryService {
  getAll(): Promise<EvaluationResult[]>
  getByAssignment(assignmentId: string): Promise<EvaluationResult[]>
  getById(id: string): Promise<EvaluationResult | null>
  save(result: EvaluationResult): Promise<void>
  delete(id: string): Promise<void>
  deleteByAssignment(assignmentId: string): Promise<void>
}

export class HistoryServiceImpl implements HistoryService {
  async getAll(): Promise<EvaluationResult[]> {
    return storageService.getEvaluations()
  }

  async getByAssignment(assignmentId: string): Promise<EvaluationResult[]> {
    const all = await this.getAll()
    return all.filter(e => e.assignmentId === assignmentId)
  }

  async getById(id: string): Promise<EvaluationResult | null> {
    const all = await this.getAll()
    return all.find(e => e.id === id) || null
  }

  async save(result: EvaluationResult): Promise<void> {
    await storageService.saveEvaluation(result)
  }

  async delete(id: string): Promise<void> {
    await storageService.deleteEvaluation(id)
  }

  async deleteByAssignment(assignmentId: string): Promise<void> {
    const evaluations = await this.getByAssignment(assignmentId)
    for (const evaluation of evaluations) {
      await this.delete(evaluation.id)
    }
  }
}

export const historyService = new HistoryServiceImpl()
