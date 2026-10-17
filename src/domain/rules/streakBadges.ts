import type { Badge } from '../models'

export const STREAK_MILESTONES = [
  {
    weeks: 7,
    id: 'streak-7',
    name: '7-Week Streak',
    description: 'You read a chapter every week for 7 weeks in a row.',
  },
  {
    weeks: 30,
    id: 'streak-30',
    name: '30-Week Streak',
    description: 'You read a chapter every week for 30 weeks in a row.',
  },
  {
    weeks: 100,
    id: 'streak-100',
    name: '100-Week Streak',
    description: 'You read a chapter every week for 100 weeks in a row.',
  },
]

export interface StreakMilestone {
  weeks: number
  // how many more weeks of streak are needed
  remaining: number
}

// Based on the longest streak ever reached, so a badge stays earned if a streak later ends.
export function getStreakBadges(longestStreak: number): Badge[] {
  return STREAK_MILESTONES.filter((milestone) => longestStreak >= milestone.weeks).map(
    ({ id, name, description }) => ({ id, name, description }),
  )
}

// The next badge to work towards, or null once all of them are earned.
export function getNextStreakMilestone(
  longestStreak: number,
  currentStreak: number,
): StreakMilestone | null {
  const next = STREAK_MILESTONES.find((milestone) => longestStreak < milestone.weeks)
  if (!next) return null
  return { weeks: next.weeks, remaining: Math.max(1, next.weeks - currentStreak) }
}