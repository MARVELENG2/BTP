import type { BookInput } from '@/domain/rules/bookInput'
import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

export interface WriteResult {
  ok: boolean
  message?: string
}

export interface UploadResult {
  ok: boolean
  url?: string
  message?: string
}

const NOT_CONFIGURED_MESSAGE = 'The app is not connected to the database.'
const NOT_ALLOWED_MESSAGE = 'Nothing was changed. Please check that your account is an admin.'
const STALL_MS = 20_000

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function toRow(input: BookInput, coverUrl?: string) {
  return {
    title: input.title.trim(),
    author: input.author.trim(),
    description: input.description.trim(),
    chapters_per_week: input.chaptersPerWeek,
    unlock_weekday: input.unlockWeekday,
    start_date: input.startDate,
    is_featured: input.isFeatured,
    ...(coverUrl !== undefined ? { cover_url: coverUrl } : {}),
  }
}

// crypto.randomUUID only exists on secure pages (https or localhost), not on a phone over http.
function makeFileName(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// Uploads the cover and reports 0-100 as the bytes go out.
// If no data moves for 20 seconds (for example the network dropped), it stops with a clear message.
export async function uploadCoverFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const extension = EXTENSIONS[file.type]
  if (!extension) return { ok: false, message: 'The cover must be a JPG, PNG or WebP image.' }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return { ok: false, message: 'Please log in again, then try saving.' }

  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string
  const path = `${makeFileName()}.${extension}`

  return new Promise<UploadResult>((resolve) => {
    const xhr = new XMLHttpRequest()
    let finished = false
    let stallTimer: ReturnType<typeof setTimeout> | undefined

    const finish = (result: UploadResult) => {
      if (finished) return
      finished = true
      clearTimeout(stallTimer)
      resolve(result)
    }

    const armStallTimer = () => {
      clearTimeout(stallTimer)
      stallTimer = setTimeout(() => {
        xhr.abort()
        finish({
          ok: false,
          message:
            'The connection seems to have dropped, so nothing was saved. Check your network and try again.',
        })
      }, STALL_MS)
    }

    xhr.open('POST', `${baseUrl}/storage/v1/object/covers/${path}`)
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
    xhr.setRequestHeader('apikey', apiKey)
    xhr.setRequestHeader('Content-Type', file.type)

    xhr.upload.onprogress = (event) => {
      armStallTimer()
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage.from('covers').getPublicUrl(path)
        finish({ ok: true, url: data.publicUrl })
        return
      }
      let message = 'The cover could not be uploaded.'
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string }
        message = body.message ?? body.error ?? message
      } catch {
        // keep the default message
      }
      finish({ ok: false, message })
    }

    xhr.onerror = () =>
      finish({ ok: false, message: 'The upload failed. Check your network and try again.' })

    armStallTimer()
    xhr.send(file)
  })
}

export async function insertBook(input: BookInput, coverUrl?: string): Promise<WriteResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { data, error } = await supabase
    .from('books')
    .insert(toRow(input, coverUrl))
    .select('id')
  if (error) return { ok: false, message: error.message }
  if (!data || data.length === 0) return { ok: false, message: NOT_ALLOWED_MESSAGE }
  return { ok: true }
}

export async function updateBookRow(
  bookId: string,
  input: BookInput,
  coverUrl?: string,
): Promise<WriteResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { data, error } = await supabase
    .from('books')
    .update(toRow(input, coverUrl))
    .eq('id', bookId)
    .select('id')
  if (error) return { ok: false, message: error.message }
  if (!data || data.length === 0) return { ok: false, message: NOT_ALLOWED_MESSAGE }
  return { ok: true }
}

// Deleting a book also deletes its chapters and their text (the database cascades).
export async function deleteBookRow(bookId: string): Promise<WriteResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { data, error } = await supabase.from('books').delete().eq('id', bookId).select('id')
  if (error) return { ok: false, message: error.message }
  if (!data || data.length === 0) return { ok: false, message: NOT_ALLOWED_MESSAGE }
  return { ok: true }
}