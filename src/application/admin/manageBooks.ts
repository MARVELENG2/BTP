import type { Book } from '@/domain/models'
import {
  validateBookInput,
  validateCoverFile,
  type BookInput,
} from '@/domain/rules/bookInput'
import {
  deleteBookRow,
  insertBook,
  updateBookRow,
  uploadCoverFile,
} from '@/infrastructure/database/adminBookRepository'
import { fetchBook, fetchBooks } from '@/infrastructure/database/bookRepository'
import { compressCover } from '@/infrastructure/media/compressImage'

// Original photos can be big because they are shrunk before upload.
const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024

export interface SaveProgress {
  label: string
  percent: number | null // null = no measurable progress (a quick save)
}

export interface SaveBookParams {
  bookId?: string
  input: BookInput
  coverFile: File | null
  onProgress?: (progress: SaveProgress) => void
}

export interface SaveBookResult {
  ok: boolean
  errors: string[]
}

// Turns a step that never finishes into a clear error instead of an endless spinner.
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

export function listBooksForAdmin(): Promise<Book[]> {
  return fetchBooks()
}

export function loadBookForAdmin(bookId: string): Promise<Book | null> {
  return fetchBook(bookId)
}

export async function saveBook(params: SaveBookParams): Promise<SaveBookResult> {
  const report = (progress: SaveProgress) => params.onProgress?.(progress)

  const errors = validateBookInput(params.input)
  if (params.coverFile) {
    // Only the type is checked here. The size is checked after the image is shrunk.
    errors.push(...validateCoverFile(params.coverFile.type, 0))
    if (params.coverFile.size > MAX_ORIGINAL_BYTES) {
      errors.push('That cover image is too large. Please choose one under 15 MB.')
    }
  }
  if (errors.length > 0) return { ok: false, errors }

  try {
    let coverUrl: string | undefined

    if (params.coverFile) {
      report({ label: 'Preparing cover…', percent: 2 })
      const cover = await compressCover(params.coverFile)

      const sizeErrors = validateCoverFile(cover.type, cover.size)
      if (sizeErrors.length > 0) return { ok: false, errors: sizeErrors }

      report({ label: 'Uploading cover…', percent: 10 })
      const upload = await uploadCoverFile(cover, (percent) =>
        report({ label: 'Uploading cover…', percent: 10 + Math.round(percent * 0.8) }),
      )
      if (!upload.ok || !upload.url) {
        return { ok: false, errors: [upload.message ?? 'The cover could not be uploaded.'] }
      }
      coverUrl = upload.url
    }

    report({ label: 'Saving book…', percent: params.coverFile ? 92 : null })
    const result = await withTimeout(
      params.bookId
        ? updateBookRow(params.bookId, params.input, coverUrl)
        : insertBook(params.input, coverUrl),
      20_000,
      'Saving the book took too long. Check your connection and try again.',
    )

    if (!result.ok) {
      return { ok: false, errors: [result.message ?? 'Something went wrong. Please try again.'] }
    }
    report({ label: 'Saved', percent: 100 })
    return { ok: true, errors: [] }
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : 'Something went wrong. Please try again.'],
    }
  }
}

export async function removeBook(bookId: string): Promise<{ ok: boolean; message?: string }> {
  try {
    return await withTimeout(deleteBookRow(bookId), 20_000, 'Deleting took too long. Try again.')
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Delete failed.' }
  }
}