import React from 'react'
import { Question } from '../../types/index'
import Card from '../shared/Card'
import Button from '../shared/Button'

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
  onDelete: (questionId: string) => void
  onReorder: (questionIds: string[]) => void
}

export default function QuestionList({
  questions,
  onEdit,
  onDelete,
  onReorder,
}: QuestionListProps) {
  function moveQuestion(index: number, direction: 'up' | 'down') {
    const newList = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newList.length) return

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]]
    onReorder(newList.map(q => q.id))
  }

  return (
    <div className="space-y-2">
      {questions.length === 0 ? (
        <Card className="p-4">
          <p className="text-gray-500 text-sm">No questions yet. Add one to get started.</p>
        </Card>
      ) : (
        questions.map((question, index) => (
          <Card key={question.id} className="p-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm">{question.number}.</span>
                  <h4 className="font-semibold text-sm truncate">{question.title}</h4>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{question.prompt}</p>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">Max Marks:</span> {question.maxMarks}
                  {question.answerType && (
                    <>
                      {' • '}
                      <span className="font-medium">Type:</span> {question.answerType}
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {index > 0 && (
                  <Button
                    onClick={() => moveQuestion(index, 'up')}
                    variant="secondary"
                    size="sm"
                    title="Move up"
                  >
                    ↑
                  </Button>
                )}
                {index < questions.length - 1 && (
                  <Button
                    onClick={() => moveQuestion(index, 'down')}
                    variant="secondary"
                    size="sm"
                    title="Move down"
                  >
                    ↓
                  </Button>
                )}
                <Button
                  onClick={() => onEdit(question)}
                  variant="primary"
                  size="sm"
                  title="Edit question"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(question.id)}
                  variant="danger"
                  size="sm"
                  title="Delete question"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
