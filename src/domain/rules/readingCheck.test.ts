import { describe, expect, it } from 'vitest'
import {
  countWords,
  estimateReadMinutes,
  isRealRead,
  requiredReadingSeconds,
} from './readingCheck'

describe('countWords', () => {
  it('counts words across spaces and new lines', () => {
    expect(countWords('one two  three\nfour')).toBe(4)
  })

  it('returns 0 for blank text', () => {
    expect(countWords('   ')).toBe(0)
  })
})

describe('estimateReadMinutes', () => {
  it('rounds up to the next minute', () => {
    expect(estimateReadMinutes(230)).toBe(1)
    expect(estimateReadMinutes(231)).toBe(2)
  })

  it('is never less than one minute', () => {
    expect(estimateReadMinutes(0)).toBe(1)
  })
})

describe('requiredReadingSeconds', () => {
  it('is 30% of a fast reader\'s time', () => {
    expect(requiredReadingSeconds(3000)).toBe(120)
  })

  it('has a minimum for very short chapters', () => {
    expect(requiredReadingSeconds(50)).toBe(15)
  })

  it('has a cap for very long chapters', () => {
    expect(requiredReadingSeconds(100000)).toBe(480)
  })
})

describe('isRealRead', () => {
  it('is false when the end was not reached', () => {
    expect(isRealRead({ reachedEnd: false, activeSeconds: 999, wordCount: 3000 })).toBe(false)
  })

  it('is false when the end was reached too quickly', () => {
    expect(isRealRead({ reachedEnd: true, activeSeconds: 10, wordCount: 3000 })).toBe(false)
  })

  it('is true when the end was reached after enough time', () => {
    expect(isRealRead({ reachedEnd: true, activeSeconds: 120, wordCount: 3000 })).toBe(true)
  })
})