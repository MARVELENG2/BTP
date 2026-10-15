import { describe, expect, it } from 'vitest'
import type { Book } from '../models'
import {
  getCompletedWeeks,
  getNextChapterToRead,
  summarizeBookProgress,
  type ChapterRead,
} from './progress'
import { getWeekKey } from './streak'

const book: Book = {
  id: 'a',
  title: 'A Book',
  author: 'Someone',
  description: '',
  coverUrl: '',
  totalChapters: 6,
  chaptersPerWeek: 2,
  unlockWeekday: 1,
  startDate: '2026-10-05',
  isFeatured: false,
}

const read = (bookId: string, chapterNumber: number, readAt = '2026-10-14T10:00:00Z'): ChapterRead => ({
  bookId,
  chapterNumber,
  readAt: new Date(readAt),
})

// Wednesday 14 October 2026: two weekly unlocks have happened, so chapters 1 to 4 are open.
const now = new Date('2026-10-14T12:00:00Z')

describe('summarizeBookProgress', () => {
  it('counts only this book and chapters that exist', () => {
    const small = { ...book, totalChapters: 3 }
    const result = summarizeBookProgress(small, [read('a', 1), read('a', 2), read('b', 1), read('a', 9)])
    expect(result).toEqual({ chaptersRead: 2, completed: false })
  })

  it('is completed once every chapter is read', () => {
    const small = { ...book, totalChapters: 2 }
    expect(summarizeBookProgress(small, [read('a', 1), read('a', 2)]).completed).toBe(true)
  })

  it('is never completed for a book with no chapters', () => {
    expect(summarizeBookProgress({ ...book, totalChapters: 0 }, []).completed).toBe(false)
  })
})

describe('getCompletedWeeks', () => {
  it('groups reads by week', () => {
    const weeks = getCompletedWeeks([
      read('a', 1, '2026-10-05T09:00:00Z'),
      read('a', 2, '2026-10-11T20:00:00Z'),
      read('a', 3, '2026-10-12T09:00:00Z'),
    ])
    expect(weeks).toEqual([
      getWeekKey(new Date('2026-10-05T09:00:00Z')),
      getWeekKey(new Date('2026-10-12T09:00:00Z')),
    ])
  })

  it('returns nothing when there are no reads', () => {
    expect(getCompletedWeeks([])).toEqual([])
  })
})

describe('getNextChapterToRead', () => {
  it('starts at chapter 1', () => {
    expect(getNextChapterToRead(book, [], now)).toBe(1)
  })

  it('moves on to the first unread chapter', () => {
    expect(getNextChapterToRead(book, [read('a', 1), read('a', 2)], now)).toBe(3)
  })

  it('returns null when every unlocked chapter is read', () => {
    const reads = [1, 2, 3, 4].map((number) => read('a', number))
    expect(getNextChapterToRead(book, reads, now)).toBeNull()
  })
})