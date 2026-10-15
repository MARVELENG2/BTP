import type { ProfileEditInput } from '@/domain/rules/profileEdit'
import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

export interface ProfileWriteResult {
  ok: boolean
  message?: string
}

export async function updateOwnProfile(
  userId: string,
  input: ProfileEditInput,
): Promise<ProfileWriteResult> {
  if (!isBackendConfigured) {
    return { ok: false, message: 'The app is not connected to the database.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: input.name.trim(),
      gender: input.gender,
      avatar_id: input.avatarId,
    })
    .eq('id', userId)
    .select('id')

  if (error) return { ok: false, message: error.message }
  if (!data || data.length === 0) {
    return { ok: false, message: 'Nothing was changed. Please log in again and try once more.' }
  }
  return { ok: true }
}