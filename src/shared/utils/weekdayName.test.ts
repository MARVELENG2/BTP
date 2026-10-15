import { expect, it } from 'vitest'
import { getWeekdayName } from './weekdayName'

it('turns a weekday number into its name', () => {
  expect(getWeekdayName(1)).toBe('Monday')
  expect(getWeekdayName(0)).toBe('Sunday')
})