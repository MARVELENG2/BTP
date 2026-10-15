import type { Book } from '../models'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

// The first day chapters unlock: the first unlock weekday on or after the start date.
export function getFirstUnlockAt(book: Book): Date {
  const startDay = startOfUtcDay(new Date(book.startDate))
  const startWeekday = new Date(startDay).getUTCDay()
  const daysToAdd = (book.unlockWeekday - startWeekday + 7) % 7
  return new Date(startDay + daysToAdd * DAY_MS)
}

// How many weekly unlocks have happened so far.
export function getWeeksUnlocked(book: Book, now: Date = new Date()): number {
  const first = getFirstUnlockAt(book).getTime()
  const today = startOfUtcDay(now)
  if (today < first) return 0
  return Math.floor((today - first) / WEEK_MS) + 1
}

export function getUnlockedChapterCount(book: Book, now: Date = new Date()): number {
  const unlocked = book.chaptersPerWeek * getWeeksUnlocked(book, now)
  return Math.min(book.totalChapters, unlocked)
}

export function isChapterUnlocked(
  book: Book,
  chapterNumber: number,
  now: Date = new Date(),
): boolean {
  return chapterNumber >= 1 && chapterNumber <= getUnlockedChapterCount(book, now)
}

// For the countdown on locked chapters. Returns null once the whole book is unlocked.
export function getNextUnlockAt(book: Book, now: Date = new Date()): Date | null {
  if (getUnlockedChapterCount(book, now) >= book.totalChapters) return null
  const first = getFirstUnlockAt(book).getTime()
  return new Date(first + getWeeksUnlocked(book, now) * WEEK_MS)
}