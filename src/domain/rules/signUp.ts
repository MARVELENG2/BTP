import type { Gender } from '../models'
import { isValidAvatar } from './avatars'

export interface SignUpInput {
  name: string
  email: string
  password: string
  gender: Gender | ''
  avatarId: string
}

export type SignUpField = 'name' | 'email' | 'password' | 'gender' | 'avatarId'
export type SignUpErrors = Partial<Record<SignUpField, string>>

export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateSignUp(input: SignUpInput): SignUpErrors {
  const errors: SignUpErrors = {}

  const name = input.name.trim()
  if (name.length < 2) errors.name = 'Please enter your name.'
  else if (name.length > 40) errors.name = 'That name is a bit long. Please shorten it.'

  if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = 'Enter a valid email address.'

  if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (input.gender === '') errors.gender = 'Please choose an option.'
  else if (!isValidAvatar(input.gender, input.avatarId)) errors.avatarId = 'Pick an avatar.'

  return errors
}