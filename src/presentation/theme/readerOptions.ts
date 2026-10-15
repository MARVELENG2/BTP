import type { ReadingFont } from '@/domain/models'

export const FONT_STACKS: Record<ReadingFont, string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  book: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
  mono: "'Courier New', Courier, monospace",
}

export const FONT_OPTIONS: { value: ReadingFont; label: string }[] = [
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans' },
  { value: 'book', label: 'Book' },
  { value: 'mono', label: 'Typewriter' },
]

export const PAGE_COLORS = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#FBF5E6', label: 'Cream' },
  { value: '#F5ECD7', label: 'Parchment' },
  { value: '#E8F3EC', label: 'Mint' },
  { value: '#EDEDED', label: 'Grey' },
]

export const READER_COLORS = {
  day: { text: '#2B2B2B', backdrop: '#E9E1D0', chrome: '#3B2F22' },
  night: { page: '#1B1F1C', text: '#E8E4D9', backdrop: '#0E100F', chrome: '#E8E4D9' },
}