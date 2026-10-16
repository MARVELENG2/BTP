import { describe, expect, it } from 'vitest'
import { calculateStreak, getWeekKey } from './streak'

// Monday 7 September 2026 starts week 0 in these tests.
const base = getWeekKey(new Date('2026-09-07T12:00:00Z'))
const week = (n: number) => base + n
// A Wednesday midday in week n.
const during = (n: number) => new Date(Date.UTC(2026, 8, 9 + 7 * n, 12))

describe('getWeekKey', () => {
  it('follows Lagos time: Sunday 23:30 UTC is already Monday in Lagos', () => {
    expect(getWeekKey(new Date('2026-10-11T23:30:00Z'))).toBe(
      getWeekKey(new Date('2026-10-12T12:00:00Z')),
    )
  })

  it('keeps Sunday evening in Lagos in the old week', () => {
    expect(getWeekKey(new Date('2026-10-11T22:30:00Z'))).toBe(
      getWeekKey(new Date('2026-10-05T12:00:00Z')),
    )
  })
})

describe('streak', () => {
  it('is zero with no reading', () => {
    expect(calculateStreak([], during(0))).toMatchObject({ current: 0, longest: 0, freezes: 0 })
  })

  it('counts consecutive weeks', () => {
    expect(calculateStreak([week(0), week(1), week(2)], during(2))).toMatchObject({
      current: 3,
      longest: 3,
    })
  })

  it('resets after a skipped week but remembers the longest', () => {
    expect(calculateStreak([week(0), week(1), week(2)], during(5))).toMatchObject({
      current: 0,
      longest: 3,
    })
  })

  it('starts over when there is a gap in the middle', () => {
    expect(calculateStreak([week(0), week(2)], during(2))).toMatchObject({
      current: 1,
      longest: 1,
    })
  })

  it('stays alive in a new week before the reader has read yet', () => {
    expect(calculateStreak([week(0), week(1)], during(2))).toMatchObject({
      current: 2,
      longest: 2,
    })
  })

  it('ignores duplicate weeks', () => {
    expect(calculateStreak([week(0), week(0), week(1)], during(1))).toMatchObject({
      current: 2,
      longest: 2,
    })
  })

  it('earns a freeze after four weeks in a row', () => {
    const result = calculateStreak([0, 1, 2, 3].map(week), during(3))
    expect(result).toMatchObject({ current: 4, freezes: 1 })
  })

  it('uses a freeze to cover one missed week', () => {
    const result = calculateStreak([0, 1, 2, 3, 5].map(week), during(5))
    expect(result).toMatchObject({
      current: 5,
      longest: 5,
      freezes: 0,
      frozenWeeks: [week(4)],
    })
  })

  it('does not use a freeze for the week still in progress', () => {
    const result = calculateStreak([0, 1, 2, 3].map(week), during(4))
    expect(result).toMatchObject({ current: 4, freezes: 1, frozenWeeks: [] })
  })

  it('holds at most two freezes', () => {
    const twelveWeeks = Array.from({ length: 12 }, (_, n) => week(n))
    expect(calculateStreak(twelveWeeks, during(11))).toMatchObject({ current: 12, freezes: 2 })
  })

  it('ends the streak when the freezes run out', () => {
    const result = calculateStreak([0, 1, 2, 3, 6].map(week), during(6))
    expect(result).toMatchObject({
      current: 1,
      longest: 4,
      frozenWeeks: [week(4)],
    })
  })

  it('says whether this week is already done', () => {
    expect(calculateStreak([week(0)], during(0)).completedThisWeek).toBe(true)
    expect(calculateStreak([week(0)], during(1)).completedThisWeek).toBe(false)
  })
})