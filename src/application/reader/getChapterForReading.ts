import { loadDownloadedChapter } from '@/application/offline/downloads'
import type { Book, Chapter } from '@/domain/models'
import { getChapterUnlockAt } from '@/domain/rules/chapterUnlock'
import { isChapterUnlocked } from '@/domain/rules/unlock'
import { isSignedIn } from '@/infrastructure/auth/sessionRepository'
import {
  fetchBook,
  fetchChapterContent,
  fetchChapterSummary,
} from '@/infrastructure/database/bookRepository'
import { withTimeout } from '@/shared/utils/withTimeout'

const LOOKUP_TIMEOUT_MS = 8_000

export interface OpenChapter {
  status: 'open'
  book: Book
  chapter: Chapter
  previousChapter: number | null
  nextChapter: number | null
  nextUnlocked: boolean
  nextUnlockAt: Date | null
}

export interface LockedChapter {
  status: 'locked'
  book: Book
  chapterNumber: number
  title: string
  preview: string
  unlockAt: Date
}

export interface LoginRequiredChapter {
  status: 'login-required'
  book: Book
  chapterNumber: number
}

export interface MissingChapter {
  status: 'not-found'
  // true when the chapter couldn't be reached and isn't saved on the device
  offline?: boolean
}

export type ChapterAccess =
  | OpenChapter
  | LockedChapter
  | LoginRequiredChapter
  | MissingChapter

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

function buildOpenChapter(book: Book, chapter: Chapter, now: Date): OpenChapter {
  const number = chapter.number
  const next = number < book.totalChapters ? number + 1 : null

  return {
    status: 'open',
    book,
    chapter,
    previousChapter: number > 1 ? number - 1 : null,
    nextChapter: next,
    nextUnlocked: next !== null && isChapterUnlocked(book, next, now),
    nextUnlockAt: next !== null ? getChapterUnlockAt(book, next) : null,
  }
}

// The copy saved on this device, if there is one.
async function openFromDownload(
  bookId: string,
  chapterNumber: number,
  now: Date,
): Promise<OpenChapter | null> {
  try {
    const saved = await loadDownloadedChapter(bookId, chapterNumber)
    return saved ? buildOpenChapter(saved.book, saved.chapter, now) : null
  } catch {
    return null
  }
}

export async function getChapterForReading(
  bookId: string,
  chapterNumber: number,
  now: Date = new Date(),
): Promise<ChapterAccess> {
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) return { status: 'not-found' }

  // No connection: only chapters saved on the device can be opened.
  if (!isOnline()) {
    return (await openFromDownload(bookId, chapterNumber, now)) ?? { status: 'not-found', offline: true }
  }

  const book = await withTimeout(fetchBook(bookId), LOOKUP_TIMEOUT_MS, 'slow').catch(() => null)
  if (!book) {
    // A weak signal can look online. Fall back to the saved copy if there is one.
    return (await openFromDownload(bookId, chapterNumber, now)) ?? { status: 'not-found', offline: true }
  }
  if (chapterNumber > book.totalChapters) return { status: 'not-found' }

  const summary = await withTimeout(
    fetchChapterSummary(bookId, chapterNumber),
    LOOKUP_TIMEOUT_MS,
    'slow',
  ).catch(() => null)
  if (!summary) {
    return (await openFromDownload(bookId, chapterNumber, now)) ?? { status: 'not-found' }
  }

  const locked: LockedChapter = {
    status: 'locked',
    book,
    chapterNumber,
    title: summary.title,
    preview: summary.preview,
    unlockAt: getChapterUnlockAt(book, chapterNumber),
  }

  if (!isChapterUnlocked(book, chapterNumber, now)) return locked
  if (!(await isSignedIn())) return { status: 'login-required', book, chapterNumber }

  // The database has the final say: it only returns the text if the chapter is really unlocked.
  const content = await fetchChapterContent(summary.id)
  if (content === null) {
    return (await openFromDownload(bookId, chapterNumber, now)) ?? locked
  }

  return buildOpenChapter(
    book,
    {
      id: summary.id,
      bookId: book.id,
      number: chapterNumber,
      title: summary.title,
      content,
    },
    now,
  )
}