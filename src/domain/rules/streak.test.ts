import { describe, expect, it } from 'vitest'
import { calculateStreak, getWeekKey } from './streak'

// 5, 12 and 19 Oct 2026 are all Mondays
const w1 = getWeekKey(new Date('2026-10-05'))
const w2 = getWeekKey(new Date('2026-10-12'))
const w3 = getWeekKey(new Date('2026-10-19'))

describe('streak', () => {
  it('is zero with no reading', () => {
    expect(calculateStreak([], new Date('2026-10-21'))).toEqual({ current: 0, longest: 0 })
  })

  it('counts consecutive weeks', () => {
    expect(calculateStreak([w1, w2, w3], new Date('2026-10-21'))).toEqual({
      current: 3,
      longest: 3,
    })
  })

  it('resets after a skipped week but remembers the longest', () => {
    expect(calculateStreak([w1, w2, w3], new Date('2026-11-04'))).toEqual({
      current: 0,
      longest: 3,
    })
  })

  it('starts over when there is a gap in the middle', () => {
    expect(calculateStreak([w1, w3], new Date('2026-10-21'))).toEqual({
      current: 1,
      longest: 1,
    })
  })

  it('stays alive in a new week before the reader has read yet', () => {
    expect(calculateStreak([w1, w2], new Date('2026-10-21'))).toEqual({
      current: 2,
      longest: 2,
    })
  })

  it('ignores duplicate weeks', () => {
    expect(calculateStreak([w1, w1, w2], new Date('2026-10-14'))).toEqual({
      current: 2,
      longest: 2,
    })
  })
})