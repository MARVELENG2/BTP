// Average silent reading speed, used for time estimates.
export const READ_SPEED_WPM = 230
// A fast reader. The minimum time is a share of what this reader would need.
const FAST_READER_WPM = 450
const REQUIRED_SHARE = 0.3
export const MIN_REQUIRED_SECONDS = 15
export const MAX_REQUIRED_SECONDS = 8 * 60

export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}

export function estimateReadMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / READ_SPEED_WPM))
}

// How long a reader must spend on a chapter before it counts as read.
export function requiredReadingSeconds(wordCount: number): number {
  const fastReaderSeconds = (wordCount / FAST_READER_WPM) * 60
  const required = Math.round(fastReaderSeconds * REQUIRED_SHARE)
  return Math.min(MAX_REQUIRED_SECONDS, Math.max(MIN_REQUIRED_SECONDS, required))
}

export interface ReadCheckInput {
  reachedEnd: boolean
  activeSeconds: number
  wordCount: number
}

// A chapter counts as read once the reader reached the end and spent enough time on it.
export function isRealRead({ reachedEnd, activeSeconds, wordCount }: ReadCheckInput): boolean {
  return reachedEnd && activeSeconds >= requiredReadingSeconds(wordCount)
}