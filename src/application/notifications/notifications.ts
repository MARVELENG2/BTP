import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from '@/domain/rules/notificationPrefs'
import {
  deleteSubscriptionRow,
  fetchPrefs,
  savePrefsRow,
  saveSubscriptionRow,
} from '@/infrastructure/database/notificationRepository'
import {
  ensureWorker,
  findSubscription,
  getDeviceChecks,
  getPermission,
  isPushSupported,
  prepareWorker,
  subscribeToPush,
  type DeviceCheck,
} from '@/infrastructure/notifications/pushService'
import { withTimeout } from '@/shared/utils/withTimeout'

const VAPID_PUBLIC_KEY = ((import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? '').trim()

export type { DeviceCheck }

export type NotificationState =
  | { kind: 'unsupported'; hint: string }
  | { kind: 'blocked' }
  | { kind: 'off' }
  | { kind: 'on'; prefs: NotificationPrefs }

export interface NotificationResult {
  ok: boolean
  message: string
}

export function checkDevice(): DeviceCheck[] {
  return getDeviceChecks()
}

// Tries to start the notification helper and reports exactly what the browser said.
export async function checkWorker(): Promise<DeviceCheck> {
  if (!isPushSupported()) {
    return { label: 'Notification helper', ok: false, detail: 'Not available on this page' }
  }
  const result = await prepareWorker()
  return { label: 'Notification helper', ok: result.ok, detail: result.detail }
}

function unsupportedHint(): string {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return "This address isn't secure (it starts with http), so the browser switches notifications off. They work on the https site, or on localhost on a computer."
  }
  if (typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
    return 'On iPhone and iPad, add this app to your Home Screen first (Share, then Add to Home Screen), and open it from there to turn on notifications.'
  }
  return "This browser doesn't support notifications."
}

export async function getNotificationState(userId: string): Promise<NotificationState> {
  if (!isPushSupported()) return { kind: 'unsupported', hint: unsupportedHint() }
  if (!VAPID_PUBLIC_KEY) {
    return { kind: 'unsupported', hint: 'Notifications are not set up yet (the push key is missing).' }
  }
  if (getPermission() === 'denied') return { kind: 'blocked' }

  try {
    const subscription = await findSubscription()
    if (!subscription) return { kind: 'off' }
    return { kind: 'on', prefs: (await fetchPrefs(userId)) ?? DEFAULT_NOTIFICATION_PREFS }
  } catch {
    return { kind: 'off' }
  }
}

export async function enableNotifications(userId: string): Promise<NotificationResult> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
    return { ok: false, message: 'Notifications are not available on this device.' }
  }

  try {
    // Start the helper first, so a browser problem shows up before we ask for permission.
    await withTimeout(
      ensureWorker(),
      15_000,
      'The notification helper took too long to start. Reload the page and try again.',
    )

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return {
        ok: false,
        message:
          'Notifications are blocked for this app. Allow them in your browser or phone settings, then try again.',
      }
    }

    const subscription = await withTimeout(
      subscribeToPush(VAPID_PUBLIC_KEY),
      20_000,
      'Could not reach the notification service. Check your connection and try again.',
    )
    const json = subscription.toJSON()
    const p256dh = json.keys?.p256dh
    const auth = json.keys?.auth
    if (!json.endpoint || !p256dh || !auth) {
      return { ok: false, message: 'This device could not be set up for notifications.' }
    }

    const saved = await saveSubscriptionRow({ endpoint: json.endpoint, p256dh, auth })
    if (!saved.ok) {
      await subscription.unsubscribe()
      return { ok: false, message: saved.message ?? 'Something went wrong. Please try again.' }
    }

    // Creates the reader's settings the first time, and keeps them if they already exist.
    const prefs = (await fetchPrefs(userId)) ?? DEFAULT_NOTIFICATION_PREFS
    await savePrefsRow(userId, prefs)
    return { ok: true, message: '' }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'InvalidStateError') {
      return {
        ok: false,
        message:
          "Chrome won't let this tab start the notification helper. Make sure you're in a normal window (not Incognito, Guest or an embedded preview), that site data and cookies aren't blocked in Chrome's settings, then reload and try again. 'Check this device' below shows the exact reason.",
      }
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
    }
  }
}

// Stops notifications on this device. Also used at logout.
export async function removeDeviceSubscription(): Promise<void> {
  try {
    if (!isPushSupported()) return
    const subscription = await findSubscription()
    if (!subscription) return
    await deleteSubscriptionRow(subscription.endpoint)
    await subscription.unsubscribe()
  } catch {
    // nothing to remove
  }
}

export async function saveNotificationPrefs(
  userId: string,
  prefs: NotificationPrefs,
): Promise<{ ok: boolean; message?: string }> {
  try {
    return await withTimeout(
      savePrefsRow(userId, prefs),
      20_000,
      'Saving took too long. Check your connection and try again.',
    )
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
    }
  }
}