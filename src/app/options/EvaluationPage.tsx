import React, { useState } from 'react'
import {
  submissionNormalizer,
  answerMapper,
  evaluationEngine,
  historyService,
} from '../../main'
import {
  Assignment,
  EvaluationResult,
  GradingStrictness,
} from '../../types/index'
import { NormalizedSubmission } from '../../core/submission/submissionTypes'
import SubmissionForm from '../../components/evaluation/SubmissionForm'
import EvaluationResults from '../../components/evaluation/EvaluationResults'
import Alert from '../../components/shared/Alert'
import { getFriendlyErrorMessage, logAppError } from '../../utils/errors'

interface EvaluationPageProps {
  assignment: Assignment
  onBack: () => void
}

type EvaluationState = 'form' | 'evaluating' | 'results' | 'error'

export default function EvaluationPage({ assignment, onBack }: EvaluationPageProps) {
  const [state, setState] = useState<EvaluationState>('form')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [strictness, setStrictness] = useState<GradingStrictness>('balanced')

  const handleSubmissionSubmit = async (submission: NormalizedSubmission) => {
    try {
      setLoading(true)
      setState('evaluating')
      setError('')

      // Map submission blocks to questions
      const mappings = await answerMapper.mapSubmissionToQuestions(
        assignment.questions,
        submission.blocks
      )

      // Evaluate the submission
      const evaluationResult = await evaluationEngine.evaluate({
        assignment,
        submission,
        questionMappings: mappings,
        strictness,
      })

      // Save evaluation to history
      await historyService.save(evaluationResult)

      setResult(evaluationResult)
      setState('results')
    } catch (err) {
      const errorMessage = getFriendlyErrorMessage(err, 'Unknown error occurred')
      setError(errorMessage)
      setState('error')
      logAppError('Evaluation error', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setResult(null)
    setError('')
    setState('form')
  }

  if (state === 'results' && result) {
    return <EvaluationResults result={result} onBack={handleBack} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-gray-600">Total Marks: {assignment.totalMarks}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          ← Back
        </button>
      </div>

      {/* Questions Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Questions to evaluate:</p>
        <div className="grid grid-cols-2 gap-2">
          {assignment.questions.map(q => (
            <div key={q.id} className="text-sm text-blue-800">
              <span className="font-semibold">Q{q.number}:</span> {q.title} ({q.maxMarks}
              {q.maxMarks === 1 ? ' mark' : ' marks'})
            </div>
          ))}
        </div>
      </div>

      {/* Grading Strictness */}
      {state === 'form' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Grading strictness</p>
            <p className="text-xs text-gray-600 mt-1">
              Choose how tough the AI should be while awarding marks.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['lenient', 'balanced', 'strict'] as GradingStrictness[]).map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setStrictness(option)}
                className={`px-3 py-2 rounded-md border text-sm font-medium capitalize transition ${
                  strictness === option
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <Alert
          variant="error"
          message={`Evaluation failed: ${error}`}
          actionLabel="Try Again"
          onAction={() => setState('form')}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900">
            Evaluating submission with AI...
          </p>
          <div className="mt-3 space-y-2">
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" />
            </div>
            <p className="text-xs text-blue-700">Please wait while we analyze the answers</p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      {state === 'form' && (
        <SubmissionForm onSubmit={handleSubmissionSubmit} onCancel={onBack} />
      )}
    </div>
  )
}
