import { describe, expect, it } from 'vitest'
import { base64UrlToBytes } from './base64'

describe('base64UrlToBytes', () => {
  it('decodes plain base64', () => {
    expect(Array.from(base64UrlToBytes('AQID'))).toEqual([1, 2, 3])
  })

  it('decodes URL-safe characters', () => {
    expect(Array.from(base64UrlToBytes('-_8'))).toEqual([251, 255])
  })

  it('accepts missing padding', () => {
    expect(Array.from(base64UrlToBytes('AQI'))).toEqual([1, 2])
  })
})