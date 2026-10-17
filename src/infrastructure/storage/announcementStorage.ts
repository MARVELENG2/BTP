const KEY = 'btp:announcement-dismissed'

export function getDismissedAnnouncement(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setDismissedAnnouncement(version: string): void {
  try {
    localStorage.setItem(KEY, version)
  } catch {
    // storage unavailable: the banner will simply show again next time
  }
}