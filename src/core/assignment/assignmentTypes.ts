import { Assignment, Question } from '../../types/index'

export interface AssignmentCreateInput {
  title: string
  course?: string
  type?: string
  questions?: Question[]
}

export interface AssignmentUpdateInput {
  title?: string
  course?: string
  type?: string
}

export interface AssignmentService {
  create(input: AssignmentCreateInput): Promise<Assignment>
  getAll(): Promise<Assignment[]>
  getById(id: string): Promise<Assignment | null>
  update(id: string, input: AssignmentUpdateInput): Promise<Assignment>
  delete(id: string): Promise<void>
  duplicate(id: string, newTitle: string): Promise<Assignment>
  setActive(id: string | null): Promise<void>
  getActive(): Promise<Assignment | null>
  addQuestion(assignmentId: string, question: Question): Promise<Assignment>
  updateQuestion(assignmentId: string, questionId: string, updates: Partial<Question>): Promise<Assignment>
  deleteQuestion(assignmentId: string, questionId: string): Promise<Assignment>
  reorderQuestions(assignmentId: string, questionIds: string[]): Promise<Assignment>
}
