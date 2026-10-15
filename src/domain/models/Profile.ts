import type { Gender } from './Reader'

export type UserRole = 'reader' | 'admin'

export interface Profile {
  id: string
  name: string
  email: string
  gender: Gender
  avatarId: string
  role: UserRole
}