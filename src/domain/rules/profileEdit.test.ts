import { describe, expect, it } from 'vitest'
import { hasProfileChanges, validateProfileEdit } from './profileEdit'

const valid = { name: 'Ada', gender: 'female' as const, avatarId: 'female-2' }

describe('validateProfileEdit', () => {
  it('accepts a valid profile', () => {
    expect(validateProfileEdit(valid)).toEqual({})
  })

  it('rejects a name that is too short', () => {
    expect(validateProfileEdit({ ...valid, name: ' A ' }).name).toBeDefined()
  })

  it('rejects a name that is too long', () => {
    expect(validateProfileEdit({ ...valid, name: 'a'.repeat(41) }).name).toBeDefined()
  })

  it('rejects an avatar that belongs to another gender', () => {
    expect(validateProfileEdit({ ...valid, avatarId: 'male-1' }).avatarId).toBeDefined()
  })
})

describe('hasProfileChanges', () => {
  it('is false when nothing changed, ignoring spaces around the name', () => {
    expect(hasProfileChanges(valid, { ...valid, name: '  Ada ' })).toBe(false)
  })

  it('is true when the avatar changed', () => {
    expect(hasProfileChanges(valid, { ...valid, avatarId: 'female-3' })).toBe(true)
  })
})