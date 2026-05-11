import React, { useState, useEffect } from 'react'
import type { EvaluationResult } from '../../types/index'
import {
  scaleTotal,
  generateOverallComment,
  generateFeedbackHTML,
} from '../../utils/feedbackFormatter'
import { loadResult, getStorageKey } from '../../utils/storageUtils'

interface FillPanelProps {
  result: EvaluationResult | null
  outOf: number
  onApply: (scaledTotal: number, html: string) => void
}

export default function FillPanel({ result: initialResult, outOf, onApply }: FillPanelProps) {
  const [result, setResult] = useState(initialResult)
  const [expanded, setExpanded] = useState(false)
  const [applied, setApplied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [overallComment, setOverallComment] = useState(() =>
    result ? generateOverallComment(result.questionResults) : ''
  )

  useEffect(() => {
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
      const key = getStorageKey()
      if (key in changes) {
        loadResult().then(newResult => {
          setResult(newResult)
          if (newResult && !overallComment) {
            setOverallComment(generateOverallComment(newResult.questionResults))
          }
        })
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [overallComment])

  const scaledTotal =
    result && result.maxScore > 0
      ? scaleTotal(result.totalScore, result.maxScore, outOf)
      : 0

  const handleApply = () => {
    if (!result) return
    onApply(scaledTotal, generateFeedbackHTML(result, overallComment))
    setApplied(true)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setRefreshError(null)
    try {
      // Clear cache and reload from storage
      const freshResult = await loadResult()
      if (freshResult) {
        setResult(freshResult)
        if (!overallComment) {
          setOverallComment(generateOverallComment(freshResult.questionResults))
        }
        setApplied(false) // Reset applied state
        console.log('[Phitron] Refreshed evaluation result:', freshResult)
      } else {
        setRefreshError('No evaluation data available yet')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to refresh'
      setRefreshError(errorMsg)
      console.error('[Phitron] Error refreshing result:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const statusColor = (status: string) =>
    status === 'complete' ? 'badge-success' : status === 'partial' ? 'badge-warning' : 'badge-danger'

  return (
    <div className="phitron-ai-panel-root card mb-3 border-primary" style={{ borderRadius: 6 }}>
      {/* Header — always visible */}
      <div
        className="card-header d-flex justify-content-between align-items-center bg-primary text-white py-2 px-3"
        style={{ borderRadius: expanded ? '6px 6px 0 0' : 6 }}
      >
        <span>
          <strong>✨ AI Evaluation Ready</strong>
          {result && (
            <span className="badge badge-light text-dark ml-2">{scaledTotal}/{outOf}</span>
          )}
          {applied && (
            <span className="badge badge-success ml-2">✓ Applied</span>
          )}
        </span>
        <div className="d-flex gap-2 align-items-center">
          {result && (
            <button
              aria-label="refresh evaluation"
              className="btn btn-sm btn-outline-light py-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Fetch latest evaluation results"
            >
              {isRefreshing ? '⟳ Loading...' : '⟳ Refresh'}
            </button>
          )}
          <button
            aria-label={expanded ? 'collapse' : 'expand'}
            className="btn btn-sm btn-outline-light py-0"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* No-result collapsed hint */}
      {!expanded && !result && (
        <div className="card-body py-2 text-muted small">
          No evaluation yet — click to see next steps.
        </div>
      )}

      {/* Expanded body */}
      {expanded && (
        <div className="card-body">
          {refreshError && (
            <div className="alert alert-warning mb-3 small" role="alert">
              ⚠️ {refreshError}
            </div>
          )}
          {!result ? (
            <div className="mb-0">
              <div className="alert alert-info mb-3" role="alert">
                <strong>📋 No Report Generated Yet</strong>
                <p className="small mb-2 mt-2">Here's what to do next:</p>
                <ol className="small mb-0 pl-3">
                  <li className="mb-1">Open the assignment submission in <strong>Colab</strong></li>
                  <li className="mb-1">Click the <strong>Phitron Evaluator</strong> popup icon in Chrome toolbar</li>
                  <li className="mb-1">Click <strong>Extract & Evaluate</strong> to run the evaluation</li>
                  <li className="mb-1">Wait for AI to generate the report (~30-60 seconds)</li>
                  <li>Come back here — the report will auto-load when ready</li>
                </ol>
              </div>
              <p className="text-muted small mb-0">
                <em>💡 Tip: The extension needs to analyze the submission before it can generate feedback.</em>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-2 small text-muted">
                <strong>Notebook:</strong> {result.submissionName}
                <span className="mx-2">|</span>
                <strong>Score:</strong> {result.totalScore}/{result.maxScore} ×{' '}
                {(outOf / result.maxScore).toFixed(2)} = <strong>{scaledTotal}</strong>{' '}
                (out of {outOf})
              </div>

              <div className="form-group mb-2">
                <label className="small font-weight-bold mb-1">Overall Comment</label>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  value={overallComment}
                  onChange={e => setOverallComment(e.target.value)}
                />
              </div>

              <div className="mb-3">
                {result.questionResults.map(q => (
                  <span
                    key={q.questionId}
                    className={`badge ${statusColor(q.status)} mr-1 mb-1`}
                    title={`Q${q.questionNumber}: ${q.awardedMarks}/${q.maxMarks}`}
                  >
                    Q{q.questionNumber} {q.awardedMarks}/{q.maxMarks}
                  </span>
                ))}
              </div>

              <button
                aria-label="apply to form"
                className="btn btn-primary btn-sm w-100"
                onClick={handleApply}
              >
                {applied ? '✓ Applied — Re-apply' : '✨ Apply to Form'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
