import React, { useState } from 'react'
import { submissionNormalizer } from '../../core/submission/submissionNormalizer'
import { NormalizedSubmission } from '../../core/submission/submissionTypes'
import Button from '../shared/Button'
import Card from '../shared/Card'
import Alert from '../shared/Alert'

interface SubmissionFormProps {
  onSubmit: (submission: NormalizedSubmission) => Promise<void>
  onCancel: () => void
}

export default function SubmissionForm({ onSubmit, onCancel }: SubmissionFormProps) {
  const [submissionName, setSubmissionName] = useState('')
  const [content, setContent] = useState('')
  const [submissionType, setSubmissionType] = useState<'text' | 'script'>('text')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!submissionName.trim()) {
      setError('Submission name is required (e.g., Student A, Submission 1)')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const normalized = await submissionNormalizer.normalize({
        name: submissionName.trim(),
        source: submissionType,
        content,
      })
      await onSubmit(normalized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process submission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Submission Name *</label>
            <input
              type="text"
              value={submissionName}
              onChange={e => setSubmissionName(e.target.value)}
              placeholder="e.g., Student A, Submission 1"
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Submission Type</label>
            <select
              value={submissionType}
              onChange={e => setSubmissionType(e.target.value as 'text' | 'script')}
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="text">Text/Essay</option>
              <option value="script">Code/Script</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {submissionType === 'script' ? 'Code' : 'Answer'} *
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                submissionType === 'script'
                  ? 'Paste your code here...'
                  : 'Paste your answer here... (supports markdown with # headings)'
              }
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
              rows={12}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              {submissionType === 'text'
                ? 'Tip: Use # for headings, blank lines for paragraphs'
                : 'Supports any programming language'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="success"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Submit & Evaluate'}
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
        </div>
      </Card>
    </form>
  )
}
