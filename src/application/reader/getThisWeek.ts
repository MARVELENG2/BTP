import type { Book } from '@/domain/models'
import { getNextUnlockAt, getUnlockedChapterCount } from '@/domain/rules/unlock'
import { fetchBooks } from '@/infrastructure/database/bookRepository'

export interface ThisWeek {
  book: Book
  unlockedCount: number
  nextUnlockAt: Date | null
}

export async function getThisWeek(now: Date = new Date()): Promise<ThisWeek | null> {
  const books = await fetchBooks()
  const book = books.find((b) => b.isFeatured) ?? books[0]
  if (!book) return null
  return {
    book,
    unlockedCount: getUnlockedChapterCount(book, now),
    nextUnlockAt: getNextUnlockAt(book, now),
  }
}