import { v4 as uuidv4 } from 'uuid'
import { Assignment, Question, ValidationError } from '../../types/index'
import { storageService } from '../../services/storage/storageService'
import { validateAssignmentTitle, validateMaxMarks } from '../../utils/validation'
import { AssignmentCreateInput, AssignmentUpdateInput, AssignmentService } from './assignmentTypes'

export class AssignmentServiceImpl implements AssignmentService {
  async create(input: AssignmentCreateInput): Promise<Assignment> {
    validateAssignmentTitle(input.title)

    const assignment: Assignment = {
      id: uuidv4(),
      title: input.title,
      course: input.course,
      type: input.type,
      totalMarks: input.questions?.reduce((sum, q) => sum + q.maxMarks, 0) || 0,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: input.questions || [],
    }

    await storageService.saveAssignment(assignment)
    return assignment
  }

  async getAll(): Promise<Assignment[]> {
    return storageService.getAssignments()
  }

  async getById(id: string): Promise<Assignment | null> {
    return storageService.getAssignment(id)
  }

  async update(id: string, input: AssignmentUpdateInput): Promise<Assignment> {
    const assignment = await this.getById(id)
    if (!assignment) {
      throw new Error(`Assignment ${id} not found`)
    }

    if (input.title) {
      validateAssignmentTitle(input.title)
      assignment.title = input.title
    }
    if (input.course !== undefined) assignment.course = input.course
    if (input.type !== undefined) assignment.type = input.type

    assignment.updatedAt = new Date().toISOString()
    await storageService.saveAssignment(assignment)
    return assignment
  }

  async delete(id: string): Promise<void> {
    await storageService.deleteAssignment(id)
  }

  async duplicate(id: string, newTitle: string): Promise<Assignment> {
    const original = await this.getById(id)
    if (!original) {
      throw new Error(`Assignment ${id} not found`)
    }

    validateAssignmentTitle(newTitle)

    const duplicated: Assignment = {
      ...original,
      id: uuidv4(),
      title: newTitle,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: original.questions.map(q => ({
        ...q,
        id: uuidv4(),
      })),
    }

    await storageService.saveAssignment(duplicated)
    return duplicated
  }

  async setActive(id: string | null): Promise<void> {
    if (id && !(await this.getById(id))) {
      throw new Error(`Assignment ${id} not found`)
    }
    await storageService.setActiveAssignment(id)
  }

  async getActive(): Promise<Assignment | null> {
    return storageService.getActiveAssignment()
  }

  async addQuestion(assignmentId: string, question: Question): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    validateMaxMarks(question.maxMarks)

    const newQuestion: Question = {
      ...question,
      id: question.id || uuidv4(),
    }

    assignment.questions.push(newQuestion)
    assignment.totalMarks += newQuestion.maxMarks
    assignment.updatedAt = new Date().toISOString()

    await storageService.saveAssignment(assignment)
    return assignment
  }

  async updateQuestion(
    assignmentId: string,
    questionId: string,
    updates: Partial<Question>
  ): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    const questionIndex = assignment.questions.findIndex(q => q.id === questionId)
    if (questionIndex < 0) {
      throw new Error(`Question ${questionId} not found`)
    }

    const oldMarks = assignment.questions[questionIndex].maxMarks
    const newMarks = updates.maxMarks ?? oldMarks

    if (newMarks !== oldMarks) {
      validateMaxMarks(newMarks)
      assignment.totalMarks = assignment.totalMarks - oldMarks + newMarks
    }

    assignment.questions[questionIndex] = {
      ...assignment.questions[questionIndex],
      ...updates,
      id: questionId, // Prevent ID change
    }

    assignment.updatedAt = new Date().toISOString()
    await storageService.saveAssignment(assignment)
    return assignment
  }

  async deleteQuestion(assignmentId: string, questionId: string): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    const question = assignment.questions.find(q => q.id === questionId)
    if (!question) {
      throw new Error(`Question ${questionId} not found`)
    }

    assignment.questions = assignment.questions.filter(q => q.id !== questionId)
    assignment.totalMarks -= question.maxMarks
    assignment.updatedAt = new Date().toISOString()

    await storageService.saveAssignment(assignment)
    return assignment
  }

  async reorderQuestions(assignmentId: string, questionIds: string[]): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    if (questionIds.length !== assignment.questions.length) {
      throw new ValidationError('Question count mismatch')
    }

    const questionMap = new Map(assignment.questions.map(q => [q.id, q]))
    assignment.questions = questionIds
      .map(id => questionMap.get(id))
      .filter((q): q is Question => q !== undefined)

    assignment.updatedAt = new Date().toISOString()
    await storageService.saveAssignment(assignment)
    return assignment
  }
}

export const assignmentService = new AssignmentServiceImpl()
