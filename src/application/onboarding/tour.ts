import {
  hasCompletedTour,
  markTourCompleted,
} from '@/infrastructure/storage/onboardingStorage'

export function hasSeenTour(userId: string): boolean {
  return hasCompletedTour(userId)
}

export function completeTour(userId: string): void {
  markTourCompleted(userId)
}