import type { ReadingPreferences } from '@/domain/models'
import { normalizePreferences } from '@/domain/rules/preferences'
import {
  readStoredPreferences,
  writeStoredPreferences,
} from '@/infrastructure/storage/preferencesStorage'

export function loadReadingPreferences(): ReadingPreferences {
  return normalizePreferences(readStoredPreferences())
}

export function updateReadingPreferences(
  current: ReadingPreferences,
  patch: Partial<ReadingPreferences>,
): ReadingPreferences {
  const next = normalizePreferences({ ...current, ...patch })
  writeStoredPreferences(next)
  return next
}