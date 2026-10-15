import { describe, expect, it } from 'vitest'
import { defaultPreferences } from '../models'
import { normalizePreferences } from './preferences'

describe('normalizePreferences', () => {
  it('falls back to the defaults for junk input', () => {
    expect(normalizePreferences(null)).toEqual(defaultPreferences)
    expect(normalizePreferences('nonsense')).toEqual(defaultPreferences)
  })

  it('keeps valid values', () => {
    const valid = {
      readingMode: 'scroll',
      theme: 'clean',
      pageColor: '#FBF5E6',
      font: 'sans',
      textSize: 20,
      lineSpacing: 1.8,
      nightMode: true,
      texture: 'paper',
    }
    expect(normalizePreferences(valid)).toEqual(valid)
  })

  it('keeps text size and line spacing inside their limits', () => {
    expect(normalizePreferences({ textSize: 99 }).textSize).toBe(28)
    expect(normalizePreferences({ textSize: 5 }).textSize).toBe(14)
    expect(normalizePreferences({ lineSpacing: 0.5 }).lineSpacing).toBe(1.3)
  })

  it('rejects unknown options and bad colors', () => {
    const result = normalizePreferences({
      font: 'comic',
      pageColor: 'red',
      texture: 'x',
      theme: 'wild',
      readingMode: 'spin',
    })
    expect(result).toEqual(defaultPreferences)
  })
})