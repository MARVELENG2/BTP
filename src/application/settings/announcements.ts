import {
  announcementFromEntries,
  announcementToEntries,
  getVisibleAnnouncement,
  validateAnnouncement,
  type Announcement,
} from '@/domain/rules/announcement'
import { readSettings, writeSettings } from '@/infrastructure/database/settingsRepository'
import {
  getDismissedAnnouncement,
  setDismissedAnnouncement,
} from '@/infrastructure/storage/announcementStorage'
import { withTimeout } from '@/shared/utils/withTimeout'

const KEYS = ['announcement_text', 'announcement_enabled', 'announcement_version']

// What the admin sees in the form.
export async function loadAnnouncement(): Promise<Announcement> {
  const entries = await readSettings(KEYS)
  return announcementFromEntries(entries ?? {})
}

// What a reader sees: nothing if it is off, empty, or already dismissed.
export async function getAnnouncementForReader(): Promise<Announcement | null> {
  const announcement = await loadAnnouncement()
  return getVisibleAnnouncement(announcement, getDismissedAnnouncement())
}

export function dismissAnnouncement(version: string): void {
  setDismissedAnnouncement(version)
}

export async function saveAnnouncement(
  text: string,
  enabled: boolean,
): Promise<{ ok: boolean; errors: string[] }> {
  const errors = validateAnnouncement(text, enabled)
  if (errors.length > 0) return { ok: false, errors }

  try {
    const result = await withTimeout(
      writeSettings(
        announcementToEntries({ text: text.trim(), enabled, version: new Date().toISOString() }),
      ),
      20_000,
      'Saving took too long. Check your connection and try again.',
    )
    if (!result.ok) {
      return { ok: false, errors: [result.message ?? 'Something went wrong. Please try again.'] }
    }
    return { ok: true, errors: [] }
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : 'Something went wrong. Please try again.'],
    }
  }
}