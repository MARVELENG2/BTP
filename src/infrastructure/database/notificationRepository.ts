import type { NotificationPrefs } from '@/domain/rules/notificationPrefs'
import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

export interface DeviceSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

export interface NotificationWrite {
  ok: boolean
  message?: string
}

interface PrefsRow {
  new_chapters: boolean
  discussion: boolean
  streak: boolean
}

const NOT_CONFIGURED_MESSAGE = 'The app is not connected to the database.'

export async function saveSubscriptionRow(device: DeviceSubscription): Promise<NotificationWrite> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { error } = await supabase.rpc('save_push_subscription', {
    p_endpoint: device.endpoint,
    p_p256dh: device.p256dh,
    p_auth: device.auth,
  })
  return error ? { ok: false, message: error.message } : { ok: true }
}

export async function deleteSubscriptionRow(endpoint: string): Promise<void> {
  if (!isBackendConfigured) return
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
}

export async function fetchPrefs(userId: string): Promise<NotificationPrefs | null> {
  if (!isBackendConfigured) return null
  const { data, error } = await supabase
    .from('notification_settings')
    .select('new_chapters, discussion, streak')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null

  const row = data as unknown as PrefsRow
  return { newChapters: row.new_chapters, discussion: row.discussion, streak: row.streak }
}

export async function savePrefsRow(
  userId: string,
  prefs: NotificationPrefs,
): Promise<NotificationWrite> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { error } = await supabase.from('notification_settings').upsert(
    {
      user_id: userId,
      new_chapters: prefs.newChapters,
      discussion: prefs.discussion,
      streak: prefs.streak,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  return error ? { ok: false, message: error.message } : { ok: true }
}