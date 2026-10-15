import {
  reminderSettingsFromEntries,
  reminderSettingsToEntries,
  validateReminderSettings,
  type ReminderSettings,
} from '@/domain/rules/reminderSettings'
import { usableWhatsAppLink, validateWhatsAppLink } from '@/domain/rules/whatsappLink'
import {
  readSetting,
  readSettings,
  writeSetting,
  writeSettings,
} from '@/infrastructure/database/settingsRepository'
import { appConfig } from '@/shared/config/appConfig'
import { withTimeout } from '@/shared/utils/withTimeout'

const WHATSAPP_KEY = 'whatsapp_link'
const REMINDER_KEYS = ['discussion_weekday', 'discussion_time', 'streak_weekday', 'streak_time']

// undefined = not loaded yet. The result is kept so every button shares one lookup.
let cached: string | null | undefined
let pending: Promise<string | null> | null = null

export function getCachedWhatsAppLink(): string | null | undefined {
  return cached
}

// The link readers see: the one saved in Settings, else the one in appConfig.ts, else nothing.
export function getWhatsAppLink(): Promise<string | null> {
  if (cached !== undefined) return Promise.resolve(cached)

  if (!pending) {
    pending = readSetting(WHATSAPP_KEY)
      .then((result) => {
        const fallback = usableWhatsAppLink(appConfig.whatsappLink)
        // A failed lookup isn't remembered, so a bad connection doesn't hide the button all session.
        if (!result.ok) return fallback
        const link = usableWhatsAppLink(result.value) ?? fallback
        cached = link
        return link
      })
      .finally(() => {
        pending = null
      })
  }
  return pending
}

// What is saved in Settings, for the admin form.
export async function loadWhatsAppSetting(): Promise<string> {
  const result = await readSetting(WHATSAPP_KEY)
  return result.ok ? (result.value ?? '') : ''
}

export async function saveWhatsAppLink(raw: string): Promise<{ ok: boolean; errors: string[] }> {
  const link = raw.trim()
  const errors = validateWhatsAppLink(link)
  if (errors.length > 0) return { ok: false, errors }

  try {
    const result = await withTimeout(
      writeSetting(WHATSAPP_KEY, link),
      20_000,
      'Saving took too long. Check your connection and try again.',
    )
    if (!result.ok) {
      return { ok: false, errors: [result.message ?? 'Something went wrong. Please try again.'] }
    }
    cached = usableWhatsAppLink(link) ?? usableWhatsAppLink(appConfig.whatsappLink)
    return { ok: true, errors: [] }
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : 'Something went wrong. Please try again.'],
    }
  }
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const entries = await readSettings(REMINDER_KEYS)
  return reminderSettingsFromEntries(entries ?? {})
}

export async function saveReminderSettings(
  settings: ReminderSettings,
): Promise<{ ok: boolean; errors: string[] }> {
  const errors = validateReminderSettings(settings)
  if (errors.length > 0) return { ok: false, errors }

  try {
    const result = await withTimeout(
      writeSettings(reminderSettingsToEntries(settings)),
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