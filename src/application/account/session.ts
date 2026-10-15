import { clearAllDownloads } from '@/application/offline/downloads'
import { removeDeviceSubscription } from '@/application/notifications/notifications'
import { discardPendingReads, flushPendingReads } from '@/application/reader/readingProgress'
import type { Profile } from '@/domain/models'
import {
  fetchProfile,
  logout,
  subscribeToAuthChanges,
} from '@/infrastructure/auth/authRepository'
import { withTimeout } from '@/shared/utils/withTimeout'

export function getCurrentProfile(): Promise<Profile | null> {
  return fetchProfile()
}

export async function signOutUser(): Promise<void> {
  // Send chapters finished offline first, but never let a slow connection block logging out.
  await withTimeout(flushPendingReads(), 5_000, 'slow').catch(() => 0)
  // Stop notifications for this phone. This needs the login, so it comes before logging out.
  await withTimeout(removeDeviceSubscription(), 5_000, 'slow').catch(() => undefined)

  await logout()
  // Saved chapters and waiting reads belong to whoever used the app, so they go on logout.
  await clearAllDownloads()
  await discardPendingReads()
}

// Calls onChange whenever someone logs in or out. Returns a function that stops listening.
export function watchAuth(onChange: () => void): () => void {
  return subscribeToAuthChanges(onChange)
}