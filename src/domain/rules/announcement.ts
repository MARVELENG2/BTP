export const MAX_ANNOUNCEMENT_LENGTH = 280

export interface Announcement {
  text: string
  enabled: boolean
  // changes every time the admin saves, so readers who dismissed an older one see the new one
  version: string
}

export function validateAnnouncement(text: string, enabled: boolean): string[] {
  const trimmed = text.trim()
  const errors: string[] = []

  if (trimmed.length > MAX_ANNOUNCEMENT_LENGTH) {
    errors.push(`The announcement must be ${MAX_ANNOUNCEMENT_LENGTH} characters or fewer.`)
  }
  if (enabled && trimmed.length === 0) {
    errors.push('Please type a message, or switch the announcement off.')
  }
  return errors
}

export function announcementFromEntries(entries: Record<string, string | undefined>): Announcement {
  return {
    text: (entries['announcement_text'] ?? '').trim(),
    enabled: entries['announcement_enabled'] === 'true',
    version: entries['announcement_version'] ?? '',
  }
}

export function announcementToEntries(announcement: Announcement): Record<string, string> {
  return {
    announcement_text: announcement.text,
    announcement_enabled: announcement.enabled ? 'true' : 'false',
    announcement_version: announcement.version,
  }
}

// The announcement a reader should see, or null if there is none or they already dismissed it.
export function getVisibleAnnouncement(
  announcement: Announcement,
  dismissedVersion: string | null,
): Announcement | null {
  if (!announcement.enabled || announcement.text === '') return null
  if (announcement.version !== '' && dismissedVersion === announcement.version) return null
  return announcement
}