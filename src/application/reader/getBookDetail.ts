import type { Book } from '@/domain/models'
import {
  getNextUnlockAt,
  getUnlockedChapterCount,
  isChapterUnlocked,
} from '@/domain/rules/unlock'
import { fetchBook, fetchChapterList } from '@/infrastructure/database/bookRepository'
import { fetchMyReads } from '@/infrastructure/database/progressRepository'

export interface ChapterListItem {
  number: number
  title: string
  unlocked: boolean
  read: boolean
}

export interface BookDetail {
  book: Book
  chapters: ChapterListItem[]
  unlockedCount: number
  nextUnlockAt: Date | null
}

// Returns null when the book doesn't exist.
export async function getBookDetail(
  bookId: string,
  now: Date = new Date(),
): Promise<BookDetail | null> {
  const [book, list, reads] = await Promise.all([
    fetchBook(bookId),
    fetchChapterList(bookId),
    fetchMyReads(bookId),
  ])
  if (!book) return null

  const readNumbers = new Set(reads.map((read) => read.chapterNumber))

  // The list only carries titles and lock state, never the chapter text.
  const chapters = list.map((chapter) => ({
    number: chapter.number,
    title: chapter.title,
    unlocked: isChapterUnlocked(book, chapter.number, now),
    read: readNumbers.has(chapter.number),
  }))

  return {
    book,
    chapters,
    unlockedCount: getUnlockedChapterCount(book, now),
    nextUnlockAt: getNextUnlockAt(book, now),
  }
}