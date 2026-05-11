import React, { useState } from 'react'
import { Assignment } from '../../types/index'
import AssignmentList from '../../components/assignment/AssignmentList'
import QuestionManager from '../../components/assignment/QuestionManager'
import EvaluationPage from './EvaluationPage'
import QuestionSetupPage from './QuestionSetupPage'

interface AssignmentListPageProps {
  selectedAssignment: Assignment | null
  onSelectAssignment: (assignment: Assignment) => void
  onAssignmentUpdated: (assignment: Assignment) => void
  onBack: () => void
}

type AssignmentView = 'manage' | 'evaluate'

export default function AssignmentListPage({
  selectedAssignment,
  onSelectAssignment,
  onAssignmentUpdated,
  onBack,
}: AssignmentListPageProps) {
  const [view, setView] = useState<AssignmentView>('manage')
  const [newAssignment, setNewAssignment] = useState<Assignment | null>(null)

  const handleSetupComplete = (updated: Assignment) => {
    setNewAssignment(null)
    onSelectAssignment(updated)
  }

  // Show setup page for newly created assignment
  if (newAssignment) {
    return (
      <div className="space-y-4">
        <QuestionSetupPage assignment={newAssignment} onComplete={handleSetupComplete} />
      </div>
    )
  }

  if (selectedAssignment) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          ← Back to Assignments
        </button>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold">{selectedAssignment.title}</h2>
            {selectedAssignment.course && (
              <p className="text-gray-600">{selectedAssignment.course}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Total Marks: {selectedAssignment.totalMarks} • Questions: {selectedAssignment.questions.length}
            </p>

            {/* Tab Navigation */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setView('manage')}
                className={`px-4 py-2 rounded font-medium transition ${
                  view === 'manage'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manage Questions
              </button>
              <button
                onClick={() => setView('evaluate')}
                className={`px-4 py-2 rounded font-medium transition ${
                  view === 'evaluate'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Evaluate Submission
              </button>
            </div>
          </div>

          {view === 'manage' ? (
            <QuestionManager assignment={selectedAssignment} onUpdate={onAssignmentUpdated} />
          ) : (
            <EvaluationPage assignment={selectedAssignment} onBack={() => setView('manage')} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Assignments</h2>
      <AssignmentList onSelect={onSelectAssignment} onCreateNew={setNewAssignment} />
    </div>
  )
}
