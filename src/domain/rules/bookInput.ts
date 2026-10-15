import type { Weekday } from '../models'

export const MAX_TITLE_LENGTH = 120
export const MAX_AUTHOR_LENGTH = 120
export const MAX_DESCRIPTION_LENGTH = 2000
export const MAX_CHAPTERS_PER_WEEK = 20
export const MAX_COVER_BYTES = 2 * 1024 * 1024
export const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface BookInput {
  title: string
  author: string
  description: string
  chaptersPerWeek: number
  unlockWeekday: Weekday
  startDate: string // "YYYY-MM-DD"
  isFeatured: boolean
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// Returns a list of plain-language problems. An empty list means the input is fine.
export function validateBookInput(input: BookInput): string[] {
  const errors: string[] = []
  const title = input.title.trim()

  if (title.length === 0) errors.push('Please enter a title.')
  if (title.length > MAX_TITLE_LENGTH) {
    errors.push(`The title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
  }
  if (input.author.trim().length > MAX_AUTHOR_LENGTH) {
    errors.push(`The author must be ${MAX_AUTHOR_LENGTH} characters or fewer.`)
  }
  if (input.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`The description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`)
  }
  if (
    !Number.isInteger(input.chaptersPerWeek) ||
    input.chaptersPerWeek < 1 ||
    input.chaptersPerWeek > MAX_CHAPTERS_PER_WEEK
  ) {
    errors.push(`Chapters per week must be a whole number from 1 to ${MAX_CHAPTERS_PER_WEEK}.`)
  }
  if (!Number.isInteger(input.unlockWeekday) || input.unlockWeekday < 0 || input.unlockWeekday > 6) {
    errors.push('Please choose an unlock day.')
  }
  if (!isRealDate(input.startDate)) errors.push('Please choose a valid start date.')

  return errors
}

export function validateCoverFile(type: string, size: number): string[] {
  const errors: string[] = []
  if (!COVER_TYPES.includes(type)) errors.push('The cover must be a JPG, PNG or WebP image.')
  if (size > MAX_COVER_BYTES) errors.push('The cover must be 2 MB or smaller.')
  return errors
}