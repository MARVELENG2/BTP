import type { Gender } from '../models'

export const AVATARS_PER_GENDER = 8

// Ids look like "female-1" ... "female-8", "male-1" ... and "unspecified-1" ...
export function getAvatarIds(gender: Gender): string[] {
  return Array.from({ length: AVATARS_PER_GENDER }, (_, i) => `${gender}-${i + 1}`)
}

export function isValidAvatar(gender: Gender, avatarId: string): boolean {
  return getAvatarIds(gender).includes(avatarId)
}