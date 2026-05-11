import React, { useState } from 'react'
import Button from '../shared/Button'
import Card from '../shared/Card'

export interface SubmissionInfo {
  studentName: string
  assignmentName: string
  submissionDate?: string
  colabLink?: string
  email?: string
  notes?: string
}

interface SubmissionInfoFormProps {
  onSubmit: (info: SubmissionInfo) => void
  onCancel?: () => void
  initialData?: Partial<SubmissionInfo>
}

export const SubmissionInfoForm: React.FC<SubmissionInfoFormProps> = ({ 
  onSubmit, 
  onCancel,
  initialData 
}) => {
  const [formData, setFormData] = useState<SubmissionInfo>({
    studentName: initialData?.studentName || '',
    assignmentName: initialData?.assignmentName || '',
    submissionDate: initialData?.submissionDate || '',
    colabLink: initialData?.colabLink || '',
    email: initialData?.email || '',
    notes: initialData?.notes || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required'
    }
    if (!formData.assignmentName.trim()) {
      newErrors.assignmentName = 'Assignment name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm">
      <div className="bg-blue-600 text-white py-3 px-4 rounded-t-lg">
        <strong>📋 Enter Submission Information</strong>
      </div>
      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
          <strong>Tip:</strong> Copy submission details from the Phitron assignment modal (student name, 
          assignment name, submission date, and Colab link).
        </div>

        <form onSubmit={handleSubmit}>
          {/* Student Name */}
          <div className="mb-4">
            <label htmlFor="studentName" className="block font-semibold text-sm mb-2">
              👤 Student Name <span className="text-red-500">*</span>
            </label>
            <input
              id="studentName"
              type="text"
              name="studentName"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.studentName ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="e.g., Md. Sakline Hossen"
              value={formData.studentName}
              onChange={handleChange}
            />
            {errors.studentName && (
              <p className="text-red-600 text-xs mt-1">{errors.studentName}</p>
            )}
          </div>

          {/* Assignment Name */}
          <div className="mb-4">
            <label htmlFor="assignmentName" className="block font-semibold text-sm mb-2">
              📝 Assignment Name <span className="text-red-500">*</span>
            </label>
            <input
              id="assignmentName"
              type="text"
              name="assignmentName"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.assignmentName ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="e.g., DL Final Exam"
              value={formData.assignmentName}
              onChange={handleChange}
            />
            {errors.assignmentName && (
              <p className="text-red-600 text-xs mt-1">{errors.assignmentName}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block font-semibold text-sm mb-2">
              ✉️ Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="student@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Submission Date */}
          <div className="mb-4">
            <label htmlFor="submissionDate" className="block font-semibold text-sm mb-2">
              📅 Submission Date
            </label>
            <input
              id="submissionDate"
              type="text"
              name="submissionDate"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 30 Apr, 2026 11:11 PM"
              value={formData.submissionDate}
              onChange={handleChange}
            />
          </div>

          {/* Colab Link */}
          <div className="mb-4">
            <label htmlFor="colabLink" className="block font-semibold text-sm mb-2">
              🔗 Colab Link
            </label>
            <input
              id="colabLink"
              type="url"
              name="colabLink"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://colab.research.google.com/..."
              value={formData.colabLink}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label htmlFor="notes" className="block font-semibold text-sm mb-2">
              📌 Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any additional notes about this submission..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-grow py-2"
            >
              ✅ Proceed with Evaluation
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="px-4 py-2"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
