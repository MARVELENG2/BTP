import { describe, expect, it } from 'vitest'
import { getNextStreakMilestone, getStreakBadges } from './streakBadges'

const ids = (longest: number) => getStreakBadges(longest).map((badge) => badge.id)

describe('getStreakBadges', () => {
  it('earns nothing before 7 weeks', () => {
    expect(ids(6)).toEqual([])
  })

  it('earns the 7-week badge at 7 weeks', () => {
    expect(ids(7)).toEqual(['streak-7'])
  })

  it('earns every badge that has been reached', () => {
    expect(ids(35)).toEqual(['streak-7', 'streak-30'])
    expect(ids(100)).toEqual(['streak-7', 'streak-30', 'streak-100'])
  })
})

describe('getNextStreakMilestone', () => {
  it('points at the first badge and how far away it is', () => {
    expect(getNextStreakMilestone(3, 3)).toEqual({ weeks: 7, remaining: 4 })
  })

  it('moves on to the next badge once one is earned', () => {
    expect(getNextStreakMilestone(7, 2)).toEqual({ weeks: 30, remaining: 28 })
  })

  it('is null once every badge is earned', () => {
    expect(getNextStreakMilestone(100, 100)).toBeNull()
  })
})