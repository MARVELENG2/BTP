import { expect, it } from 'vitest'
import { chunk } from './chunk'

it('splits a list into rows', () => {
  expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
})