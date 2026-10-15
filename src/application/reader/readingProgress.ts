import type { Badge, Book } from '@/domain/models'
import { getEarnedBadges } from '@/domain/rules/badges'
import {
  getCompletedWeeks,
  getNextChapterToRead,
  summarizeBookProgress,
} from '@/domain/rules/progress'
import { calculateStreak, type StreakResult } from '@/domain/rules/streak'
import { isSignedIn } from '@/infrastructure/auth/sessionRepository'
import { fetchBooks } from '@/infrastructure/database/bookRepository'
import { fetchMyReads, recordChapterRead } from '@/infrastructure/database/progressRepository'
import {
  clearPendingReads,
  countPendingReads,
  listPendingReads,
  queuePendingRead,
  removePendingRead,
} from '@/infrastructure/offline/offlineStore'

export interface BookProgressItem {
  book: Book
  chaptersRead: number
  completed: boolean
  nextChapter: number | null
}

export interface ReadingSummary {
  streak: StreakResult
  badges: Badge[]
  books: BookProgressItem[]
}

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

let flushing = false

// Sends the chapters finished offline, oldest first. Returns how many were recorded.
export async function flushPendingReads(): Promise<number> {
  if (flushing || !isOnline()) return 0
  flushing = true

  let synced = 0
  try {
    if (!(await isSignedIn())) return 0

    for (const read of await listPendingReads()) {
      const outcome = await recordChapterRead(read.bookId, read.chapterNumber, new Date(read.readAt))
      // Still no connection: stop here and try again later.
      if (outcome === 'network') break
      // Saved, or refused for good: either way it doesn't need to stay in the queue.
      await removePendingRead(read.key)
      if (outcome === 'saved') synced += 1
    }
  } catch {
    // it will be tried again later
  } finally {
    flushing = false
  }
  return synced
}

// Progress is best-effort: if saving fails, reading carries on undisturbed.
export async function markChapterRead(bookId: string, chapterNumber: number): Promise<void> {
  const readAt = new Date()
  try {
    const outcome = isOnline() ? await recordChapterRead(bookId, chapterNumber, readAt) : 'network'

    if (outcome === 'network') {
      // Remember it on the device, with the real time, and send it when the connection is back.
      await queuePendingRead(bookId, chapterNumber, readAt.getTime())
    } else {
      // The connection works, so send anything that was waiting too.
      flushPendingReads()
    }
  } catch {
    // ignored on purpose
  }
}

export async function getPendingReadCount(): Promise<number> {
  try {
    return await countPendingReads()
  } catch {
    return 0
  }
}

// Used at logout: reads waiting to sync belong to the account that is leaving.
export async function discardPendingReads(): Promise<void> {
  try {
    await clearPendingReads()
  } catch {
    // nothing to clear
  }
}

// Returns null when nobody is signed in.
export async function getReadingSummary(now: Date = new Date()): Promise<ReadingSummary | null> {
  if (!(await isSignedIn())) return null

  const [books, reads] = await Promise.all([fetchBooks(), fetchMyReads()])

  const items: BookProgressItem[] = books.map((book) => {
    const bookReads = reads.filter((read) => read.bookId === book.id)
    const { chaptersRead, completed } = summarizeBookProgress(book, bookReads)
    return {
      book,
      chaptersRead,
      completed,
      nextChapter: completed ? null : getNextChapterToRead(book, bookReads, now),
    }
  })

  // Books in progress first, finished ones after.
  const started = items
    .filter((item) => item.chaptersRead > 0)
    .sort((a, b) => Number(a.completed) - Number(b.completed))

  return {
    streak: calculateStreak(getCompletedWeeks(reads), now),
    badges: getEarnedBadges(items.filter((item) => item.completed).map((item) => item.book)),
    books: started,
  }
}