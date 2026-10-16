const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
const WEEK_MS = 7 * DAY_MS

// 5 Jan 1970 was a Monday, so weeks are counted from there.
const MONDAY_ANCHOR = Date.UTC(1970, 0, 5)

// The community is in Nigeria. Lagos is UTC+1 all year (no daylight saving),
// so a week runs from Monday 00:00 to Sunday 23:59 Lagos time.
export const COMMUNITY_UTC_OFFSET_HOURS = 1

// A freeze is earned every time a streak reaches a multiple of this many weeks.
export const FREEZE_EARNED_EVERY = 4
export const MAX_FREEZES = 2

export interface StreakResult {
  current: number
  longest: number
  // freezes the reader has in reserve
  freezes: number
  // weeks a freeze was used to keep the streak alive
  frozenWeeks: number[]
  completedThisWeek: boolean
}

// A whole number that identifies the Monday-to-Sunday week (in Lagos time) a date falls in.
export function getWeekKey(date: Date): number {
  const local = new Date(date.getTime() + COMMUNITY_UTC_OFFSET_HOURS * HOUR_MS)
  const day = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate())
  return Math.floor((day - MONDAY_ANCHOR) / WEEK_MS)
}

// completedWeeks holds the week keys in which the reader finished a chapter.
// Walks the weeks in order: a finished week adds to the streak (and every fourth earns a freeze),
// a missed week spends a freeze if there is one and otherwise ends the streak.
// The current week is never counted as missed, because it isn't over yet.
export function calculateStreak(
  completedWeeks: number[],
  now: Date = new Date(),
): StreakResult {
  const completed = new Set(completedWeeks)
  const thisWeek = getWeekKey(now)
  const first = Math.min(...completed)

  if (completed.size === 0) {
    return { current: 0, longest: 0, freezes: 0, frozenWeeks: [], completedThisWeek: false }
  }

  let run = 0
  let longest = 0
  let freezes = 0
  const frozenWeeks: number[] = []

  for (let week = first; week <= thisWeek; week += 1) {
    if (completed.has(week)) {
      run += 1
      longest = Math.max(longest, run)
      if (run % FREEZE_EARNED_EVERY === 0) freezes = Math.min(MAX_FREEZES, freezes + 1)
    } else if (week < thisWeek) {
      if (run > 0 && freezes > 0) {
        freezes -= 1
        frozenWeeks.push(week)
      } else {
        run = 0
      }
    }
  }

  return {
    current: run,
    longest,
    freezes,
    frozenWeeks,
    completedThisWeek: completed.has(thisWeek),
  }
}