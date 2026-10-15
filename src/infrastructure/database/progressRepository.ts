import type { ChapterRead } from '@/domain/rules/progress'
import { isSignedIn } from '@/infrastructure/auth/sessionRepository'
import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

interface ReadRow {
  book_id: string
  chapter_number: number
  read_at: string
}

// saved    = the database recorded it
// rejected = the database refused it, and trying again won't help
// network  = it couldn't be reached, so it should be tried again later
export type RecordOutcome = 'saved' | 'rejected' | 'network'

// The database checks that the chapter is really unlocked before it records anything.
export async function recordChapterRead(
  bookId: string,
  chapterNumber: number,
  readAt: Date = new Date(),
): Promise<RecordOutcome> {
  if (!isBackendConfigured) return 'rejected'

  try {
    const { error } = await supabase.rpc('mark_chapter_read', {
      p_book_id: bookId,
      p_chapter_number: chapterNumber,
      p_read_at: readAt.toISOString(),
    })
    if (!error) return 'saved'
    // No code means the request never got an answer. PGRST3xx means the login needs refreshing.
    if (!error.code || error.code.startsWith('PGRST3')) return 'network'
    return 'rejected'
  } catch {
    return 'network'
  }
}

// The signed-in reader's finished chapters, for one book or for all of them.
export async function fetchMyReads(bookId?: string): Promise<ChapterRead[]> {
  if (!isBackendConfigured || !(await isSignedIn())) return []

  let query = supabase.from('chapter_reads').select('book_id, chapter_number, read_at')
  if (bookId) query = query.eq('book_id', bookId)

  const { data, error } = await query
  if (error || !data) return []

  return (data as unknown as ReadRow[]).map((row) => ({
    bookId: row.book_id,
    chapterNumber: row.chapter_number,
    readAt: new Date(row.read_at),
  }))
}