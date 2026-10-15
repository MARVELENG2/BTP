import { titleFromFileName } from '@/domain/rules/chapterInput'
import {
  buildParagraphs,
  splitIntoChapters,
  type ImportResult,
} from '@/domain/rules/documentImport'
import { readDocxText, readPdfLines } from '@/infrastructure/media/documentReader'

const MAX_DOCUMENT_BYTES = 30 * 1024 * 1024

export interface ImportProgress {
  label: string
  percent: number | null // null = no measurable progress
}

function fail(note: string): ImportResult {
  return { drafts: [], notes: [note] }
}

export async function importChaptersFromDocument(
  file: File,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const name = file.name.toLowerCase()
  const isPdf = name.endsWith('.pdf')
  const isDocx = name.endsWith('.docx')

  if (!isPdf && !isDocx) {
    return fail(
      name.endsWith('.doc')
        ? 'Old .doc files are not supported. In Word, choose Save As, pick .docx, then try again.'
        : 'Please choose a .pdf or .docx file.',
    )
  }
  if (file.size > MAX_DOCUMENT_BYTES) return fail('That file is larger than 30 MB.')

  try {
    let text: string

    if (isPdf) {
      const lines = await readPdfLines(file, (page, total) =>
        onProgress?.({
          label: `Reading page ${page} of ${total}…`,
          percent: Math.round((page / total) * 100),
        }),
      )
      text = buildParagraphs(lines)
      if (text === '') {
        return fail(
          'No text was found in this PDF. It may be pictures of pages (a scan), which cannot be read yet.',
        )
      }
    } else {
      onProgress?.({ label: 'Reading document…', percent: null })
      text = await readDocxText(file)
    }

    onProgress?.({ label: 'Finding chapters…', percent: null })
    return splitIntoChapters(text, titleFromFileName(file.name))
  } catch {
    return fail('This file could not be read. It may be damaged or password-protected.')
  }
}