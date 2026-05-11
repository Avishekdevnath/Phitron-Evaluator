import React, { useState, useEffect } from 'react'
import { Question } from '../../types/index'
import Button from '../shared/Button'

interface QuestionFormProps {
  question?: Question
  onSubmit: (question: Partial<Question>) => Promise<void>
  onCancel: () => void
}

export default function QuestionForm({ question, onSubmit, onCancel }: QuestionFormProps) {
  const [title, setTitle] = useState(question?.title || '')
  const [prompt, setPrompt] = useState(question?.prompt || '')
  const [maxMarks, setMaxMarks] = useState(question?.maxMarks.toString() || '1')
  const [answerType, setAnswerType] = useState(question?.answerType || 'theory')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('Question title is required')
      return
    }

    if (!prompt.trim()) {
      setError('Question prompt is required')
      return
    }

    const marks = parseInt(maxMarks, 10)
    if (isNaN(marks) || marks < 0 || !Number.isInteger(marks)) {
      setError('Max marks must be a non-negative whole number')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit({
        title: title.trim(),
        prompt: prompt.trim(),
        maxMarks: marks,
        answerType: answerType as any,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 bg-gray-50 space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Question Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., What is photosynthesis?"
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Question Prompt *</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Detailed question instructions..."
          className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Max Marks *</label>
          <input
            type="number"
            value={maxMarks}
            onChange={e => setMaxMarks(e.target.value)}
            min="0"
            step="1"
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Answer Type</label>
          <select
            value={answerType}
            onChange={e => setAnswerType(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="theory">Theory</option>
            <option value="code">Code</option>
            <option value="mixed">Mixed</option>
            <option value="math">Math</option>
            <option value="diagram">Diagram</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="success"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : question ? 'Update' : 'Add'} Question
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
