import { describe, expect, it } from 'vitest'
import { getWeekCalendar } from './weekCalendar'

// Wednesday 14 October 2026. The week runs from Monday 12 to Sunday 18.
const now = new Date('2026-10-14T12:00:00Z')
const read = (iso: string) => ({ readAt: new Date(iso) })

describe('getWeekCalendar', () => {
  it('lists Monday to Sunday of the current week', () => {
    const days = getWeekCalendar([], now)
    expect(days.map((day) => day.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    expect(days.map((day) => day.date)).toEqual([12, 13, 14, 15, 16, 17, 18])
  })

  it('marks today and the days still to come', () => {
    const days = getWeekCalendar([], now)
    expect(days.map((day) => day.isToday)).toEqual([false, false, true, false, false, false, false])
    expect(days.map((day) => day.isFuture)).toEqual([false, false, false, true, true, true, true])
  })

  it('marks the days with a finished chapter', () => {
    const days = getWeekCalendar(
      [read('2026-10-12T09:00:00Z'), read('2026-10-14T10:00:00Z')],
      now,
    )
    expect(days.map((day) => day.hasRead)).toEqual([true, false, true, false, false, false, false])
  })

  it('counts days in Lagos time', () => {
    // 23:30 UTC is 00:30 the next day in Lagos
    const days = getWeekCalendar(
      [read('2026-10-12T23:30:00Z'), read('2026-10-11T23:30:00Z')],
      now,
    )
    expect(days[0].hasRead).toBe(true)
    expect(days[1].hasRead).toBe(true)
    expect(days[2].hasRead).toBe(false)
  })

  it('ignores reads from other weeks', () => {
    const days = getWeekCalendar([read('2026-10-05T10:00:00Z')], now)
    expect(days.some((day) => day.hasRead)).toBe(false)
  })
})