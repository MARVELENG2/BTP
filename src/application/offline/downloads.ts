import type { Book, Chapter } from '@/domain/models'
import { getMissingDownloads } from '@/domain/rules/downloads'
import { getUnlockedChapterCount } from '@/domain/rules/unlock'
import { isSignedIn } from '@/infrastructure/auth/sessionRepository'
import { fetchChapterContent, fetchChapterList } from '@/infrastructure/database/bookRepository'
import {
  clearAll,
  deleteBook,
  getStoredBook,
  getStoredChapter,
  listChapterInfo,
  listStoredBooks,
  listStoredChapterNumbers,
  requestPersistentStorage,
  saveBookSnapshot,
  saveChapter,
  type ChapterInfo,
} from '@/infrastructure/offline/offlineStore'
import { withTimeout } from '@/shared/utils/withTimeout'

const TIMEOUT_MESSAGE = 'The connection is too slow. Please try again.'

export interface DownloadProgress {
  label: string
  percent: number | null
}

export interface DownloadStatus {
  downloaded: number
  available: number
}

export interface DownloadResult {
  ok: boolean
  saved: number
  message?: string
}

export interface DownloadedBookItem {
  book: Book
  chapters: ChapterInfo[]
  bytes: number
  savedAt: number
}

export async function getDownloadStatus(book: Book): Promise<DownloadStatus> {
  const available = getUnlockedChapterCount(book)
  try {
    const missing = getMissingDownloads(book, await listStoredChapterNumbers(book.id))
    return { downloaded: available - missing.length, available }
  } catch {
    return { downloaded: 0, available }
  }
}

// Saves every unlocked chapter that isn't on the device yet.
export async function downloadUnlockedChapters(
  book: Book,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<DownloadResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { ok: false, saved: 0, message: "You're offline. Connect to the internet to download." }
  }
  if (!(await isSignedIn())) {
    return { ok: false, saved: 0, message: 'Please log in to download chapters.' }
  }

  let saved = 0
  try {
    const missing = getMissingDownloads(book, await listStoredChapterNumbers(book.id))
    if (missing.length === 0) return { ok: true, saved: 0 }

    await requestPersistentStorage()
    await saveBookSnapshot(book)
    const list = await withTimeout(fetchChapterList(book.id), 20_000, TIMEOUT_MESSAGE)

    for (const number of missing) {
      onProgress?.({
        label: `Downloading ${saved + 1} of ${missing.length}…`,
        percent: Math.round((saved / missing.length) * 100),
      })

      const summary = list.find((chapter) => chapter.number === number)
      const content = summary
        ? await withTimeout(fetchChapterContent(summary.id), 30_000, TIMEOUT_MESSAGE)
        : null

      if (!summary || content === null) {
        return {
          ok: false,
          saved,
          message: `Chapter ${number} couldn't be downloaded. Check your connection and try again.`,
        }
      }
      await saveChapter(book.id, number, summary.title, content)
      saved += 1
    }

    onProgress?.({ label: 'Saved', percent: 100 })
    return { ok: true, saved }
  } catch (error) {
    return {
      ok: false,
      saved,
      message: error instanceof Error ? error.message : 'The download failed. Please try again.',
    }
  }
}

// A chapter saved on this device, with the book it belongs to. Null if it isn't saved.
export async function loadDownloadedChapter(
  bookId: string,
  chapterNumber: number,
): Promise<{ book: Book; chapter: Chapter } | null> {
  const [stored, storedBook] = await Promise.all([
    getStoredChapter(bookId, chapterNumber),
    getStoredBook(bookId),
  ])
  if (!stored || !storedBook) return null

  return {
    book: storedBook.book,
    chapter: {
      id: stored.key,
      bookId,
      number: stored.number,
      title: stored.title,
      content: stored.content,
    },
  }
}

export async function listDownloads(): Promise<DownloadedBookItem[]> {
  try {
    const stored = await listStoredBooks()
    const items = await Promise.all(
      stored.map(async (entry) => {
        const chapters = await listChapterInfo(entry.id)
        return {
          book: entry.book,
          chapters,
          bytes: chapters.reduce((sum, chapter) => sum + chapter.bytes, 0),
          savedAt: entry.savedAt,
        }
      }),
    )
    return items.filter((item) => item.chapters.length > 0).sort((a, b) => b.savedAt - a.savedAt)
  } catch {
    return []
  }
}

export async function removeDownloads(bookId: string): Promise<void> {
  try {
    await deleteBook(bookId)
  } catch {
    // nothing to remove
  }
}

// Used when someone logs out, and by "Remove all".
export async function clearAllDownloads(): Promise<void> {
  try {
    await clearAll()
  } catch {
    // nothing to clear
  }
}