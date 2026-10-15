import { describe, expect, it } from 'vitest'
import {
  makePreview,
  normalizeChapterText,
  titleFromFileName,
  validateChapterInput,
} from './chapterInput'

describe('normalizeChapterText', () => {
  it('keeps blank-line paragraphs and joins wrapped lines', () => {
    expect(normalizeChapterText('Line one\nstill one\n\nSecond')).toBe('Line one still one\n\nSecond')
  })

  it('treats every line as a paragraph when there are no blank lines', () => {
    expect(normalizeChapterText('A\nB\nC')).toBe('A\n\nB\n\nC')
  })

  it('returns an empty string for blank text', () => {
    expect(normalizeChapterText('  \n ')).toBe('')
  })

  it('handles Windows line endings', () => {
    expect(normalizeChapterText('A\r\n\r\nB')).toBe('A\n\nB')
  })
})

describe('makePreview', () => {
  it('returns a short first paragraph unchanged', () => {
    expect(makePreview('Short start.\n\nMore text.')).toBe('Short start.')
  })

  it('cuts a long paragraph at a word boundary', () => {
    const preview = makePreview('word '.repeat(100))
    expect(preview.length).toBeLessThanOrEqual(220)
    expect(preview.endsWith('word')).toBe(true)
  })
})

describe('titleFromFileName', () => {
  it('turns a file name into a readable title', () => {
    expect(titleFromFileName('Chapter_01.txt')).toBe('Chapter 01')
  })
})

describe('validateChapterInput', () => {
  it('accepts a title and text', () => {
    expect(validateChapterInput({ title: 'The Letter', content: 'Some text.' })).toEqual([])
  })

  it('rejects an empty title', () => {
    expect(validateChapterInput({ title: ' ', content: 'Some text.' }).length).toBeGreaterThan(0)
  })

  it('rejects empty text', () => {
    expect(validateChapterInput({ title: 'The Letter', content: '  ' }).length).toBeGreaterThan(0)
  })
})