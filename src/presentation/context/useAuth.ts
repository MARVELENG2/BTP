import { useContext } from 'react'
import { AuthContext, type AuthState } from './authContext'

export function useAuth(): AuthState {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}