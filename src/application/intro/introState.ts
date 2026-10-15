import { readIntroSeen, writeIntroSeen } from '@/infrastructure/storage/introStorage'

export function hasSeenIntro(): boolean {
  return readIntroSeen()
}

export function markIntroSeen(): void {
  writeIntroSeen()
}