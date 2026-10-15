import { describe, expect, it } from 'vitest'
import { validateBookInput, validateCoverFile, type BookInput } from './bookInput'

const valid: BookInput = {
  title: 'The Lagos Letters',
  author: 'A. Writer',
  description: 'A story.',
  chaptersPerWeek: 2,
  unlockWeekday: 1,
  startDate: '2026-10-19',
  isFeatured: false,
}

describe('validateBookInput', () => {
  it('accepts a valid book', () => {
    expect(validateBookInput(valid)).toEqual([])
  })

  it('rejects an empty title', () => {
    expect(validateBookInput({ ...valid, title: '   ' }).length).toBeGreaterThan(0)
  })

  it('rejects a title that is too long', () => {
    expect(validateBookInput({ ...valid, title: 'a'.repeat(121) }).length).toBeGreaterThan(0)
  })

  it('rejects zero chapters per week', () => {
    expect(validateBookInput({ ...valid, chaptersPerWeek: 0 }).length).toBeGreaterThan(0)
  })

  it('rejects a date that does not exist', () => {
    expect(validateBookInput({ ...valid, startDate: '2026-02-31' }).length).toBeGreaterThan(0)
  })
})

describe('validateCoverFile', () => {
  it('accepts a small JPG', () => {
    expect(validateCoverFile('image/jpeg', 500_000)).toEqual([])
  })

  it('rejects other file types', () => {
    expect(validateCoverFile('application/pdf', 500_000).length).toBeGreaterThan(0)
  })

  it('rejects files over 2 MB', () => {
    expect(validateCoverFile('image/png', 3 * 1024 * 1024).length).toBeGreaterThan(0)
  })
})