import { createContext } from 'react'
import type { Profile } from '@/domain/models'

export interface AuthState {
  profile: Profile | null
  loading: boolean
  // reloads the profile, for example after the reader edits it
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthState | undefined>(undefined)