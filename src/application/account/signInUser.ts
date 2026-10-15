import { loginWithEmail } from '@/infrastructure/auth/authRepository'
import { friendlyAuthMessage } from './authMessages'

export type SignInOutcome = { ok: true } | { ok: false; message: string }

export async function signInUser(email: string, password: string): Promise<SignInOutcome> {
  if (!email.trim() || !password) {
    return { ok: false, message: 'Enter your email and password.' }
  }
  const result = await loginWithEmail(email.trim(), password)
  return result.ok ? { ok: true } : { ok: false, message: friendlyAuthMessage(result.message) }
}