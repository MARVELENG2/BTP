import type { Book, Weekday } from '@/domain/models'
import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

const BOOK_COLUMNS =
  'id, title, author, description, cover_url, chapters_per_week, unlock_weekday, start_date, is_featured, chapters(count)'

interface BookRow {
  id: string
  title: string
  author: string
  description: string
  cover_url: string
  chapters_per_week: number
  unlock_weekday: number
  start_date: string
  is_featured: boolean
  chapters: { count: number }[]
}

export interface ChapterSummary {
  id: string
  number: number
  title: string
  preview: string
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    coverUrl: row.cover_url,
    totalChapters: row.chapters[0]?.count ?? 0,
    chaptersPerWeek: row.chapters_per_week,
    unlockWeekday: row.unlock_weekday as Weekday,
    startDate: row.start_date,
    isFeatured: row.is_featured,
  }
}

export async function fetchBooks(): Promise<Book[]> {
  if (!isBackendConfigured) return []
  const { data, error } = await supabase
    .from('books')
    .select(BOOK_COLUMNS)
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return (data as unknown as BookRow[]).map(toBook)
}

export async function fetchBook(bookId: string): Promise<Book | null> {
  if (!isBackendConfigured) return null
  const { data, error } = await supabase
    .from('books')
    .select(BOOK_COLUMNS)
    .eq('id', bookId)
    .maybeSingle()
  if (error || !data) return null
  return toBook(data as unknown as BookRow)
}

export async function fetchChapterList(bookId: string): Promise<ChapterSummary[]> {
  if (!isBackendConfigured) return []
  const { data, error } = await supabase
    .from('chapters')
    .select('id, number, title, preview')
    .eq('book_id', bookId)
    .order('number', { ascending: true })
  if (error || !data) return []
  return data as unknown as ChapterSummary[]
}

export async function fetchChapterSummary(
  bookId: string,
  number: number,
): Promise<ChapterSummary | null> {
  if (!isBackendConfigured) return null
  const { data, error } = await supabase
    .from('chapters')
    .select('id, number, title, preview')
    .eq('book_id', bookId)
    .eq('number', number)
    .maybeSingle()
  if (error || !data) return null
  return data as unknown as ChapterSummary
}

// Returns null when the database refuses to share the text (not signed in, or still locked).
export async function fetchChapterContent(chapterId: string): Promise<string | null> {
  if (!isBackendConfigured) return null
  const { data, error } = await supabase
    .from('chapter_contents')
    .select('content')
    .eq('chapter_id', chapterId)
    .maybeSingle()
  if (error || !data) return null
  return (data as unknown as { content: string }).content
}