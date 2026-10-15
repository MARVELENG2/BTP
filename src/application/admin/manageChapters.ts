import type { Book } from '@/domain/models'
import {
  makePreview,
  normalizeChapterText,
  titleFromFileName,
  validateChapterInput,
  type ChapterDraft,
} from '@/domain/rules/chapterInput'
import {
  addChapterRow,
  deleteChapterRow,
  updateChapterRow,
} from '@/infrastructure/database/adminChapterRepository'
import {
  fetchBook,
  fetchChapterContent,
  fetchChapterList,
  fetchChapterSummary,
  type ChapterSummary,
} from '@/infrastructure/database/bookRepository'
import { withTimeout } from '@/shared/utils/withTimeout'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const SAVE_TIMEOUT_MS = 30_000
const TIMEOUT_MESSAGE = 'Saving took too long. Check your connection and try again.'

export interface ChapterProgress {
  label: string
  percent: number | null // null = no measurable progress (a quick save)
}

export interface ChapterManager {
  book: Book
  chapters: ChapterSummary[]
}

export interface EditableChapter {
  id: string
  number: number
  title: string
  content: string
}

export interface AddChaptersResult {
  ok: boolean
  added: number
  errors: string[]
}

export interface FileDrafts {
  drafts: ChapterDraft[]
  problems: string[]
}

export async function loadChapterManager(bookId: string): Promise<ChapterManager | null> {
  const [book, chapters] = await Promise.all([fetchBook(bookId), fetchChapterList(bookId)])
  return book ? { book, chapters } : null
}

export async function loadChapterForEdit(
  bookId: string,
  chapterNumber: number,
): Promise<EditableChapter | null> {
  const summary = await fetchChapterSummary(bookId, chapterNumber)
  if (!summary) return null
  const content = await fetchChapterContent(summary.id)
  if (content === null) return null
  return { id: summary.id, number: summary.number, title: summary.title, content }
}

function describeFailure(added: number, total: number, title: string, message?: string): string {
  const reason = message ?? 'Something went wrong. Please try again.'
  if (added === 0) return reason
  return `${added} of ${total} chapters were added. "${title.trim()}" failed: ${reason}`
}

export async function addChapters(
  bookId: string,
  drafts: ChapterDraft[],
  onProgress?: (progress: ChapterProgress) => void,
): Promise<AddChaptersResult> {
  if (drafts.length === 0) return { ok: false, added: 0, errors: ['There are no chapters to add.'] }

  const errors: string[] = []
  drafts.forEach((draft, index) => {
    for (const problem of validateChapterInput(draft)) {
      errors.push(drafts.length > 1 ? `Chapter ${index + 1}: ${problem}` : problem)
    }
  })
  if (errors.length > 0) return { ok: false, added: 0, errors }

  const total = drafts.length
  let added = 0

  for (const draft of drafts) {
    onProgress?.({
      label: total === 1 ? 'Saving chapter…' : `Adding chapter ${added + 1} of ${total}…`,
      percent: total === 1 ? null : Math.round((added / total) * 100),
    })

    const content = normalizeChapterText(draft.content)
    try {
      const result = await withTimeout(
        addChapterRow(bookId, {
          title: draft.title.trim(),
          preview: makePreview(content),
          content,
        }),
        SAVE_TIMEOUT_MS,
        TIMEOUT_MESSAGE,
      )
      if (!result.ok) {
        return { ok: false, added, errors: [describeFailure(added, total, draft.title, result.message)] }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined
      return { ok: false, added, errors: [describeFailure(added, total, draft.title, message)] }
    }
    added += 1
  }

  onProgress?.({ label: 'Saved', percent: 100 })
  return { ok: true, added, errors: [] }
}

export async function saveChapterEdit(
  chapterId: string,
  draft: ChapterDraft,
): Promise<{ ok: boolean; errors: string[] }> {
  const errors = validateChapterInput(draft)
  if (errors.length > 0) return { ok: false, errors }

  const content = normalizeChapterText(draft.content)
  try {
    const result = await withTimeout(
      updateChapterRow(chapterId, {
        title: draft.title.trim(),
        preview: makePreview(content),
        content,
      }),
      SAVE_TIMEOUT_MS,
      TIMEOUT_MESSAGE,
    )
    if (!result.ok) {
      return { ok: false, errors: [result.message ?? 'Something went wrong. Please try again.'] }
    }
    return { ok: true, errors: [] }
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : 'Something went wrong. Please try again.'],
    }
  }
}

// Only the last chapter can be deleted, so chapter numbers never have gaps.
export async function removeChapter(
  bookId: string,
  chapterId: string,
): Promise<{ ok: boolean; message?: string }> {
  const chapters = await fetchChapterList(bookId)
  const last = chapters[chapters.length - 1]
  if (!last || last.id !== chapterId) {
    return { ok: false, message: 'Only the last chapter of a book can be deleted.' }
  }
  try {
    return await withTimeout(deleteChapterRow(chapterId), 20_000, 'Deleting took too long. Try again.')
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Delete failed.' }
  }
}

// Reads uploaded .txt and .md files into chapter drafts, in natural file-name order
// (so "Chapter 2" comes before "Chapter 10").
export async function draftsFromFiles(files: File[]): Promise<FileDrafts> {
  const sorted = [...files].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
  )
  const drafts: ChapterDraft[] = []
  const problems: string[] = []

  for (const file of sorted) {
    if (!/\.(txt|md)$/i.test(file.name)) {
      problems.push(`"${file.name}" was skipped. Only .txt and .md files work for now.`)
      continue
    }
    if (file.size > MAX_FILE_BYTES) {
      problems.push(`"${file.name}" was skipped because it is larger than 2 MB.`)
      continue
    }
    try {
      const content = normalizeChapterText(await file.text())
      if (content === '') {
        problems.push(`"${file.name}" was skipped because it is empty.`)
        continue
      }
      drafts.push({ title: titleFromFileName(file.name), content })
    } catch {
      problems.push(`"${file.name}" could not be read.`)
    }
  }

  return { drafts, problems }
}