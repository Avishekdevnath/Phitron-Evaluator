export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message?.trim()) {
    return error.message
  }
  return fallback
}

export function getFriendlyErrorMessage(error: unknown, fallback: string): string {
  const message = getErrorMessage(error, fallback)
  const normalized = message.toLowerCase()

  if (normalized.includes('api key') || normalized.includes('unauthorized')) {
    return 'Authentication failed. Please verify your API key in Settings and try again.'
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Network issue detected. Please check your internet connection and retry.'
  }

  if (normalized.includes('rate limit') || normalized.includes('429')) {
    return 'Rate limit reached. Please wait a bit and try again.'
  }

  return message
}

export function logAppError(context: string, error: unknown): void {
  console.error(`[Phitron] ${context}`, error)
}
