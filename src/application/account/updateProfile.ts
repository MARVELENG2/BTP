import {
  validateProfileEdit,
  type ProfileEditErrors,
  type ProfileEditInput,
} from '@/domain/rules/profileEdit'
import { updateOwnProfile } from '@/infrastructure/auth/profileRepository'
import { withTimeout } from '@/shared/utils/withTimeout'

export interface UpdateProfileResult {
  ok: boolean
  errors: ProfileEditErrors
  message?: string
}

export async function updateProfile(
  userId: string,
  input: ProfileEditInput,
): Promise<UpdateProfileResult> {
  const errors = validateProfileEdit(input)
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  try {
    const result = await withTimeout(
      updateOwnProfile(userId, input),
      20_000,
      'Saving took too long. Check your connection and try again.',
    )
    if (!result.ok) {
      return { ok: false, errors: {}, message: result.message ?? 'Something went wrong. Please try again.' }
    }
    return { ok: true, errors: {} }
  } catch (error) {
    return {
      ok: false,
      errors: {},
      message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
    }
  }
}