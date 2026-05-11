import React, { useState } from 'react'
import { Question } from '../../types/index'
import { questionParser } from '../../core/parsing/questionParser'
import Card from '../shared/Card'
import Button from '../shared/Button'

interface QuestionParserProps {
  totalMarks: number
  onParsed: (questions: Question[]) => void
  onCancel: () => void
}

type ParserState = 'input' | 'parsing' | 'preview' | 'error'

export default function QuestionParserComponent({
  totalMarks,
  onParsed,
  onCancel,
}: QuestionParserProps) {
  const [state, setState] = useState<ParserState>('input')
  const [rawText, setRawText] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([])
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!rawText.trim()) {
      setError('Please paste the assignment text')
      return
    }

    try {
      setState('parsing')
      setError('')
      const questions = await questionParser.parseQuestionsFromText(rawText, totalMarks)
      setParsedQuestions(questions)
      setState('preview')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setState('error')
    }
  }

  const handleConfirm = () => {
    onParsed(parsedQuestions)
  }

  if (state === 'parsing') {
    return (
      <Card>
        <div className="space-y-4">
          <p className="font-semibold text-gray-900">Parsing assignment with AI...</p>
          <div className="space-y-2">
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" />
            </div>
            <p className="text-sm text-gray-600">
              This may take a moment while we extract and structure the questions.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (state === 'preview') {
    return (
      <div className="space-y-4">
        <Card>
          <div>
            <p className="font-semibold text-gray-900 mb-3">Extracted Questions</p>
            <p className="text-sm text-gray-600 mb-4">
              Review the parsed questions below. You can edit them after creating the assignment.
            </p>
            <div className="space-y-3">
              {parsedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded p-3 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Q{q.number}</p>
                      <p className="text-sm font-medium text-gray-700">{q.title}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-blue-600">{q.maxMarks}</p>
                      <p className="text-xs text-gray-500">marks</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{q.prompt}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Total marks: {parsedQuestions.reduce((sum, q) => sum + q.maxMarks, 0)} / {totalMarks}
            </p>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => setState('input')} variant="secondary">
            Back to Edit
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Use These Questions
          </Button>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="space-y-4">
        <Card>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-900 mb-2">Parsing Failed</p>
            <p className="text-sm text-red-800 mb-4">{error}</p>
            <p className="text-xs text-red-700 mb-3">
              Try pasting the text again or check that your API key is valid.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setState('input')} variant="secondary">
                Try Again
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Input state
  return (
    <div className="space-y-4">
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Paste Assignment Text
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Paste the raw assignment text (from a PDF, Word doc, email, etc.) and we'll use AI
              to extract and structure the questions automatically.
            </p>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Q1) What is photosynthesis? (10 marks)&#10;Q2) Explain the water cycle. (15 marks)&#10;..."
              className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onCancel} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleParse} disabled={!rawText.trim()} className="flex-1">
              Parse Questions with AI
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-800">
              💡 Tip: For best results, include question numbers and marks in your text.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
