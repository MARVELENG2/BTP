const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

// 5 Jan 1970 was a Monday, so weeks are counted from there.
const MONDAY_ANCHOR = Date.UTC(1970, 0, 5)

export interface StreakResult {
  current: number
  longest: number
}

// A whole number that identifies the Monday-to-Sunday week a date falls in.
export function getWeekKey(date: Date): number {
  const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((day - MONDAY_ANCHOR) / WEEK_MS)
}

// completedWeeks holds the week keys in which the reader finished their weekly reading.
export function calculateStreak(
  completedWeeks: number[],
  now: Date = new Date(),
): StreakResult {
  const weeks = [...new Set(completedWeeks)].sort((a, b) => a - b)
  if (weeks.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < weeks.length; i++) {
    run = weeks[i] === weeks[i - 1] + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  // The streak is alive if the last completed week is this week or last week.
  const lastCompleted = weeks[weeks.length - 1]
  if (lastCompleted < getWeekKey(now) - 1) return { current: 0, longest }

  return { current: run, longest }
}