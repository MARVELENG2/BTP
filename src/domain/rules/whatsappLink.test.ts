import { describe, expect, it } from 'vitest'
import { usableWhatsAppLink, validateWhatsAppLink } from './whatsappLink'

describe('validateWhatsAppLink', () => {
  it('accepts a group invite link', () => {
    expect(validateWhatsAppLink('https://chat.whatsapp.com/AbC123xyz')).toEqual([])
  })

  it('accepts a wa.me link', () => {
    expect(validateWhatsAppLink('https://wa.me/2348012345678')).toEqual([])
  })

  it('rejects links that are not https', () => {
    expect(validateWhatsAppLink('http://chat.whatsapp.com/AbC123').length).toBeGreaterThan(0)
  })

  it('rejects other websites', () => {
    expect(validateWhatsAppLink('https://example.com/AbC123').length).toBeGreaterThan(0)
  })

  it('rejects text that is not a link', () => {
    expect(validateWhatsAppLink('join our group').length).toBeGreaterThan(0)
  })

  it('rejects a group link with no code', () => {
    expect(validateWhatsAppLink('https://chat.whatsapp.com/').length).toBeGreaterThan(0)
  })
})

describe('usableWhatsAppLink', () => {
  it('treats empty values as not set', () => {
    expect(usableWhatsAppLink('')).toBeNull()
    expect(usableWhatsAppLink(null)).toBeNull()
  })

  it('ignores the placeholder link', () => {
    expect(usableWhatsAppLink('https://chat.whatsapp.com/REPLACE_WITH_REAL_LINK')).toBeNull()
  })

  it('returns a valid link with spaces trimmed', () => {
    expect(usableWhatsAppLink('  https://chat.whatsapp.com/AbC123  ')).toBe(
      'https://chat.whatsapp.com/AbC123',
    )
  })
})