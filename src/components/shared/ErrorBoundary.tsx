import React from 'react'
import Button from './Button'
import Card from './Card'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unknown rendering error',
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Phitron] UI crash captured by ErrorBoundary', {
      error,
      componentStack: errorInfo.componentStack,
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <Card className="max-w-2xl mx-auto p-6 border-red-200 bg-red-50">
            <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-red-800 mb-4">
              The app encountered an unexpected UI error. You can reload and continue.
            </p>
            <p className="text-xs text-red-700 mb-4 break-all">{this.state.errorMessage}</p>
            <Button
              variant="danger"
              onClick={this.handleReload}
            >
              Reload App
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
