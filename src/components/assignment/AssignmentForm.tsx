import React, { useState } from 'react'
import Button from '../shared/Button'

interface AssignmentFormProps {
  onSubmit: (title: string, totalMarks: number, course?: string) => Promise<void>
  onCancel: () => void
}

export default function AssignmentForm({ onSubmit, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = useState('')
  const [totalMarks, setTotalMarks] = useState('100')
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Assignment title is required')
      return
    }

    const marks = parseInt(totalMarks, 10)
    if (isNaN(marks) || marks < 1) {
      setError('Total marks must be a positive number')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit(title.trim(), marks, course.trim() || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 bg-gray-50 space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Midterm Exam"
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Total Marks *</label>
        <input
          type="number"
          value={totalMarks}
          onChange={e => setTotalMarks(e.target.value)}
          placeholder="e.g., 100"
          min="1"
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Course (optional)</label>
        <input
          type="text"
          value={course}
          onChange={e => setCourse(e.target.value)}
          placeholder="e.g., CS101"
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
