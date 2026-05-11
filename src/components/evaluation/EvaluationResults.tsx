import React, { useState } from 'react'
import { EvaluationResult } from '../../types/index'
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from 'lucide-react'
import Button from '../shared/Button'
import ResultExporter from './ResultExporter'

interface EvaluationResultsProps {
  result: EvaluationResult
  onBack: () => void
  compact?: boolean
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 size={20} className="text-emerald-500" />
    case 'partial':
      return <AlertTriangle size={20} className="text-amber-500" />
    case 'skipped':
      return <XCircle size={20} className="text-rose-500" />
    default:
      return null
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    complete: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    partial: 'bg-amber-100 text-amber-800 border border-amber-200',
    skipped: 'bg-rose-100 text-rose-800 border border-rose-200',
  }

  const labels: Record<string, string> = {
    complete: 'Perfect',
    partial: 'Partial',
    skipped: 'Skipped',
  }

  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

const ScoreBar = ({ current, max }: { current: number; max: number }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0
  const bgColor = percentage >= 70 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'

  return (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
      <div className={`h-full ${bgColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  )
}

const getAiCopyLabel = (percentage = 0) => {
  if (percentage <= 30) return 'Low'
  if (percentage <= 70) return 'Medium'
  return 'High'
}

const getAiCopyBadgeClass = (percentage = 0) => {
  if (percentage <= 30) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (percentage <= 70) return 'bg-amber-100 text-amber-800 border-amber-200'
  return 'bg-rose-100 text-rose-800 border-rose-200'
}

export default function EvaluationResults({ result, onBack, compact = false }: EvaluationResultsProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const percentageScore =
    result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0

  return (
    <div className={`bg-slate-50 ${compact ? 'min-h-screen p-3' : 'min-h-screen p-6'}`}>
      <div className={`${compact ? 'max-w-full' : 'max-w-4xl mx-auto'} space-y-6`}>
        {/* Header */}
        <div className={`flex gap-4 ${compact ? 'flex-col' : 'items-start justify-between'}`}>
          <div>
            <h1 className={`${compact ? 'text-xl' : 'text-3xl'} font-bold text-slate-900`}>
              Evaluation Results
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {result.submissionName} • Assignment v{result.assignmentVersion}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(result.generatedAt).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Strictness: {result.strictness || 'balanced'}
            </p>
          </div>
          <Button
            onClick={onBack}
            variant="secondary"
            className="px-4 py-2"
          >
            ← Back
          </Button>
        </div>

        {/* Submission Info Card */}
        {result.submissionInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-blue-900 text-sm">📋 Submission Information</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-blue-600 font-medium">Student Name</p>
                <p className="text-blue-800">{result.submissionInfo.studentName}</p>
              </div>
              <div>
                <p className="text-blue-600 font-medium">Assignment</p>
                <p className="text-blue-800">{result.submissionInfo.assignmentName}</p>
              </div>
              {result.submissionInfo.email && (
                <div>
                  <p className="text-blue-600 font-medium">Email</p>
                  <p className="text-blue-800">{result.submissionInfo.email}</p>
                </div>
              )}
              {result.submissionInfo.submissionDate && (
                <div>
                  <p className="text-blue-600 font-medium">Submitted</p>
                  <p className="text-blue-800">{result.submissionInfo.submissionDate}</p>
                </div>
              )}
              {result.submissionInfo.colabLink && (
                <div className="col-span-2">
                  <p className="text-blue-600 font-medium">Colab Notebook</p>
                  <a
                    href={result.submissionInfo.colabLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 break-all text-xs"
                  >
                    {result.submissionInfo.colabLink}
                  </a>
                </div>
              )}
              {result.submissionInfo.notes && (
                <div className="col-span-2">
                  <p className="text-blue-600 font-medium">Notes</p>
                  <p className="text-blue-800">{result.submissionInfo.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Score Card */}
        <div className={`bg-white rounded-xl shadow-md border border-slate-200 ${compact ? 'p-4' : 'p-8'}`}>
          <div className={`flex gap-8 ${compact ? 'flex-col' : 'items-center justify-between'}`}>
            <div>
              <p className="text-slate-600 text-sm font-medium mb-3">Total Score</p>
              <div className="flex items-baseline gap-2">
                <span className={`${compact ? 'text-4xl' : 'text-5xl'} font-bold text-slate-900`}>
                  {result.totalScore}
                </span>
                <span className="text-xl text-slate-500">/ {result.maxScore}</span>
              </div>
              <p className="text-2xl font-bold text-slate-700 mt-3">{percentageScore}%</p>
            </div>

            <div className="flex-1 space-y-3">
              <ScoreBar current={result.totalScore} max={result.maxScore} />
              <div className="flex gap-2">
                {result.questionResults.map(q => (
                  <div
                    key={q.questionId}
                    className="flex-1 text-center text-xs"
                    title={`Q${q.questionNumber}: ${q.awardedMarks}/${q.maxMarks}`}
                  >
                    <div
                      className={`h-8 rounded flex items-center justify-center font-semibold text-white ${
                        q.status === 'complete'
                          ? 'bg-emerald-500'
                          : q.status === 'partial'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                    >
                      {q.awardedMarks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Question Feedback</h2>
          <p className="text-xs text-slate-500">
            AI copy likelihood is a review signal, not final proof.
          </p>
          {result.questionResults.map(question => (
            <div
              key={question.questionId}
              className={`bg-white rounded-lg border transition-all duration-300 overflow-hidden ${
                expandedQuestion === question.questionId
                  ? 'border-slate-300 shadow-md'
                  : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <button
                onClick={() =>
                  setExpandedQuestion(
                    expandedQuestion === question.questionId ? null : question.questionId
                  )
                }
                className={`w-full px-6 py-4 flex gap-3 hover:bg-slate-50 transition ${
                  compact ? 'flex-col items-stretch' : 'items-center justify-between'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <StatusIcon status={question.status} />
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900">Q{question.questionNumber}</h3>
                    {question.status === 'skipped' && (
                      <p className="text-xs text-slate-500">Not answered</p>
                    )}
                  </div>
                </div>

                <div className={`flex items-center gap-4 ${compact ? 'justify-between' : ''}`}>
                  <span
                    className={`hidden sm:inline-flex text-xs font-semibold px-3 py-1 rounded-full border ${getAiCopyBadgeClass(
                      question.aiCopyPercentage ?? 0
                    )}`}
                  >
                    AI Copy: {question.aiCopyPercentage ?? 0}/100
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">{question.awardedMarks}</div>
                    <div className="text-xs text-slate-500">/ {question.maxMarks}</div>
                  </div>
                  <StatusBadge status={question.status} />
                  <div className="text-slate-400">
                    {expandedQuestion === question.questionId ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {expandedQuestion === question.questionId && (
                <div className="border-t border-slate-200 bg-slate-50 p-6 space-y-4 animate-in fade-in duration-200">
                  {question.summary && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Summary</p>
                      <p className="text-sm text-slate-600">{question.summary}</p>
                    </div>
                  )}

                  {question.strengths && question.strengths.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 mb-2">✓ Strengths</p>
                      <ul className="space-y-1">
                        {question.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-slate-600 ml-4">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {question.mistakes && question.mistakes.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-rose-700 mb-2">✗ Mistakes</p>
                      <ul className="space-y-1">
                        {question.mistakes.map((mistake, i) => (
                          <li key={i} className="text-sm text-slate-600 ml-4">
                            • {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {question.suggestions && question.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-2">💡 Suggestions</p>
                      <ul className="space-y-1">
                        {question.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-slate-600 ml-4">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {question.rubricAlignment && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Rubric Alignment</p>
                      <p className="text-sm text-slate-600">{question.rubricAlignment}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      AI Copy Likelihood
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full border ${getAiCopyBadgeClass(
                        question.aiCopyPercentage ?? 0
                      )}`}
                    >
                      <span>{question.aiCopyPercentage ?? 0}/100</span>
                      <span>{getAiCopyLabel(question.aiCopyPercentage ?? 0)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>Confidence: {question.confidence}</span>
                    {question.status === 'complete' && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold">
                        Evaluated
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-3 pt-4 ${compact ? 'flex-col' : ''}`}>
          <Button
            onClick={onBack}
            variant="secondary"
            className="flex-1 px-4 py-3"
          >
            Close
          </Button>
          <Button
            onClick={() => window.print()}
            variant="primary"
            className="flex-1 px-4 py-3 !bg-slate-900 hover:!bg-slate-800"
          >
            Print Report
          </Button>
        </div>

        <ResultExporter result={result} />
      </div>
    </div>
  )
}
