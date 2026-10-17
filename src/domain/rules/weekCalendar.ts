import type { ChapterRead } from './progress'
import { COMMUNITY_UTC_OFFSET_HOURS } from './streak'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
// Day number 4 (5 January 1970) was a Monday.
const MONDAY_DAY_NUMBER = 4
const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export interface CalendarDay {
  label: string
  date: number
  isToday: boolean
  isFuture: boolean
  hasRead: boolean
}

// Whole days since 1 January 1970, counted in Lagos time.
function dayNumber(date: Date): number {
  return Math.floor((date.getTime() + COMMUNITY_UTC_OFFSET_HOURS * HOUR_MS) / DAY_MS)
}

// The seven days of the current week (Monday to Sunday, Lagos time), and which ones had a finished chapter.
export function getWeekCalendar(
  reads: Pick<ChapterRead, 'readAt'>[],
  now: Date = new Date(),
): CalendarDay[] {
  const today = dayNumber(now)
  const monday = today - (((today - MONDAY_DAY_NUMBER) % 7) + 7) % 7
  const readDays = new Set(reads.map((read) => dayNumber(read.readAt)))

  return LABELS.map((label, index) => {
    const day = monday + index
    return {
      label,
      date: new Date(day * DAY_MS).getUTCDate(),
      isToday: day === today,
      isFuture: day > today,
      hasRead: readDays.has(day),
    }
  })
}