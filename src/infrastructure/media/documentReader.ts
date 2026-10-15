import type { RawLine } from '@/domain/rules/documentImport'

interface PdfTextItem {
  str: string
  transform: number[]
  width: number
  height: number
}

interface Group {
  text: string
  x: number
  right: number
  y: number
  size: number
}

// Turns the loose pieces of text on one PDF page into lines.
function pageToLines(items: PdfTextItem[]): RawLine[] {
  const groups: Group[] = []

  for (const item of items) {
    if (typeof item.str !== 'string' || item.str === '') continue
    const x = item.transform[4] ?? 0
    const y = item.transform[5] ?? 0
    const size = item.height || Math.abs(item.transform[3] ?? 0) || 10
    const last = groups[groups.length - 1]

    if (last && Math.abs(last.y - y) < size * 0.5) {
      const needsSpace =
        x - last.right > size * 0.15 && !last.text.endsWith(' ') && !item.str.startsWith(' ')
      last.text += (needsSpace ? ' ' : '') + item.str
      last.right = Math.max(last.right, x + item.width)
    } else {
      groups.push({ text: item.str, x, right: x + item.width, y, size })
    }
  }

  return groups.map((group, index) => ({
    text: group.text,
    x: group.x,
    width: group.right - group.x,
    size: group.size,
    gap: index === 0 ? null : (groups[index - 1]?.y ?? group.y) - group.y,
  }))
}

// The PDF reader is only downloaded when a PDF is actually imported.
export async function readPdfLines(
  file: File,
  onPage?: (page: number, total: number) => void,
): Promise<RawLine[]> {
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default

  const data = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjs.getDocument({ data }).promise
  const lines: RawLine[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    lines.push(...pageToLines(content.items as unknown as PdfTextItem[]))
    onPage?.(pageNumber, pdf.numPages)
  }

  return lines
}

// Word documents come out as plain text with a blank line between paragraphs.
export async function readDocxText(file: File): Promise<string> {
  const loaded = (await import('mammoth')) as typeof import('mammoth') & {
    default?: typeof import('mammoth')
  }
  const mammoth = loaded.default ?? loaded
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return result.value
}