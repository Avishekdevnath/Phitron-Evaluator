import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AssignmentServiceImpl } from './assignmentService'
import { storageService } from '../../services/storage/storageService'
import { Assignment, Question } from '../../types/index'

vi.mock('../../services/storage/storageService')

describe('AssignmentService', () => {
  let service: AssignmentServiceImpl

  beforeEach(() => {
    service = new AssignmentServiceImpl()
    vi.clearAllMocks()
  })

  it('should create assignment with questions', async () => {
    const input = {
      title: 'Midterm Exam',
      course: 'CS101',
      questions: [
        {
          id: '1',
          number: '1',
          title: 'Question 1',
          prompt: 'What is 2+2?',
          maxMarks: 5,
          answerType: 'theory' as const,
        },
      ],
    }

    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const assignment = await service.create(input)

    expect(assignment.title).toBe('Midterm Exam')
    expect(assignment.totalMarks).toBe(5)
    expect(assignment.questions.length).toBe(1)
    expect(vi.mocked(storageService.saveAssignment)).toHaveBeenCalled()
  })

  it('should throw on empty title', async () => {
    await expect(service.create({ title: '' })).rejects.toThrow()
  })

  it('should add question to assignment', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 10,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    }

    const newQuestion: Question = {
      id: '2',
      number: '1',
      title: 'Q1',
      prompt: 'Test',
      maxMarks: 5,
    }

    vi.mocked(storageService.getAssignment).mockResolvedValue(mockAssignment)
    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const updated = await service.addQuestion('1', newQuestion)

    expect(updated.questions.length).toBe(1)
    expect(updated.totalMarks).toBe(15)
  })

  it('should update question marks', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 10,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: '2',
          number: '1',
          title: 'Q1',
          prompt: 'Test',
          maxMarks: 10,
        },
      ],
    }

    vi.mocked(storageService.getAssignment).mockResolvedValue(mockAssignment)
    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const updated = await service.updateQuestion('1', '2', { maxMarks: 20 })

    expect(updated.questions[0].maxMarks).toBe(20)
    expect(updated.totalMarks).toBe(20)
  })

  it('should delete question', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 10,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: '2',
          number: '1',
          title: 'Q1',
          prompt: 'Test',
          maxMarks: 10,
        },
      ],
    }

    vi.mocked(storageService.getAssignment).mockResolvedValue(mockAssignment)
    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const updated = await service.deleteQuestion('1', '2')

    expect(updated.questions.length).toBe(0)
    expect(updated.totalMarks).toBe(0)
  })

  it('should duplicate assignment', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Original',
      course: 'CS101',
      totalMarks: 100,
      version: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: '2',
          number: '1',
          title: 'Q1',
          prompt: 'Test',
          maxMarks: 100,
        },
      ],
    }

    vi.mocked(storageService.getAssignment).mockResolvedValue(mockAssignment)
    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const duplicated = await service.duplicate('1', 'Duplicate')

    expect(duplicated.id).not.toBe('1')
    expect(duplicated.title).toBe('Duplicate')
    expect(duplicated.isActive).toBe(false)
    expect(duplicated.questions[0].id).not.toBe('2')
  })

  it('should reorder questions', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 20,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        { id: '1', number: '1', title: 'Q1', prompt: 'P1', maxMarks: 10 },
        { id: '2', number: '2', title: 'Q2', prompt: 'P2', maxMarks: 10 },
      ],
    }

    vi.mocked(storageService.getAssignment).mockResolvedValue(mockAssignment)
    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const updated = await service.reorderQuestions('1', ['2', '1'])

    expect(updated.questions[0].id).toBe('2')
    expect(updated.questions[1].id).toBe('1')
  })
})
