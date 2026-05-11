import { ValidationError } from '../types/index'

export function validateAssignmentTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('Assignment title cannot be empty')
  }
  if (title.length > 200) {
    throw new ValidationError('Assignment title cannot exceed 200 characters')
  }
}

export function validateQuestionTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('Question title cannot be empty')
  }
  if (title.length > 500) {
    throw new ValidationError('Question title cannot exceed 500 characters')
  }
}

export function validateMaxMarks(marks: number): void {
  if (typeof marks !== 'number' || marks < 0) {
    throw new ValidationError('Max marks must be a non-negative number')
  }
  if (marks > 1000) {
    throw new ValidationError('Max marks cannot exceed 1000')
  }
  if (!Number.isInteger(marks)) {
    throw new ValidationError('Max marks must be a whole number')
  }
}

export function validateOpenAIKey(key: string): void {
  if (!key || key.trim().length === 0) {
    throw new ValidationError('API key cannot be empty')
  }
  if (!key.startsWith('sk-')) {
    throw new ValidationError('Invalid OpenAI API key format. Must start with sk-')
  }
  if (key.length < 10) {
    throw new ValidationError('OpenAI API key seems too short')
  }
}

export function validateSubmissionContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('Submission cannot be empty')
  }
}
