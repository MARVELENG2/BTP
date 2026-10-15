import type { Book } from '../models'
import { getWeekKey } from './streak'
import { getUnlockedChapterCount } from './unlock'

export interface ChapterRead {
  bookId: string
  chapterNumber: number
  readAt: Date
}

export interface BookProgressSummary {
  chaptersRead: number
  completed: boolean
}

// How much of a book the reader has finished. Only chapters that exist in the book count.
export function summarizeBookProgress(book: Book, reads: ChapterRead[]): BookProgressSummary {
  const readNumbers = new Set(
    reads
      .filter(
        (read) =>
          read.bookId === book.id &&
          read.chapterNumber >= 1 &&
          read.chapterNumber <= book.totalChapters,
      )
      .map((read) => read.chapterNumber),
  )
  return {
    chaptersRead: readNumbers.size,
    completed: book.totalChapters > 0 && readNumbers.size === book.totalChapters,
  }
}

// The weeks that count toward the streak: any week in which a chapter was finished.
// To make the rule stricter later (for example, the full weekly quota), change it here.
export function getCompletedWeeks(reads: ChapterRead[]): number[] {
  return [...new Set(reads.map((read) => getWeekKey(read.readAt)))].sort((a, b) => a - b)
}

// The first unlocked chapter the reader hasn't finished, or null when they're all caught up.
export function getNextChapterToRead(
  book: Book,
  reads: ChapterRead[],
  now: Date = new Date(),
): number | null {
  const readNumbers = new Set(
    reads.filter((read) => read.bookId === book.id).map((read) => read.chapterNumber),
  )
  const unlocked = getUnlockedChapterCount(book, now)
  for (let number = 1; number <= unlocked; number += 1) {
    if (!readNumbers.has(number)) return number
  }
  return null
}