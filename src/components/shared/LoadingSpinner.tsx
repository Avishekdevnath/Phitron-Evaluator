import React from 'react'

interface LoadingSpinnerProps {
  label?: string
  inline?: boolean
}

export default function LoadingSpinner({
  label = 'Loading...',
  inline = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center gap-3 text-sm text-gray-600 ${
        inline ? '' : 'p-4 justify-center'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
      <span>{label}</span>
    </div>
  )
}
