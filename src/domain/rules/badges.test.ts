import { describe, expect, it } from 'vitest'
import type { Book } from '../models'
import { getEarnedBadges } from './badges'

const makeBook = (id: string): Book => ({
  id,
  title: `Book ${id}`,
  author: '',
  description: '',
  coverUrl: '',
  totalChapters: 10,
  chaptersPerWeek: 2,
  unlockWeekday: 1,
  startDate: '2026-10-19',
})

const ids = (books: Book[]) => getEarnedBadges(books).map((badge) => badge.id)

describe('badges', () => {
  it('gives nothing when no book is finished', () => {
    expect(getEarnedBadges([])).toEqual([])
  })

  it('gives a first-book badge and a badge for that book', () => {
    expect(ids([makeBook('a')])).toEqual(['first-book', 'finished:a'])
  })

  it('adds the bookworm badge at three books', () => {
    const result = ids([makeBook('a'), makeBook('b'), makeBook('c')])
    expect(result).toContain('bookworm')
    expect(result).not.toContain('page-turner')
  })

  it('counts the same book only once', () => {
    expect(ids([makeBook('a'), makeBook('a')])).toEqual(['first-book', 'finished:a'])
  })
})