import { describe, expect, it } from 'vitest'
import type { Book } from '../models'
import {
  getNextUnlockAt,
  getUnlockedChapterCount,
  isChapterUnlocked,
} from './unlock'

// Starts Monday 19 Oct 2026, unlocks every Monday, 2 chapters a week
const book: Book = {
  id: 'b1',
  title: 'Test Book',
  author: 'Author',
  description: '',
  coverUrl: '',
  totalChapters: 10,
  chaptersPerWeek: 2,
  unlockWeekday: 1,
  startDate: '2026-10-19',
}

describe('weekly unlock', () => {
  it('unlocks nothing before the first unlock day', () => {
    expect(getUnlockedChapterCount(book, new Date('2026-10-18'))).toBe(0)
  })

  it('unlocks two chapters on the first unlock day', () => {
    expect(getUnlockedChapterCount(book, new Date('2026-10-19'))).toBe(2)
  })

  it('still shows two chapters later in the same week', () => {
    expect(getUnlockedChapterCount(book, new Date('2026-10-25'))).toBe(2)
  })

  it('unlocks two more the next week', () => {
    expect(getUnlockedChapterCount(book, new Date('2026-10-26'))).toBe(4)
  })

  it('never goes past the total chapters', () => {
    expect(getUnlockedChapterCount(book, new Date('2027-01-01'))).toBe(10)
  })

  it('checks a single chapter', () => {
    expect(isChapterUnlocked(book, 2, new Date('2026-10-19'))).toBe(true)
    expect(isChapterUnlocked(book, 3, new Date('2026-10-19'))).toBe(false)
  })

  it('gives the next unlock date for the countdown', () => {
    const next = getNextUnlockAt(book, new Date('2026-10-19'))
    expect(next?.toISOString().slice(0, 10)).toBe('2026-10-26')
  })

  it('returns null when the whole book is unlocked', () => {
    expect(getNextUnlockAt(book, new Date('2027-01-01'))).toBeNull()
  })
})