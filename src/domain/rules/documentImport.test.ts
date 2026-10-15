import { describe, expect, it } from 'vitest'
import { buildParagraphs, splitIntoChapters, type RawLine } from './documentImport'

const line = (text: string, over: Partial<RawLine> = {}): RawLine => ({
  text,
  x: 72,
  width: 400,
  size: 12,
  gap: 14.4,
  ...over,
})

describe('splitIntoChapters', () => {
  it('splits on headings that have the title on the same line', () => {
    const result = splitIntoChapters(
      'Chapter 1: The Letter\n\nShe waited.\n\nHe came.\n\nChapter 2: Crossed Paths\n\nThey met.',
      'Book',
    )
    expect(result.drafts).toEqual([
      { title: 'The Letter', content: 'She waited.\n\nHe came.' },
      { title: 'Crossed Paths', content: 'They met.' },
    ])
  })

  it('takes the title from the next line when the heading is only a number', () => {
    const result = splitIntoChapters(
      'Chapter One\n\nThe Letter\n\nShe waited.\n\nChapter Two\n\nCrossed Paths\n\nThey met.',
      'Book',
    )
    expect(result.drafts).toEqual([
      { title: 'The Letter', content: 'She waited.' },
      { title: 'Crossed Paths', content: 'They met.' },
    ])
  })

  it('recognises roman numerals and number words', () => {
    const result = splitIntoChapters(
      'CHAPTER IV\n\nThe Gate\n\nText.\n\nChapter twelve: Home\n\nMore.',
      'Book',
    )
    expect(result.drafts.map((draft) => draft.title)).toEqual(['The Gate', 'Home'])
  })

  it('skips the text before the first chapter and says so', () => {
    const result = splitIntoChapters('My Novel\n\nBy Someone\n\nChapter 1: Start\n\nText here.', 'Book')
    expect(result.drafts).toHaveLength(1)
    expect(result.notes.some((note) => note.includes('2 paragraphs'))).toBe(true)
  })

  it('skips headings with no text under them, like a table of contents', () => {
    const result = splitIntoChapters(
      'Contents\n\nChapter 1\n\nChapter 2\n\nChapter 1: Start\n\nReal text.\n\nChapter 2: Next\n\nMore text.',
      'Book',
    )
    expect(result.drafts.map((draft) => draft.title)).toEqual(['Start', 'Next'])
    expect(result.notes.some((note) => note.includes('no text'))).toBe(true)
  })

  it('loads one chapter when there are no headings', () => {
    const result = splitIntoChapters('Just some text.\n\nMore text.', 'My File')
    expect(result.drafts).toEqual([{ title: 'My File', content: 'Just some text.\n\nMore text.' }])
    expect(result.notes).toHaveLength(1)
  })

  it('reports empty files', () => {
    const result = splitIntoChapters('   ', 'Book')
    expect(result.drafts).toEqual([])
    expect(result.notes).toHaveLength(1)
  })
})

describe('buildParagraphs', () => {
  it('rebuilds paragraphs from indented first lines', () => {
    const text = buildParagraphs([
      line('It was a quiet morning and the', { x: 84, gap: null }),
      line('street was empty except for a'),
      line('lone dog.', { width: 150 }),
      line('She walked on slowly and never', { x: 84 }),
      line('looked back at the house or'),
      line('the gate.', { width: 120 }),
    ])
    expect(text).toBe(
      'It was a quiet morning and the street was empty except for a lone dog.\n\nShe walked on slowly and never looked back at the house or the gate.',
    )
  })

  it('removes page numbers and joins split words', () => {
    const text = buildParagraphs([
      line('The inter-', { gap: null }),
      line('national flight left at'),
      line('12', { width: 10 }),
      line('dawn.', { width: 100, gap: null }),
    ])
    expect(text).toBe('The international flight left at dawn.')
  })

  it('starts a new paragraph after a big vertical gap', () => {
    const text = buildParagraphs([
      line('First paragraph ends here', { gap: null }),
      line('Second paragraph starts', { gap: 30 }),
    ])
    expect(text).toBe('First paragraph ends here\n\nSecond paragraph starts')
  })
})