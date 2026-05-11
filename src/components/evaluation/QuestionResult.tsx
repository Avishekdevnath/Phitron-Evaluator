import React from 'react'
import { QuestionResult as EvaluationQuestionResult } from '../../types/index'
import Card from '../shared/Card'

interface QuestionResultProps {
  question: EvaluationQuestionResult
  isSelected: boolean
  onSelect: (questionId: string) => void
}

function statusBadgeClass(status: EvaluationQuestionResult['status']): string {
  if (status === 'complete') return 'bg-green-100 text-green-700'
  if (status === 'partial') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-200 text-gray-700'
}

export default function QuestionResult({ question, isSelected, onSelect }: QuestionResultProps) {
  return (
    <Card
      onClick={() => onSelect(question.questionId)}
      className={`p-4 cursor-pointer transition-all hover:shadow ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-100' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">Q{question.questionNumber}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${statusBadgeClass(question.status)}`}>
              {question.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {question.summary || 'No summary available'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="font-bold text-lg text-blue-600">{question.awardedMarks}</div>
          <div className="text-xs text-gray-500">/ {question.maxMarks}</div>
        </div>
      </div>
    </Card>
  )
}
