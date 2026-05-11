import type { EvaluationResult } from '../types/index'

const STORAGE_KEY = 'lastEvaluationResult'

export function loadResult(): Promise<EvaluationResult | null> {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, data => {
      try {
        const raw = data[STORAGE_KEY]
        resolve(raw ? (JSON.parse(raw) as EvaluationResult) : null)
      } catch {
        resolve(null)
      }
    })
  })
}

export function getStorageKey(): string {
  return STORAGE_KEY
}
