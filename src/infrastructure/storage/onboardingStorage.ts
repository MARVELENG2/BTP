function keyFor(userId: string): string {
  return `btp:tour:${userId}`
}

// If storage isn't available, say the tour was seen, so people aren't shown it on every visit.
export function hasCompletedTour(userId: string): boolean {
  try {
    return localStorage.getItem(keyFor(userId)) === 'done'
  } catch {
    return true
  }
}

export function markTourCompleted(userId: string): void {
  try {
    localStorage.setItem(keyFor(userId), 'done')
  } catch {
    // ignored
  }
}