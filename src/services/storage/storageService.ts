import {
  Assignment,
  EvaluationResult,
  ProviderSettings,
  StorageError
} from '../../types/index'
import {
  StorageData,
  StorageService
} from './storageTypes'

const STORAGE_KEY = 'phitron_data'

const DEFAULT_STORAGE: StorageData = {
  assignments: [],
  activeAssignmentId: null,
  evaluations: [],
  providerSettings: {
    mode: 'custom',
    provider: 'openai',
  },
}

export class ChromeStorageService implements StorageService {
  private cache: StorageData | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY)
      this.cache = data[STORAGE_KEY] || DEFAULT_STORAGE
      this.initialized = true
    } catch (error) {
      throw new StorageError(
        'Failed to initialize storage',
        { originalError: error }
      )
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  private async persist(): Promise<void> {
    if (!this.cache) return
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: this.cache })
    } catch (error) {
      throw new StorageError('Failed to persist data', { originalError: error })
    }
  }

  async getAll(): Promise<StorageData> {
    await this.ensureInitialized()
    return JSON.parse(JSON.stringify(this.cache!))
  }

  async getAssignments(): Promise<Assignment[]> {
    const data = await this.getAll()
    return data.assignments
  }

  async getAssignment(id: string): Promise<Assignment | null> {
    const assignments = await this.getAssignments()
    return assignments.find(a => a.id === id) || null
  }

  async saveAssignment(assignment: Assignment): Promise<void> {
    await this.ensureInitialized()
    const index = this.cache!.assignments.findIndex(a => a.id === assignment.id)
    if (index >= 0) {
      this.cache!.assignments[index] = assignment
    } else {
      this.cache!.assignments.push(assignment)
    }
    await this.persist()
  }

  async deleteAssignment(id: string): Promise<void> {
    await this.ensureInitialized()
    this.cache!.assignments = this.cache!.assignments.filter(a => a.id !== id)
    if (this.cache!.activeAssignmentId === id) {
      this.cache!.activeAssignmentId = null
    }
    await this.persist()
  }

  async getActiveAssignment(): Promise<Assignment | null> {
    const data = await this.getAll()
    if (!data.activeAssignmentId) return null
    return this.getAssignment(data.activeAssignmentId)
  }

  async setActiveAssignment(id: string | null): Promise<void> {
    await this.ensureInitialized()
    if (id && !(await this.getAssignment(id))) {
      throw new StorageError('Assignment not found', { id })
    }
    this.cache!.activeAssignmentId = id
    await this.persist()
  }

  async getEvaluations(): Promise<EvaluationResult[]> {
    const data = await this.getAll()
    return data.evaluations
  }

  async saveEvaluation(result: EvaluationResult): Promise<void> {
    await this.ensureInitialized()
    const index = this.cache!.evaluations.findIndex(e => e.id === result.id)
    if (index >= 0) {
      this.cache!.evaluations[index] = result
    } else {
      this.cache!.evaluations.push(result)
    }
    await this.persist()
  }

  async deleteEvaluation(id: string): Promise<void> {
    await this.ensureInitialized()
    this.cache!.evaluations = this.cache!.evaluations.filter(e => e.id !== id)
    await this.persist()
  }

  async getProviderSettings(): Promise<ProviderSettings> {
    const data = await this.getAll()
    return { ...data.providerSettings }
  }

  async saveProviderSettings(settings: ProviderSettings): Promise<void> {
    await this.ensureInitialized()
    this.cache!.providerSettings = settings
    await this.persist()
  }

  async clearAll(): Promise<void> {
    this.cache = JSON.parse(JSON.stringify(DEFAULT_STORAGE))
    await this.persist()
  }
}

export const storageService = new ChromeStorageService()
