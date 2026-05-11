import React, { useState } from 'react'
import { Assignment, Question } from '../../types/index'
import { assignmentService } from '../../main'
import QuestionParserComponent from '../../components/assignment/QuestionParser'
import QuestionManager from '../../components/assignment/QuestionManager'
import Card from '../../components/shared/Card'
import Button from '../../components/shared/Button'

interface QuestionSetupPageProps {
  assignment: Assignment
  onComplete: (updatedAssignment: Assignment) => void
}

type SetupMode = 'choice' | 'manual' | 'parse'

export default function QuestionSetupPage({ assignment, onComplete }: QuestionSetupPageProps) {
  const [mode, setMode] = useState<SetupMode>('choice')
  const [loading, setLoading] = useState(false)

  const handleSkipSetup = async () => {
    // Just mark as complete and move on
    onComplete(assignment)
  }

  const handleParsedQuestions = async (questions: Question[]) => {
    try {
      setLoading(true)

      // Add parsed questions to assignment
      let updated = assignment
      for (const question of questions) {
        updated = await assignmentService.addQuestion(updated.id, {
          title: question.title,
          prompt: question.prompt,
          maxMarks: question.maxMarks,
        })
      }

      onComplete(updated)
    } catch (err) {
      console.error('[Phitron] Failed to add parsed questions:', err)
      alert('Failed to add questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'parse') {
    return (
      <div className="space-y-4">
        <QuestionParserComponent
          totalMarks={assignment.totalMarks}
          onParsed={handleParsedQuestions}
          onCancel={() => setMode('choice')}
        />
      </div>
    )
  }

  if (mode === 'manual') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setMode('choice')}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          ← Back to Setup
        </button>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Questions</h3>
          <QuestionManager assignment={assignment} onUpdate={onComplete} />
        </Card>
      </div>
    )
  }

  // Choice mode
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to {assignment.title}</h3>
        <p className="text-gray-700">
          Your assignment has been created with {assignment.totalMarks} total marks. Now let's add questions.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Parser Option */}
        <Card className="p-6 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-blue-400">
          <div onClick={() => setMode('parse')} className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Use AI Parser</h4>
              <p className="text-sm text-gray-600 mb-4">
                Paste raw assignment text and let AI extract questions automatically.
              </p>
            </div>
            <Button variant="primary" className="w-full">
              Parse with AI
            </Button>
          </div>
        </Card>

        {/* Manual Add Option */}
        <Card className="p-6 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-green-400">
          <div onClick={() => setMode('manual')} className="space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✎</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Add Manually</h4>
              <p className="text-sm text-gray-600 mb-4">
                Create and manage questions one by one with full control.
              </p>
            </div>
            <Button variant="success" className="w-full">
              Add Questions
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-gray-50">
        <Button onClick={handleSkipSetup} variant="secondary" className="w-full">
          Skip for Now
        </Button>
        <p className="text-xs text-gray-500 mt-3 text-center">
          You can add questions later from the Manage Questions tab
        </p>
      </Card>
    </div>
  )
}
