import type { Weekday } from '@/domain/models'

const NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export function getWeekdayName(day: Weekday): string {
  return NAMES[day]
}