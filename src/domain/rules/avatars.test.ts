import { describe, expect, it } from 'vitest'
import { getAvatarIds, isValidAvatar } from './avatars'

describe('avatars', () => {
  it('gives 8 avatars per option with predictable ids', () => {
    const ids = getAvatarIds('female')
    expect(ids).toHaveLength(8)
    expect(ids[0]).toBe('female-1')
    expect(ids[7]).toBe('female-8')
  })

  it('only accepts avatars that belong to the chosen option', () => {
    expect(isValidAvatar('male', 'male-4')).toBe(true)
    expect(isValidAvatar('male', 'female-4')).toBe(false)
    expect(isValidAvatar('unspecified', 'unspecified-9')).toBe(false)
  })
})