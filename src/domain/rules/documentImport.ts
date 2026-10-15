import { normalizeChapterText, type ChapterDraft } from './chapterInput'

// One line of text from a PDF page, with the measurements needed to rebuild paragraphs.
export interface RawLine {
  text: string
  x: number // left edge
  width: number
  size: number // font height
  gap: number | null // distance down from the previous line on the same page; null for the first line of a page
}

export interface ImportResult {
  drafts: ChapterDraft[]
  notes: string[]
}

const NUMBER =
  '(?:\\d{1,3}|[ivxlc]{1,8}|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|hundred)'
const HEADING = new RegExp(`^chapter\\s+${NUMBER}\\b[\\s:.\\-–—]*(.*)$`, 'i')
const PAGE_NUMBER = /^\d{1,4}$/

export function isChapterHeading(text: string): boolean {
  return text.length < 100 && HEADING.test(text)
}

function mostCommon(values: number[]): number {
  const counts = new Map<number, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  let best = values[0] ?? 0
  let bestCount = 0
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }
  return best
}

function startsParagraph(
  previous: RawLine,
  line: RawLine,
  margin: number,
  fullWidth: number,
): boolean {
  if (isChapterHeading(line.text) || isChapterHeading(previous.text)) return true
  // A bigger-than-normal space above the line.
  if (line.gap !== null && line.gap > line.size * 1.8) return true
  // An indented first line.
  if (line.x > margin + line.size * 0.8) return true
  // The previous line ended a sentence and stopped short of the right edge.
  if (previous.width < fullWidth * 0.75 && /[.!?"”’)]$/.test(previous.text)) return true
  return false
}

// Joins the wrapped lines of a PDF back into paragraphs separated by a blank line.
export function buildParagraphs(rawLines: RawLine[]): string {
  const lines = rawLines
    .map((line) => ({ ...line, text: line.text.replace(/\s+/g, ' ').trim() }))
    .filter((line) => line.text !== '' && !PAGE_NUMBER.test(line.text))
  if (lines.length === 0) return ''

  const margin = mostCommon(lines.map((line) => Math.round(line.x / 2) * 2))
  const widths = lines.map((line) => line.width).sort((a, b) => a - b)
  const fullWidth = widths[Math.floor(widths.length * 0.9)] ?? 0

  const paragraphs: string[] = []
  let current = ''
  let previous: RawLine | null = null

  for (const line of lines) {
    if (previous === null || startsParagraph(previous, line, margin, fullWidth)) {
      if (current) paragraphs.push(current)
      current = line.text
    } else if (/[a-z]-$/i.test(current) && /^[a-z]/.test(line.text)) {
      // A word split across two lines: "inter-" + "national"
      current = current.slice(0, -1) + line.text
    } else {
      current = `${current} ${line.text}`
    }
    previous = line
  }
  if (current) paragraphs.push(current)

  return paragraphs.join('\n\n')
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

interface Section {
  title: string
  body: string[]
}

// Splits a whole book's text into chapters at "Chapter N" headings.
export function splitIntoChapters(text: string, fallbackTitle: string): ImportResult {
  const normalized = normalizeChapterText(text)
  if (normalized === '') return { drafts: [], notes: ['No text could be found in this file.'] }

  const blocks = normalized.split('\n\n')
  const sections: Section[] = []
  let current: Section | null = null
  let frontMatter = 0

  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i] ?? ''
    const match = block.length < 100 ? HEADING.exec(block) : null

    if (match) {
      let title = (match[1] ?? '').trim()
      if (title === '') {
        // "Chapter 1" on its own line, with the title on the next line.
        const next = blocks[i + 1]
        if (
          next !== undefined &&
          next.length <= 60 &&
          !/[.!?,;:"”’]$/.test(next) &&
          !HEADING.test(next)
        ) {
          title = next
          i += 1
        }
      }
      current = { title: title || block.trim(), body: [] }
      sections.push(current)
    } else if (current) {
      current.body.push(block)
    } else {
      frontMatter += 1
    }
  }

  const kept = sections.filter((section) => section.body.length > 0)
  if (kept.length === 0) {
    return {
      drafts: [{ title: fallbackTitle, content: normalized }],
      notes: [
        'No "Chapter 1"-style headings were found, so the whole file is loaded as a single chapter.',
      ],
    }
  }

  const notes = [`Found ${plural(kept.length, 'chapter')}. Check the titles below before adding.`]
  if (frontMatter > 0) {
    notes.push(
      `${plural(frontMatter, 'paragraph')} before the first chapter heading ${
        frontMatter === 1 ? 'was' : 'were'
      } skipped (title page, contents and so on).`,
    )
  }
  const empty = sections.length - kept.length
  if (empty > 0) {
    notes.push(
      `${plural(empty, 'heading')} with no text under ${empty === 1 ? 'it' : 'them'} ${
        empty === 1 ? 'was' : 'were'
      } skipped (probably a table of contents).`,
    )
  }

  return {
    drafts: kept.map((section) => ({ title: section.title, content: section.body.join('\n\n') })),
    notes,
  }
}