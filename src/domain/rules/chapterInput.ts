export const MAX_CHAPTER_TITLE_LENGTH = 150
export const MAX_CHAPTER_CHARACTERS = 900_0000000000
export const PREVIEW_LENGTH = 220

export interface ChapterDraft {
  title: string
  content: string
}

// Cleans pasted or uploaded text into paragraphs separated by one blank line.
// Wrapped lines inside a paragraph are joined. If the text has no blank lines at all,
// every line is treated as its own paragraph.
export function normalizeChapterText(raw: string): string {
  const text = raw.replace(/\r\n?/g, '\n').replace(/\u00a0/g, ' ').trim()
  if (text === '') return ''

  const hasBlankLines = /\n\s*\n/.test(text)
  const blocks = hasBlankLines ? text.split(/\n\s*\n/) : text.split('\n')

  return blocks
    .map((block) => block.replace(/\s*\n\s*/g, ' ').replace(/[ \t]+/g, ' ').trim())
    .filter((block) => block.length > 0)
    .join('\n\n')
}

// The short public preview shown (blurred) on a locked chapter.
export function makePreview(content: string, max: number = PREVIEW_LENGTH): string {
  const first = content.split('\n\n')[0] ?? ''
  if (first.length <= max) return first
  const cut = first.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()
}

export function titleFromFileName(fileName: string): string {
  const title = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/_+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return title || 'Untitled chapter'
}

export function validateChapterInput(draft: ChapterDraft): string[] {
  const errors: string[] = []
  const title = draft.title.trim()
  const content = normalizeChapterText(draft.content)

  if (title.length === 0) errors.push('Please enter a chapter title.')
  if (title.length > MAX_CHAPTER_TITLE_LENGTH) {
    errors.push(`The title must be ${MAX_CHAPTER_TITLE_LENGTH} characters or fewer.`)
  }
  if (content.length === 0) errors.push('Please add the chapter text.')
  if (content.length > MAX_CHAPTER_CHARACTERS) {
    errors.push('This chapter is too long. Please split it into two chapters.')
  }
  return errors
}