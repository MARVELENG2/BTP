const KEY = 'btp-intro-seen'

export function readIntroSeen(): boolean {
  try {
    return sessionStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

export function writeIntroSeen(): void {
  try {
    sessionStorage.setItem(KEY, 'true')
  } catch {
    // storage unavailable; the intro will simply play again next time
  }
}