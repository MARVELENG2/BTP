import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

export async function isSignedIn(): Promise<boolean> {
  if (!isBackendConfigured) return false
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session !== null
}