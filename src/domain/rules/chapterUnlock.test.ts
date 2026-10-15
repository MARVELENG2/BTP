import { describe, expect, it } from 'vitest'
import type { Book } from '../models'
import { getChapterUnlockAt } from './chapterUnlock'
import { isChapterUnlocked } from './unlock'

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

const day = (date: Date) => date.toISOString().slice(0, 10)

describe('getChapterUnlockAt', () => {
  it('unlocks chapters 1 and 2 on the first unlock day', () => {
    expect(day(getChapterUnlockAt(book, 1))).toBe('2026-10-19')
    expect(day(getChapterUnlockAt(book, 2))).toBe('2026-10-19')
  })

  it('unlocks chapter 3 a week later', () => {
    expect(day(getChapterUnlockAt(book, 3))).toBe('2026-10-26')
  })

  it('unlocks the last chapter after five unlock days', () => {
    expect(day(getChapterUnlockAt(book, 10))).toBe('2026-11-16')
  })

  it('agrees with isChapterUnlocked', () => {
    const unlockAt = getChapterUnlockAt(book, 7)
    expect(isChapterUnlocked(book, 7, unlockAt)).toBe(true)
    expect(isChapterUnlocked(book, 7, new Date('2026-11-08'))).toBe(false)
  })
})