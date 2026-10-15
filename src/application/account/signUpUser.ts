import { registerWithEmail } from '@/infrastructure/auth/authRepository'
import { validateSignUp, type SignUpErrors, type SignUpInput } from '@/domain/rules/signUp'
import { friendlyAuthMessage } from './authMessages'

export type SignUpOutcome =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; errors: SignUpErrors; message: string | null }

export async function signUpUser(input: SignUpInput): Promise<SignUpOutcome> {
  const errors = validateSignUp(input)
  if (Object.keys(errors).length > 0 || input.gender === '') {
    return { ok: false, errors, message: null }
  }

  const result = await registerWithEmail({
    email: input.email.trim(),
    password: input.password,
    name: input.name.trim(),
    gender: input.gender,
    avatarId: input.avatarId,
  })

  if (!result.ok) {
    return { ok: false, errors: {}, message: friendlyAuthMessage(result.message) }
  }
  return { ok: true, needsEmailConfirmation: Boolean(result.needsEmailConfirmation) }
}