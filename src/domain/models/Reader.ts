import type { ReadingPreferences } from './Preferences'

export type Gender = 'female' | 'male' | 'unspecified'

export interface Reader {
  id: string
  name: string
  email: string
  gender: Gender
  avatarId: string
  preferences: ReadingPreferences
}