import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

export interface ChapterWrite {
  title: string
  preview: string
  content: string
}

export interface ChapterWriteResult {
  ok: boolean
  message?: string
}

const NOT_CONFIGURED_MESSAGE = 'The app is not connected to the database.'

export async function addChapterRow(
  bookId: string,
  chapter: ChapterWrite,
): Promise<ChapterWriteResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { error } = await supabase.rpc('add_chapter', {
    p_book_id: bookId,
    p_title: chapter.title,
    p_preview: chapter.preview,
    p_content: chapter.content,
  })
  if (error) return { ok: false, message: error.message }
  return { ok: true }
}

export async function updateChapterRow(
  chapterId: string,
  chapter: ChapterWrite,
): Promise<ChapterWriteResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { error } = await supabase.rpc('update_chapter', {
    p_chapter_id: chapterId,
    p_title: chapter.title,
    p_preview: chapter.preview,
    p_content: chapter.content,
  })
  if (error) return { ok: false, message: error.message }
  return { ok: true }
}

export async function deleteChapterRow(chapterId: string): Promise<ChapterWriteResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { data, error } = await supabase.from('chapters').delete().eq('id', chapterId).select('id')
  if (error) return { ok: false, message: error.message }
  if (!data || data.length === 0) {
    return { ok: false, message: 'Nothing was deleted. Please check that your account is an admin.' }
  }
  return { ok: true }
}