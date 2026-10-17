import { describe, expect, it } from 'vitest'
import {
  announcementFromEntries,
  announcementToEntries,
  getVisibleAnnouncement,
  validateAnnouncement,
  type Announcement,
} from './announcement'

const live: Announcement = { text: 'Discussion moved to Sunday.', enabled: true, version: 'v1' }

describe('validateAnnouncement', () => {
  it('accepts a normal message', () => {
    expect(validateAnnouncement('Hello everyone', true)).toEqual([])
  })

  it('rejects a message that is too long', () => {
    expect(validateAnnouncement('a'.repeat(281), true).length).toBeGreaterThan(0)
  })

  it('rejects an empty message while it is switched on', () => {
    expect(validateAnnouncement('   ', true).length).toBeGreaterThan(0)
  })

  it('allows an empty message while it is switched off', () => {
    expect(validateAnnouncement('', false)).toEqual([])
  })
})

describe('announcement entries', () => {
  it('reads the saved values', () => {
    expect(
      announcementFromEntries({
        announcement_text: '  Hi  ',
        announcement_enabled: 'true',
        announcement_version: 'v9',
      }),
    ).toEqual({ text: 'Hi', enabled: true, version: 'v9' })
  })

  it('uses safe defaults when nothing is saved', () => {
    expect(announcementFromEntries({})).toEqual({ text: '', enabled: false, version: '' })
  })

  it('survives a round trip', () => {
    expect(announcementFromEntries(announcementToEntries(live))).toEqual(live)
  })
})

describe('getVisibleAnnouncement', () => {
  it('shows a live announcement', () => {
    expect(getVisibleAnnouncement(live, null)).toEqual(live)
  })

  it('hides it when it is switched off', () => {
    expect(getVisibleAnnouncement({ ...live, enabled: false }, null)).toBeNull()
  })

  it('hides it once the reader dismissed that version', () => {
    expect(getVisibleAnnouncement(live, 'v1')).toBeNull()
  })

  it('shows it again when the admin saves a new version', () => {
    expect(getVisibleAnnouncement({ ...live, version: 'v2' }, 'v1')).toEqual({
      ...live,
      version: 'v2',
    })
  })
})