import type { Book } from '../models'
import { getUnlockedChapterCount } from './unlock'

// The unlocked chapters that haven't been saved to the device yet.
export function getMissingDownloads(
  book: Book,
  savedNumbers: number[],
  now: Date = new Date(),
): number[] {
  const saved = new Set(savedNumbers)
  const unlocked = getUnlockedChapterCount(book, now)
  const missing: number[] = []
  for (let number = 1; number <= unlocked; number += 1) {
    if (!saved.has(number)) missing.push(number)
  }
  return missing
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
}