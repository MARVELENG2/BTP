import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

export type SettingRead = { ok: true; value: string | null } | { ok: false }

export interface SettingWrite {
  ok: boolean
  message?: string
}

const NOT_CONFIGURED_MESSAGE = 'The app is not connected to the database.'
const NOT_ALLOWED_MESSAGE = 'Nothing was changed. Please check that your account is an admin.'

export async function readSetting(key: string): Promise<SettingRead> {
  if (!isBackendConfigured) return { ok: false }
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  if (error) return { ok: false }
  return { ok: true, value: (data as { value: string } | null)?.value ?? null }
}

export async function writeSetting(key: string, value: string): Promise<SettingWrite> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const { data, error } = await supabase
    .from('app_settings')
    .upsert({ key, value }, { onConflict: 'key' })
    .select('key')
  if (error) return { ok: false, message: error.message }
  if (!data || data.length === 0) return { ok: false, message: NOT_ALLOWED_MESSAGE }
  return { ok: true }
}

// Several settings at once. Returns null if they couldn't be read.
export async function readSettings(keys: string[]): Promise<Record<string, string> | null> {
  if (!isBackendConfigured) return null
  const { data, error } = await supabase.from('app_settings').select('key, value').in('key', keys)
  if (error || !data) return null

  const result: Record<string, string> = {}
  for (const row of data as unknown as { key: string; value: string }[]) {
    result[row.key] = row.value
  }
  return result
}

export async function writeSettings(entries: Record<string, string>): Promise<SettingWrite> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED_MESSAGE }
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value }))
  const { data, error } = await supabase
    .from('app_settings')
    .upsert(rows, { onConflict: 'key' })
    .select('key')
  if (error) return { ok: false, message: error.message }
  if (!data || data.length < rows.length) return { ok: false, message: NOT_ALLOWED_MESSAGE }
  return { ok: true }
}