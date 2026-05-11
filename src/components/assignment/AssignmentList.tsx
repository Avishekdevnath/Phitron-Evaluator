import React, { useState, useEffect } from 'react'
import { Assignment } from '../../types/index'
import { assignmentService } from '../../core/assignment/assignmentService'
import AssignmentForm from './AssignmentForm'
import Card from '../shared/Card'
import Button from '../shared/Button'
import LoadingSpinner from '../shared/LoadingSpinner'
import Alert from '../shared/Alert'

interface AssignmentListProps {
  onSelect: (assignment: Assignment) => void
  onCreateNew?: (assignment: Assignment) => void
}

export default function AssignmentList({ onSelect }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [list, active] = await Promise.all([
        assignmentService.getAll(),
        assignmentService.getActive(),
      ])
      setAssignments(list)
      setActiveId(active?.id || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(title: string, totalMarks: number, course?: string) {
    try {
      const assignment = await assignmentService.create({
        title,
        totalMarks,
        course,
      })
      setAssignments([...assignments, assignment])
      setShowForm(false)
      // Notify parent if callback provided (for Phase 9 question setup)
      if (onCreateNew) {
        onCreateNew(assignment)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment? This cannot be undone.')) return
    try {
      await assignmentService.delete(id)
      setAssignments(assignments.filter(a => a.id !== id))
      if (activeId === id) {
        setActiveId(null)
        await assignmentService.setActive(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment')
    }
  }

  async function handleActivate(id: string) {
    try {
      await assignmentService.setActive(id)
      setActiveId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate assignment')
    }
  }

  async function handleDuplicate(id: string) {
    const assignment = assignments.find(a => a.id === id)
    if (!assignment) return

    const newTitle = `${assignment.title} (Copy)`
    try {
      const duplicated = await assignmentService.duplicate(id, newTitle)
      setAssignments([...assignments, duplicated])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate assignment')
    }
  }

  if (loading) return <LoadingSpinner label="Loading assignments..." />

  return (
    <div className="space-y-4">
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {showForm ? (
        <AssignmentForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          className="w-full"
        >
          + Create Assignment
        </Button>
      )}

      <div className="space-y-2">
        {assignments.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No assignments yet. Create one to get started.</p>
          </Card>
        ) : (
          assignments.map(assignment => (
            <Card
              key={assignment.id}
              className={`p-4 cursor-pointer transition-colors ${
                activeId === assignment.id ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(assignment)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{assignment.title}</h3>
                  {assignment.course && (
                    <p className="text-xs text-gray-500 truncate">{assignment.course}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {assignment.questions.length} questions • {assignment.totalMarks} marks
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {activeId !== assignment.id && (
                    <Button
                      onClick={e => {
                        e.stopPropagation()
                        handleActivate(assignment.id)
                      }}
                      variant="success"
                      size="sm"
                      title="Set as active assignment"
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    onClick={e => {
                      e.stopPropagation()
                      handleDuplicate(assignment.id)
                    }}
                    variant="secondary"
                    size="sm"
                    title="Create a copy of this assignment"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={e => {
                      e.stopPropagation()
                      handleDelete(assignment.id)
                    }}
                    variant="danger"
                    size="sm"
                    title="Delete this assignment"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
