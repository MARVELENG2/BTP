import type { Gender } from '../models'
import { isValidAvatar } from './avatars'

export const MIN_NAME_LENGTH = 2
export const MAX_NAME_LENGTH = 40

export interface ProfileEditInput {
  name: string
  gender: Gender
  avatarId: string
}

export type ProfileEditErrors = Partial<Record<'name' | 'avatarId', string>>

export function validateProfileEdit(input: ProfileEditInput): ProfileEditErrors {
  const errors: ProfileEditErrors = {}
  const name = input.name.trim()

  if (name.length < MIN_NAME_LENGTH) errors.name = 'Please enter your name.'
  else if (name.length > MAX_NAME_LENGTH) errors.name = 'That name is a bit long. Please shorten it.'

  if (!isValidAvatar(input.gender, input.avatarId)) errors.avatarId = 'Pick an avatar.'

  return errors
}

// Used to keep the Save button off until something has actually changed.
export function hasProfileChanges(current: ProfileEditInput, draft: ProfileEditInput): boolean {
  return (
    current.name.trim() !== draft.name.trim() ||
    current.gender !== draft.gender ||
    current.avatarId !== draft.avatarId
  )
}