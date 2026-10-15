import { describe, expect, it } from 'vitest'
import { validateSignUp, type SignUpInput } from './signUp'

const valid: SignUpInput = {
  name: 'Adaeze Obi',
  email: 'adaeze@example.com',
  password: 'longenough1',
  gender: 'female',
  avatarId: 'female-3',
}

describe('validateSignUp', () => {
  it('accepts good input', () => {
    expect(validateSignUp(valid)).toEqual({})
  })

  it('asks for a name', () => {
    expect(validateSignUp({ ...valid, name: ' ' }).name).toBeDefined()
  })

  it('rejects a bad email', () => {
    expect(validateSignUp({ ...valid, email: 'not-an-email' }).email).toBeDefined()
  })

  it('rejects a short password', () => {
    expect(validateSignUp({ ...valid, password: 'short' }).password).toBeDefined()
  })

  it('requires a gender option', () => {
    expect(validateSignUp({ ...valid, gender: '', avatarId: '' }).gender).toBeDefined()
  })

  it('rejects an avatar from another option', () => {
    expect(validateSignUp({ ...valid, avatarId: 'male-1' }).avatarId).toBeDefined()
  })
})