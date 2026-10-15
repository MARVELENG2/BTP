import { base64UrlToBytes } from '@/shared/utils/base64'

const WORKER_URL = '/push-sw.js'
// A separate scope, so this worker never interferes with the offline one.
const WORKER_SCOPE = '/push/'

export interface DeviceCheck {
  label: string
  ok: boolean
  detail: string
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function getPermission(): NotificationPermission {
  return typeof Notification === 'undefined' ? 'denied' : Notification.permission
}

// A plain-language list of what this device and page allow, to explain why notifications may not work.
export function getDeviceChecks(): DeviceCheck[] {
  const inBrowser = typeof window !== 'undefined'
  const secure = inBrowser && window.isSecureContext
  const hasWorkers = inBrowser && 'serviceWorker' in navigator
  const hasPush = inBrowser && 'PushManager' in window
  const hasNotifications = inBrowser && 'Notification' in window
  const ownTab = inBrowser && window.self === window.top
  const permission = getPermission()

  return [
    {
      label: 'Secure address',
      ok: secure,
      detail: secure
        ? 'Yes (https or localhost)'
        : 'No. Browsers switch notifications off on plain http addresses.',
    },
    {
      label: 'Service workers',
      ok: hasWorkers,
      detail: hasWorkers ? 'Available' : 'Not available on this page',
    },
    {
      label: 'Push messages',
      ok: hasPush,
      detail: hasPush ? 'Available' : 'Not available. On iPhone, add the app to the Home Screen first.',
    },
    {
      label: 'Notifications',
      ok: hasNotifications,
      detail: hasNotifications ? 'Available' : 'Not available on this page',
    },
    {
      label: 'Opened in its own tab',
      ok: ownTab,
      detail: ownTab ? 'Yes' : 'This page is shown inside another page. Open it directly.',
    },
    {
      label: 'Permission',
      ok: hasNotifications && permission !== 'denied',
      detail: !hasNotifications
        ? 'Not available'
        : permission === 'granted'
          ? 'Allowed'
          : permission === 'denied'
            ? 'Blocked in the browser settings'
            : 'Not asked yet',
    },
  ]
}

// This device's current subscription, if it has one.
export async function findSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration(WORKER_SCOPE)
  return registration ? registration.pushManager.getSubscription() : null
}

// Finds the notification helper, or starts it if it isn't running yet.
async function getWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  let registration = await navigator.serviceWorker.getRegistration(WORKER_SCOPE)
  if (!registration) {
    registration = await navigator.serviceWorker.register(WORKER_URL, { scope: WORKER_SCOPE })
  }
  if (registration.active) return registration

  const worker = registration.installing ?? registration.waiting
  if (!worker) return registration

  await new Promise<void>((resolve) => {
    if (worker.state === 'activated') {
      resolve()
      return
    }
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') resolve()
    })
  })
  return registration
}

// Starts the helper ahead of time. Throws if the browser refuses.
export async function ensureWorker(): Promise<void> {
  await getWorkerRegistration()
}

// Like ensureWorker, but reports the browser's exact reason instead of throwing.
export async function prepareWorker(): Promise<{ ok: boolean; detail: string }> {
  try {
    await getWorkerRegistration()
    return { ok: true, detail: 'Ready' }
  } catch (error) {
    const name = error instanceof Error ? error.name : 'Error'
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, detail: `${name}: ${message}` }
  }
}

export async function subscribeToPush(publicKey: string): Promise<PushSubscription> {
  const registration = await getWorkerRegistration()
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(publicKey),
  })
}