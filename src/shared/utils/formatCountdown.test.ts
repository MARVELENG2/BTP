import { expect, it } from 'vitest'
import { formatCountdown } from './formatCountdown'

it('shows days, hours and minutes when more than a day is left', () => {
  expect(formatCountdown(90061000)).toBe('1d 1h 1m')
})

it('shows hours, minutes and seconds under a day', () => {
  expect(formatCountdown(3725000)).toBe('1h 2m 5s')
})

it('shows minutes and seconds under an hour', () => {
  expect(formatCountdown(65000)).toBe('1m 5s')
})

it('never goes below zero', () => {
  expect(formatCountdown(-5000)).toBe('0m 0s')
})