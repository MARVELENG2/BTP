import type { ReadingPreferences } from '@/domain/models'

const KEY = 'btp-reading-preferences'

export function readStoredPreferences(): unknown {
  try {
    const text = localStorage.getItem(KEY)
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

export function writeStoredPreferences(preferences: ReadingPreferences): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(preferences))
  } catch {
    // storage unavailable; settings just won't be remembered
  }
}