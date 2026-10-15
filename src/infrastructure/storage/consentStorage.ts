import type { CookieConsent } from '@/domain/models'

const KEY = 'btp-cookie-consent'

export function readConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'accepted' || value === 'declined' ? value : null
  } catch {
    return null
  }
}

export function writeConsent(choice: CookieConsent): void {
  try {
    localStorage.setItem(KEY, choice)
  } catch {
    // storage unavailable (private mode); the banner will simply show again
  }
}