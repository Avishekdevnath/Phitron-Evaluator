import React, { useEffect, useMemo, useState } from 'react'
import { assignmentService, historyService } from '../../main'
import { Assignment, EvaluationResult } from '../../types/index'
import Card from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import EvaluationResults from '../../components/evaluation/EvaluationResults'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import Alert from '../../components/shared/Alert'
import { getFriendlyErrorMessage, logAppError } from '../../utils/errors'

export default function HistoryPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selected, setSelected] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadHistory()
  }, [])

  async function loadHistory() {
    try {
      setLoading(true)
      setError(null)

      const [history, assignmentList] = await Promise.all([
        historyService.getAll(),
        assignmentService.getAll(),
      ])

      const sorted = [...history].sort(
        (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      )

      setEvaluations(sorted)
      setAssignments(assignmentList)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to load evaluation history'))
      logAppError('Failed to load evaluation history', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this evaluation record?')) return

    try {
      await historyService.delete(id)
      setEvaluations(prev => prev.filter(item => item.id !== id))
      if (selected?.id === id) {
        setSelected(null)
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to delete evaluation'))
      logAppError('Failed to delete evaluation', err)
    }
  }

  const assignmentById = useMemo(() => {
    return new Map(assignments.map(item => [item.id, item]))
  }, [assignments])

  if (selected) {
    return <EvaluationResults result={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900">Evaluation History</h2>
        <p className="text-sm text-gray-500 mt-1">
          Reopen previous reports and keep grading continuity.
        </p>
      </div>

      {error && (
        <Alert
          variant="error"
          message={error}
          actionLabel="Retry"
          onAction={() => void loadHistory()}
        />
      )}

      {loading ? (
        <Card className="p-6">
          <LoadingSpinner label="Loading history..." />
        </Card>
      ) : evaluations.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600">No evaluations yet. Run an evaluation to populate history.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {evaluations.map(item => {
            const assignment = assignmentById.get(item.assignmentId)
            const percentage = item.maxScore > 0 ? Math.round((item.totalScore / item.maxScore) * 100) : 0

            return (
              <Card key={item.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{item.submissionName}</p>
                    <p className="text-sm text-gray-600">
                      {assignment?.title || `Assignment ${item.assignmentId}`} • v{item.assignmentVersion}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {item.totalScore}/{item.maxScore}
                    </p>
                    <p className="text-xs text-gray-500">{percentage}%</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setSelected(item)}
                    >
                      Reopen
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
