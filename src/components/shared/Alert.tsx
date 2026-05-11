import React from 'react'

interface AlertProps {
  variant?: 'error' | 'success' | 'info' | 'warning'
  message: string
  onDismiss?: () => void
  actionLabel?: string
  onAction?: () => void
  className?: string
}

function getStyles(variant: NonNullable<AlertProps['variant']>) {
  if (variant === 'success') {
    return {
      container: 'bg-green-100 border-green-200 text-green-800',
      action: 'bg-green-600 text-white hover:bg-green-700',
    }
  }

  if (variant === 'warning') {
    return {
      container: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      action: 'bg-yellow-600 text-white hover:bg-yellow-700',
    }
  }

  if (variant === 'info') {
    return {
      container: 'bg-blue-100 border-blue-200 text-blue-800',
      action: 'bg-blue-600 text-white hover:bg-blue-700',
    }
  }

  return {
    container: 'bg-red-100 border-red-200 text-red-800',
    action: 'bg-red-600 text-white hover:bg-red-700',
  }
}

export default function Alert({
  variant = 'error',
  message,
  onDismiss,
  actionLabel,
  onAction,
  className = '',
}: AlertProps) {
  const styles = getStyles(variant)

  return (
    <div className={`p-3 rounded border text-sm ${styles.container} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1">{message}</p>

        {(onDismiss || (actionLabel && onAction)) && (
          <div className="flex gap-2 shrink-0">
            {actionLabel && onAction && (
              <button
                type="button"
                onClick={onAction}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${styles.action}`}
              >
                {actionLabel}
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="underline hover:no-underline text-xs"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
