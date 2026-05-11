import React, { useState } from 'react'
import { EvaluationResult } from '../../types/index'
import Button from '../shared/Button'

interface ResultExporterProps {
  result: EvaluationResult
}

function buildTextReport(result: EvaluationResult): string {
  const header = [
    'Phitron Evaluation Report',
    `Submission: ${result.submissionName}`,
    `Assignment Version: v${result.assignmentVersion}`,
    `Generated: ${new Date(result.generatedAt).toLocaleString()}`,
    `Strictness: ${result.strictness || 'balanced'}`,
    `Total Score: ${result.totalScore}/${result.maxScore}`,
    'AI copy likelihood is a review signal, not final proof.',
    '',
  ]

  const questionSections = result.questionResults.map(q => {
    return [
      `Q${q.questionNumber} (${q.awardedMarks}/${q.maxMarks})`,
      `Status: ${q.status} | Confidence: ${q.confidence}`,
      `AI Copy Likelihood: ${q.aiCopyPercentage ?? 0}/100`,
      `Summary: ${q.summary || 'N/A'}`,
      `Strengths: ${q.strengths.length ? q.strengths.join('; ') : 'N/A'}`,
      `Mistakes: ${q.mistakes.length ? q.mistakes.join('; ') : 'N/A'}`,
      `Suggestions: ${q.suggestions.length ? q.suggestions.join('; ') : 'N/A'}`,
      `Rubric Alignment: ${q.rubricAlignment || 'N/A'}`,
      '',
    ].join('\n')
  })

  return [...header, ...questionSections].join('\n')
}

export default function ResultExporter({ result }: ResultExporterProps) {
  const [message, setMessage] = useState<string>('')

  const writeToClipboard = async (content: string, success: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setMessage(success)
      setTimeout(() => setMessage(''), 1800)
    } catch {
      setMessage('Clipboard not available in this context')
      setTimeout(() => setMessage(''), 1800)
    }
  }

  const exportText = () => {
    const content = buildTextReport(result)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${result.submissionName.replace(/\s+/g, '_')}_evaluation.txt`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('TXT report downloaded')
    setTimeout(() => setMessage(''), 1800)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => writeToClipboard(buildTextReport(result), 'Report copied')}
        >
          Copy Report
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => writeToClipboard(JSON.stringify(result, null, 2), 'JSON copied')}
        >
          Copy JSON
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={exportText}
        >
          Export TXT
        </Button>
      </div>

      {message && <p className="text-xs text-gray-500">{message}</p>}
    </div>
  )
}
