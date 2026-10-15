import type { Weekday } from './Weekday'

export interface Book {
  id: string
  title: string
  author: string
  description: string
  coverUrl: string
  totalChapters: number
  chaptersPerWeek: number
  unlockWeekday: Weekday
  startDate: string // ISO date, e.g. "2026-10-19"
  isFeatured?: boolean
}