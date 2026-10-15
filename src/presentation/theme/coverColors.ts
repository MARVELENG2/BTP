const COVER_COLORS = ['#2E7D4F', '#7A5230', '#1F5C3A', '#9A6B3F', '#4C9A6A', '#5C3D22']

// Gives every book without a cover image its own steady color.
export function getCoverColor(seed: string): string {
  let sum = 0
  for (const char of seed) sum += char.charCodeAt(0)
  return COVER_COLORS[sum % COVER_COLORS.length]
}