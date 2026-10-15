import { describe, expect, it } from 'vitest'
import type { Book } from '../models'
import { formatBytes, getMissingDownloads } from './downloads'

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

// Wednesday 14 October 2026: chapters 1 to 4 are unlocked.
const now = new Date('2026-10-14T12:00:00Z')

describe('getMissingDownloads', () => {
  it('lists every unlocked chapter when nothing is saved', () => {
    expect(getMissingDownloads(book, [], now)).toEqual([1, 2, 3, 4])
  })

  it('skips chapters that are already saved', () => {
    expect(getMissingDownloads(book, [1, 2], now)).toEqual([3, 4])
  })

  it('is empty when every unlocked chapter is saved', () => {
    expect(getMissingDownloads(book, [1, 2, 3, 4], now)).toEqual([])
  })
})

describe('formatBytes', () => {
  it('formats small sizes in bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB')
  })
})