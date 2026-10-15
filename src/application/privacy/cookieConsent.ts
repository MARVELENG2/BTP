import type { CookieConsent } from '@/domain/models'
import { readConsent, writeConsent } from '@/infrastructure/storage/consentStorage'

export function getCookieConsent(): CookieConsent | null {
  return readConsent()
}

export function saveCookieConsent(choice: CookieConsent): void {
  writeConsent(choice)
}