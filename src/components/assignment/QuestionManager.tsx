import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Assignment, Question } from '../../types/index'
import { assignmentService } from '../../core/assignment/assignmentService'
import QuestionList from './QuestionList'
import QuestionForm from './QuestionForm'
import Button from '../shared/Button'
import Alert from '../shared/Alert'

interface QuestionManagerProps {
  assignment: Assignment
  onUpdate: (assignment: Assignment) => void
}

export default function QuestionManager({ assignment, onUpdate }: QuestionManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAddQuestion(data: Partial<Question>) {
    try {
      setLoading(true)
      setError(null)
      const question: Question = {
        id: uuidv4(),
        number: String(assignment.questions.length + 1),
        title: data.title || '',
        prompt: data.prompt || '',
        maxMarks: data.maxMarks || 0,
        answerType: data.answerType,
      }
      const updated = await assignmentService.addQuestion(assignment.id, question)
      onUpdate(updated)
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateQuestion(data: Partial<Question>) {
    if (!editingQuestion) return
    try {
      setLoading(true)
      setError(null)
      const updated = await assignmentService.updateQuestion(
        assignment.id,
        editingQuestion.id,
        data
      )
      onUpdate(updated)
      setEditingQuestion(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('Delete this question? This cannot be undone.')) return
    try {
      setLoading(true)
      setError(null)
      const updated = await assignmentService.deleteQuestion(assignment.id, questionId)
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    } finally {
      setLoading(false)
    }
  }

  async function handleReorder(questionIds: string[]) {
    try {
      setError(null)
      const updated = await assignmentService.reorderQuestions(assignment.id, questionIds)
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder questions')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Questions ({assignment.questions.length})</h3>
        {!showForm && !editingQuestion && (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            disabled={loading}
          >
            + Add Question
          </Button>
        )}
      </div>

      {showForm && (
        <QuestionForm
          onSubmit={handleAddQuestion}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingQuestion && (
        <QuestionForm
          question={editingQuestion}
          onSubmit={handleUpdateQuestion}
          onCancel={() => setEditingQuestion(undefined)}
        />
      )}

      <QuestionList
        questions={assignment.questions}
        onEdit={setEditingQuestion}
        onDelete={handleDeleteQuestion}
        onReorder={handleReorder}
      />
    </div>
  )
}
