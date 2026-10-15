import { describe, expect, it } from 'vitest'
import {
  DEFAULT_REMINDERS,
  reminderSettingsFromEntries,
  reminderSettingsToEntries,
  validateReminderSettings,
} from './reminderSettings'

describe('reminderSettingsFromEntries', () => {
  it('uses the defaults when nothing is saved', () => {
    expect(reminderSettingsFromEntries({})).toEqual(DEFAULT_REMINDERS)
  })

  it('reads saved values, and an empty day means off', () => {
    const settings = reminderSettingsFromEntries({
      discussion_weekday: '0',
      discussion_time: '19:30',
      streak_weekday: '',
      streak_time: '16:00',
    })
    expect(settings).toEqual({
      discussionWeekday: 0,
      discussionTime: '19:30',
      streakWeekday: null,
      streakTime: '16:00',
    })
  })

  it('survives a round trip', () => {
    const settings = { ...DEFAULT_REMINDERS, discussionWeekday: 3 }
    expect(reminderSettingsFromEntries(reminderSettingsToEntries(settings))).toEqual(settings)
  })
})

describe('validateReminderSettings', () => {
  it('accepts the defaults', () => {
    expect(validateReminderSettings(DEFAULT_REMINDERS)).toEqual([])
  })

  it('rejects a time that does not exist', () => {
    const errors = validateReminderSettings({ ...DEFAULT_REMINDERS, discussionTime: '25:00' })
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects a day outside the week', () => {
    const errors = validateReminderSettings({ ...DEFAULT_REMINDERS, streakWeekday: 7 })
    expect(errors.length).toBeGreaterThan(0)
  })
})