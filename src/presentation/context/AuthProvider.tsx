import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { getCurrentProfile, watchAuth } from '@/application/account/session'
import type { Profile } from '@/domain/models'
import { AuthContext } from './authContext'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setProfile(await getCurrentProfile())
    } catch {
      // no connection: keep whatever we already have
    }
    setLoading(false)
  }, [])

  // watchAuth reports the starting state and every later login or logout
  useEffect(() => watchAuth(refresh), [refresh])

  return (
    <AuthContext.Provider value={{ profile, loading, refreshProfile: refresh }}>
      {children}
    </AuthContext.Provider>
  )
}