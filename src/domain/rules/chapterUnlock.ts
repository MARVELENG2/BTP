import type { Book } from '../models'
import { getFirstUnlockAt } from './unlock'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function getChapterUnlockAt(book: Book, chapterNumber: number): Date {
  const unlocksNeeded = Math.max(1, Math.ceil(chapterNumber / book.chaptersPerWeek))
  return new Date(getFirstUnlockAt(book).getTime() + (unlocksNeeded - 1) * WEEK_MS)
}