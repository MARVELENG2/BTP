import type { Gender, Profile, UserRole } from '@/domain/models'
import { isBackendConfigured, supabase } from '@/infrastructure/backend/supabaseClient'

export const NOT_CONFIGURED = 'backend-not-configured'

export interface AuthResult {
  ok: boolean
  message?: string
  needsEmailConfirmation?: boolean
}

interface RegisterParams {
  email: string
  password: string
  name: string
  gender: Gender
  avatarId: string
}

export async function registerWithEmail(params: RegisterParams): Promise<AuthResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          display_name: params.name,
          gender: params.gender,
          avatar_id: params.avatarId,
        },
      },
    })
    if (error) return { ok: false, message: error.message }
    // With email confirmation on, there is no session until the link is clicked.
    return { ok: true, needsEmailConfirmation: data.session === null }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'network error' }
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isBackendConfigured) return { ok: false, message: NOT_CONFIGURED }
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { ok: false, message: error.message } : { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'network error' }
  }
}

export async function logout(): Promise<void> {
  if (!isBackendConfigured) return
  await supabase.auth.signOut()
}

export async function fetchProfile(): Promise<Profile | null> {
  if (!isBackendConfigured) return null
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, gender, avatar_id, role')
      .eq('id', session.user.id)
      .maybeSingle()
    if (error || !data) return null

    return {
      id: data.id,
      name: data.display_name,
      email: session.user.email ?? '',
      gender: data.gender as Gender,
      avatarId: data.avatar_id,
      role: data.role as UserRole,
    }
  } catch {
    return null
  }
}

export function subscribeToAuthChanges(onChange: () => void): () => void {
  // report the starting state right away, then every later change
  const initial = setTimeout(onChange, 0)
  if (!isBackendConfigured) return () => clearTimeout(initial)

  const { data } = supabase.auth.onAuthStateChange(() => {
    // run after the callback returns, as Supabase recommends
    setTimeout(onChange, 0)
  })
  return () => {
    clearTimeout(initial)
    data.subscription.unsubscribe()
  }
}