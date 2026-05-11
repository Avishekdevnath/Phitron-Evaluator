import type { EvaluationResult, QuestionResult } from '../types/index'

const BOILERPLATE = [
  'Important Instructions:',
  ' → Do not post on Facebook, if you have any marks-related issues.',
  ' → Make sure to read all the requirements carefully, If you have any marks-related confusion.',
  ' → If you are confident and If there is a mistake from the examiner\'s end, give a recheck request.',
  ' → If your recheck reason was not valid, 2 marks will be deducted from your current marks.',
  ' → Please check the documentation below for more information about how to recheck.',
  '',
  'We have a recheck option, so please refrain from posting to the group.',
  'If your recheck reason is valid you will get marks, if not valid 2 marks will be deducted.',
].join('\n')

export function scaleTotal(totalScore: number, maxScore: number, outOf: number): number {
  if (maxScore === 0) throw new Error('maxScore cannot be zero')
  return Math.round((totalScore / maxScore) * outOf)
}

export function generateOverallComment(questions: QuestionResult[]): string {
  const joined = questions
    .map(q => q.summary)
    .filter(Boolean)
    .join(' ')
  const text = joined || 'Please review the feedback below for each question.'
  return text.length > 300 ? text.slice(0, 300) : text
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildQuestionBlock(q: QuestionResult): string {
  const lines: string[] = [
    `<p><strong style="font-size:15px"># Question - ${q.questionNumber}</strong></p>`,
    `<p><em class="ql-padding-2" style="font-size:15px;"> ${escapeHtml(q.summary || q.questionNumber)} → ${q.awardedMarks} / ${q.maxMarks}</em></p>`,
  ]
  if (q.status === 'partial') {
    if (q.mistakes[0]) lines.push(`<p><span style="font-size:15px;"> ✗ ${escapeHtml(q.mistakes[0])}</span></p>`)
    if (q.suggestions[0]) lines.push(`<p><span style="font-size:15px;"> 💡 ${escapeHtml(q.suggestions[0])}</span></p>`)
  } else if (q.status === 'skipped') {
    lines.push(`<p><span style="font-size:15px;"> ✗ Question not attempted.</span></p>`)
  }
  return lines.join('')
}

export function generateFeedbackHTML(result: EvaluationResult, overallComment: string): string {
  const header =
    `<p><strong style="font-size:15px;">Examiner Feedback: </strong>` +
    `<span style="font-size:15px;">${escapeHtml(overallComment)}</span></p><p><br></p>`

  const questionBlocks = result.questionResults
    .map(buildQuestionBlock)
    .join('<p><br></p>')

  const footer =
    `<p><br></p><p><span style="font-size:15px;">` +
    escapeHtml(BOILERPLATE).replace(/\n/g, '<br>') +
    `</span></p>`

  return header + questionBlocks + footer
}

export function generatePlainTextFeedback(result: EvaluationResult, overallComment: string): string {
  const lines: string[] = []

  lines.push('**Examiner Feedback:** ' + overallComment)
  lines.push('')

  result.questionResults.forEach(q => {
    lines.push(`# Question - ${q.questionNumber}`)
    lines.push(`*${q.summary || q.questionNumber}* → **${q.awardedMarks} / ${q.maxMarks}**`)

    if (q.status === 'partial') {
      if (q.mistakes[0]) {
        lines.push(`**note:** ${q.mistakes[0]}`)
      }
      if (q.suggestions[0]) {
        lines.push(`💡 ${q.suggestions[0]}`)
      }
    } else if (q.status === 'skipped') {
      lines.push('**note:** not attempted')
    }

    if (q.aiCopyPercentage > 70) {
      lines.push(`⚠️ High AI likelihood detected (${q.aiCopyPercentage}%)`)
    }

    lines.push('')
  })

  lines.push('')
  lines.push('**Important Instructions:**')
  BOILERPLATE.split('\n').forEach(line => {
    lines.push(line)
  })

  return lines.join('\n')
}
