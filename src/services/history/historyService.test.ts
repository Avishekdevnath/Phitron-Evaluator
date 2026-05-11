import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HistoryServiceImpl } from './historyService'
import { storageService } from '../storage/storageService'
import { EvaluationResult } from '../../types/index'

vi.mock('../storage/storageService')

describe('HistoryService', () => {
  let service: HistoryServiceImpl

  beforeEach(() => {
    service = new HistoryServiceImpl()
    vi.clearAllMocks()
  })

  it('should get all evaluations', async () => {
    const mockEvals: EvaluationResult[] = [
      {
        id: '1',
        assignmentId: 'a1',
        assignmentVersion: 1,
        submissionId: 's1',
        submissionName: 'Student 1',
        strictness: 'balanced',
        totalScore: 80,
        maxScore: 100,
        generatedAt: new Date().toISOString(),
        questionResults: [],
      },
    ]

    vi.mocked(storageService.getEvaluations).mockResolvedValue(mockEvals)

    const all = await service.getAll()

    expect(all.length).toBe(1)
    expect(all[0].id).toBe('1')
  })

  it('should get evaluations by assignment', async () => {
    const mockEvals: EvaluationResult[] = [
      {
        id: '1',
        assignmentId: 'a1',
        assignmentVersion: 1,
        submissionId: 's1',
        submissionName: 'S1',
        strictness: 'balanced',
        totalScore: 80,
        maxScore: 100,
        generatedAt: new Date().toISOString(),
        questionResults: [],
      },
      {
        id: '2',
        assignmentId: 'a2',
        assignmentVersion: 1,
        submissionId: 's2',
        submissionName: 'S2',
        strictness: 'balanced',
        totalScore: 90,
        maxScore: 100,
        generatedAt: new Date().toISOString(),
        questionResults: [],
      },
    ]

    vi.mocked(storageService.getEvaluations).mockResolvedValue(mockEvals)

    const byAssignment = await service.getByAssignment('a1')

    expect(byAssignment.length).toBe(1)
    expect(byAssignment[0].assignmentId).toBe('a1')
  })

  it('should delete evaluation', async () => {
    vi.mocked(storageService.deleteEvaluation).mockResolvedValue(undefined)

    await service.delete('1')

    expect(vi.mocked(storageService.deleteEvaluation)).toHaveBeenCalledWith('1')
  })

  it('should save evaluation', async () => {
    const evaluation: EvaluationResult = {
      id: 'eval-1',
      assignmentId: 'a1',
      assignmentVersion: 2,
      submissionId: 's1',
      submissionName: 'Student X',
      strictness: 'balanced',
      totalScore: 45,
      maxScore: 50,
      generatedAt: new Date().toISOString(),
      questionResults: [],
    }

    vi.mocked(storageService.saveEvaluation).mockResolvedValue(undefined)

    await service.save(evaluation)

    expect(vi.mocked(storageService.saveEvaluation)).toHaveBeenCalledWith(evaluation)
  })

  it('should delete all evaluations by assignment', async () => {
    const mockEvals: EvaluationResult[] = [
      {
        id: '1',
        assignmentId: 'a1',
        assignmentVersion: 1,
        submissionId: 's1',
        submissionName: 'S1',
        strictness: 'balanced',
        totalScore: 80,
        maxScore: 100,
        generatedAt: new Date().toISOString(),
        questionResults: [],
      },
      {
        id: '2',
        assignmentId: 'a1',
        assignmentVersion: 1,
        submissionId: 's2',
        submissionName: 'S2',
        strictness: 'balanced',
        totalScore: 90,
        maxScore: 100,
        generatedAt: new Date().toISOString(),
        questionResults: [],
      },
    ]

    vi.mocked(storageService.getEvaluations)
      .mockResolvedValue(mockEvals)
      .mockResolvedValueOnce(mockEvals) // First call for getByAssignment
      .mockResolvedValueOnce([]) // Subsequent calls return empty

    vi.mocked(storageService.deleteEvaluation).mockResolvedValue(undefined)

    await service.deleteByAssignment('a1')

    expect(vi.mocked(storageService.deleteEvaluation)).toHaveBeenCalledTimes(2)
  })
})
