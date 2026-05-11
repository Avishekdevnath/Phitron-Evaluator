import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChromeStorageService } from './storageService'
import { Assignment, StorageError } from '../../types/index'

describe('ChromeStorageService', () => {
  let service: ChromeStorageService

  beforeEach(() => {
    service = new ChromeStorageService()
    vi.clearAllMocks()
  })

  it('should initialize with default data', async () => {
    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    } as any

    await service.initialize()
    const data = await service.getAll()

    expect(data.assignments).toEqual([])
    expect(data.activeAssignmentId).toBe(null)
    expect(data.evaluations).toEqual([])
  })

  it('should save and retrieve assignment', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test Assignment',
      totalMarks: 100,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    }

    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    } as any

    await service.initialize()
    await service.saveAssignment(mockAssignment)

    const retrieved = await service.getAssignment('1')
    expect(retrieved).toEqual(mockAssignment)
  })

  it('should throw StorageError on initialization failure', async () => {
    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockRejectedValue(new Error('Storage failed')),
          set: vi.fn(),
        },
      },
    } as any

    await expect(service.initialize()).rejects.toThrow(StorageError)
  })

  it('should set and get active assignment', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 100,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    }

    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    } as any

    await service.initialize()
    await service.saveAssignment(mockAssignment)
    await service.setActiveAssignment('1')

    const active = await service.getActiveAssignment()
    expect(active?.id).toBe('1')
  })

  it('should delete assignment', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 100,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    }

    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    } as any

    await service.initialize()
    await service.saveAssignment(mockAssignment)
    await service.deleteAssignment('1')

    const retrieved = await service.getAssignment('1')
    expect(retrieved).toBeNull()
  })
})
