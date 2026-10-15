// Times are in Lagos time. A weekday of null means that reminder is off.
export interface ReminderSettings {
  discussionWeekday: number | null
  discussionTime: string // "HH:MM"
  streakWeekday: number | null
  streakTime: string // "HH:MM"
}

export const DEFAULT_REMINDERS: ReminderSettings = {
  discussionWeekday: null,
  discussionTime: '20:00',
  streakWeekday: 6,
  streakTime: '17:00',
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

function isWeekday(value: number | null): boolean {
  return value === null || (Number.isInteger(value) && value >= 0 && value <= 6)
}

export function validateReminderSettings(settings: ReminderSettings): string[] {
  const errors: string[] = []
  if (!isWeekday(settings.discussionWeekday)) errors.push('Please choose a discussion day.')
  if (!TIME_PATTERN.test(settings.discussionTime)) errors.push('Please enter a valid discussion time.')
  if (!isWeekday(settings.streakWeekday)) errors.push('Please choose a streak reminder day.')
  if (!TIME_PATTERN.test(settings.streakTime)) errors.push('Please enter a valid streak reminder time.')
  return errors
}

function parseWeekday(raw: string | undefined, fallback: number | null): number | null {
  if (raw === undefined) return fallback
  if (raw.trim() === '') return null
  const value = Number.parseInt(raw, 10)
  return Number.isInteger(value) && value >= 0 && value <= 6 ? value : fallback
}

function parseTime(raw: string | undefined, fallback: string): string {
  return raw !== undefined && TIME_PATTERN.test(raw) ? raw : fallback
}

// Turns the saved settings rows into reminder settings, using defaults for anything missing.
export function reminderSettingsFromEntries(
  entries: Record<string, string | undefined>,
): ReminderSettings {
  return {
    discussionWeekday: parseWeekday(entries['discussion_weekday'], DEFAULT_REMINDERS.discussionWeekday),
    discussionTime: parseTime(entries['discussion_time'], DEFAULT_REMINDERS.discussionTime),
    streakWeekday: parseWeekday(entries['streak_weekday'], DEFAULT_REMINDERS.streakWeekday),
    streakTime: parseTime(entries['streak_time'], DEFAULT_REMINDERS.streakTime),
  }
}

export function reminderSettingsToEntries(settings: ReminderSettings): Record<string, string> {
  return {
    discussion_weekday: settings.discussionWeekday === null ? '' : String(settings.discussionWeekday),
    discussion_time: settings.discussionTime,
    streak_weekday: settings.streakWeekday === null ? '' : String(settings.streakWeekday),
    streak_time: settings.streakTime,
  }
}