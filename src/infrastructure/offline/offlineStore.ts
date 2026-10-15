import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Book } from '@/domain/models'

const DB_NAME = 'between-the-page'
const DB_VERSION = 2

export interface StoredChapter {
  key: string // "<bookId>:<chapterNumber>"
  bookId: string
  number: number
  title: string
  content: string
  bytes: number
  savedAt: number
}

export interface StoredBook {
  id: string
  book: Book
  savedAt: number
}

export interface ChapterInfo {
  number: number
  title: string
  bytes: number
}

// A chapter finished without a connection, waiting to be sent.
export interface PendingRead {
  key: string // "<bookId>:<chapterNumber>"
  bookId: string
  chapterNumber: number
  readAt: number // when it was finished, in milliseconds
}

interface OfflineDb extends DBSchema {
  books: { key: string; value: StoredBook }
  chapters: { key: string; value: StoredChapter; indexes: { 'by-book': string } }
  pendingReads: { key: string; value: PendingRead }
}

let dbPromise: Promise<IDBPDatabase<OfflineDb>> | null = null

function getDb(): Promise<IDBPDatabase<OfflineDb>> {
  if (!dbPromise) {
    const opening = openDB<OfflineDb>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('books', { keyPath: 'id' })
          const chapters = db.createObjectStore('chapters', { keyPath: 'key' })
          chapters.createIndex('by-book', 'bookId')
        }
        if (oldVersion < 2) {
          db.createObjectStore('pendingReads', { keyPath: 'key' })
        }
      },
    })
    // If opening fails, a later call is allowed to try again.
    opening.catch(() => {
      dbPromise = null
    })
    dbPromise = opening
  }
  return dbPromise
}

// Asks the browser not to delete saved chapters when the phone is low on space.
export async function requestPersistentStorage(): Promise<void> {
  try {
    await navigator.storage?.persist?.()
  } catch {
    // not available, and not important
  }
}

export async function saveBookSnapshot(book: Book): Promise<void> {
  const db = await getDb()
  await db.put('books', { id: book.id, book, savedAt: Date.now() })
}

export async function saveChapter(
  bookId: string,
  number: number,
  title: string,
  content: string,
): Promise<void> {
  const db = await getDb()
  await db.put('chapters', {
    key: `${bookId}:${number}`,
    bookId,
    number,
    title,
    content,
    bytes: new TextEncoder().encode(content).length,
    savedAt: Date.now(),
  })
}

export async function getStoredBook(bookId: string): Promise<StoredBook | undefined> {
  const db = await getDb()
  return db.get('books', bookId)
}

export async function getStoredChapter(
  bookId: string,
  number: number,
): Promise<StoredChapter | undefined> {
  const db = await getDb()
  return db.get('chapters', `${bookId}:${number}`)
}

export async function listStoredChapterNumbers(bookId: string): Promise<number[]> {
  const db = await getDb()
  const keys = await db.getAllKeysFromIndex('chapters', 'by-book', bookId)
  return keys.map((key) => Number(key.split(':').pop())).filter((n) => Number.isInteger(n))
}

export async function listStoredBooks(): Promise<StoredBook[]> {
  const db = await getDb()
  return db.getAll('books')
}

export async function listChapterInfo(bookId: string): Promise<ChapterInfo[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('chapters', 'by-book', bookId)
  return all
    .map(({ number, title, bytes }) => ({ number, title, bytes }))
    .sort((a, b) => a.number - b.number)
}

export async function deleteBook(bookId: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['books', 'chapters'], 'readwrite')
  const chapters = tx.objectStore('chapters')
  const keys = await chapters.index('by-book').getAllKeys(bookId)
  await Promise.all([
    ...keys.map((key) => chapters.delete(key)),
    tx.objectStore('books').delete(bookId),
    tx.done,
  ])
}

// Clears the saved books and chapters. Reads waiting to sync are kept.
export async function clearAll(): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['books', 'chapters'], 'readwrite')
  await Promise.all([tx.objectStore('books').clear(), tx.objectStore('chapters').clear(), tx.done])
}

// If the same chapter is finished twice before syncing, the earlier time is kept.
export async function queuePendingRead(
  bookId: string,
  chapterNumber: number,
  readAt: number,
): Promise<void> {
  const db = await getDb()
  const key = `${bookId}:${chapterNumber}`
  const existing = await db.get('pendingReads', key)
  if (existing && existing.readAt <= readAt) return
  await db.put('pendingReads', { key, bookId, chapterNumber, readAt })
}

export async function listPendingReads(): Promise<PendingRead[]> {
  const db = await getDb()
  const all = await db.getAll('pendingReads')
  return all.sort((a, b) => a.readAt - b.readAt)
}

export async function removePendingRead(key: string): Promise<void> {
  const db = await getDb()
  await db.delete('pendingReads', key)
}

export async function countPendingReads(): Promise<number> {
  const db = await getDb()
  return db.count('pendingReads')
}

export async function clearPendingReads(): Promise<void> {
  const db = await getDb()
  await db.clear('pendingReads')
}