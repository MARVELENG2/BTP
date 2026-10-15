import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  checkDevice,
  checkWorker,
  enableNotifications,
  getNotificationState,
  removeDeviceSubscription,
  saveNotificationPrefs,
  type DeviceCheck,
  type NotificationState,
} from '@/application/notifications/notifications'
import type { NotificationPrefs } from '@/domain/rules/notificationPrefs'
import { useAuth } from '@/presentation/context/useAuth'
import './NotificationsScreen.css'

const PREF_ROWS: { key: keyof NotificationPrefs; title: string; text: string }[] = [
  { key: 'newChapters', title: 'New chapters', text: "When a new week's chapters unlock." },
  {
    key: 'discussion',
    title: 'Discussion reminders',
    text: 'A reminder before the weekly WhatsApp discussion.',
  },
  { key: 'streak', title: 'Streak reminders', text: 'A nudge if your streak is about to break.' },
]

interface SwitchProps {
  checked: boolean
  label: string
  disabled?: boolean
  onChange: () => void
}

function Switch({ checked, label, disabled = false, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={checked ? 'notif-switch notif-switch--on' : 'notif-switch'}
      onClick={onChange}
    >
      <span />
    </button>
  )
}

function NotificationsPanel({ userId }: { userId: string }) {
  // undefined = still loading
  const [state, setState] = useState<NotificationState | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [workerCheck, setWorkerCheck] = useState<DeviceCheck | null>(null)

  useEffect(() => {
    getNotificationState(userId).then(setState)
  }, [userId])

  // Tries to start the notification helper and shows the browser's exact answer.
  useEffect(() => {
    checkWorker().then(setWorkerCheck)
  }, [])

  async function toggleMaster() {
    if (!state || busy) return
    setBusy(true)
    setMessage(null)

    if (state.kind === 'on') {
      await removeDeviceSubscription()
    } else {
      const result = await enableNotifications(userId)
      if (!result.ok) setMessage(result.message)
    }

    setState(await getNotificationState(userId))
    setBusy(false)
  }

  async function togglePref(key: keyof NotificationPrefs) {
    if (state?.kind !== 'on' || busy) return
    const next: NotificationPrefs = { ...state.prefs, [key]: !state.prefs[key] }
    setState({ kind: 'on', prefs: next })
    setMessage(null)

    const saved = await saveNotificationPrefs(userId, next)
    if (!saved.ok) {
      setMessage(saved.message ?? 'Could not save that. Please try again.')
      setState(await getNotificationState(userId))
    }
  }

  const active = state && (state.kind === 'on' || state.kind === 'off') ? state : null
  const checks = workerCheck ? [...checkDevice(), workerCheck] : checkDevice()

  return (
    <div className="notif">
      <header className="notif__top">
        <Link to="/settings" className="notif__back" aria-label="Back to settings">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1>Notifications</h1>
      </header>

      {state === undefined && <p className="notif__loading">Loading…</p>}

      {state?.kind === 'unsupported' && <p className="notif__info">{state.hint}</p>}

      {state?.kind === 'blocked' && (
        <p className="notif__info">
          Notifications are blocked for this app. To turn them on, allow notifications for this site
          in your browser or phone settings, then come back here.
        </p>
      )}

      {active && (
        <section className="notif__card">
          <div className="notif__row">
            <div className="notif__text">
              <strong>Push notifications</strong>
              <span>Get a message on this device, even when the app is closed.</span>
            </div>
            <Switch
              checked={active.kind === 'on'}
              label="Push notifications"
              disabled={busy}
              onChange={toggleMaster}
            />
          </div>

          {active.kind === 'on' &&
            PREF_ROWS.map((row) => (
              <div className="notif__row" key={row.key}>
                <div className="notif__text">
                  <strong>{row.title}</strong>
                  <span>{row.text}</span>
                </div>
                <Switch
                  checked={active.prefs[row.key]}
                  label={row.title}
                  onChange={() => togglePref(row.key)}
                />
              </div>
            ))}
        </section>
      )}

      {message && (
        <p className="notif__message" role="alert">
          {message}
        </p>
      )}

      <details className="notif__checks" open={state?.kind === 'unsupported' || Boolean(message)}>
        <summary>Check this device</summary>
        <ul>
          {checks.map((check) => (
            <li key={check.label}>
              <span className={check.ok ? 'notif__ok' : 'notif__bad'}>{check.ok ? 'Yes' : 'No'}</span>
              <div>
                <strong>{check.label}</strong>
                <span>{check.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </details>

      <p className="notif__note">
        We only send what you've switched on, and you can turn it off here at any time.
      </p>
    </div>
  )
}

export default function NotificationsScreen() {
  const { profile, loading } = useAuth()

  if (loading) return <p className="notif__loading">Loading…</p>
  if (!profile) return <Navigate to="/profile" replace />

  return <NotificationsPanel userId={profile.id} />
}