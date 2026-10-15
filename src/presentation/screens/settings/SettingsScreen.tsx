import { useCallback, useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { signOutUser } from '@/application/account/session'
import Avatar from '@/presentation/components/Avatar'
import { useAuth } from '@/presentation/context/useAuth'
import { appConfig } from '@/shared/config/appConfig'
import EditProfileSheet from './EditProfileSheet'
import './SettingsScreen.css'

function Icon({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </svg>
  )
}

function Chevron() {
  return (
    <span className="settings__chevron">
      <Icon>
        <polyline points="9 18 15 12 9 6" />
      </Icon>
    </span>
  )
}

export default function SettingsScreen() {
  const { profile, loading, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [updated, setUpdated] = useState(false)

  const closeEditor = useCallback(() => setEditing(false), [])

  if (loading) return <p className="settings__loading">Loading…</p>
  if (!profile) return <Navigate to="/profile" replace />

  const openEditor = () => {
    setUpdated(false)
    setEditing(true)
  }

  const handleSaved = async () => {
    await refreshProfile()
    setUpdated(true)
    setEditing(false)
  }

  return (
    <div className="settings">
      <header className="settings__top">
        <Link to="/profile" className="settings__back" aria-label="Back to profile">
          <Icon>
            <polyline points="15 18 9 12 15 6" />
          </Icon>
        </Link>
        <h1>Settings</h1>
      </header>

      <section className="settings__identity">
        <button
          type="button"
          className="settings__avatar"
          onClick={openEditor}
          aria-label="Change avatar"
        >
          <Avatar avatarId={profile.avatarId} size={72} label="Your avatar" />
          <span className="settings__avatar-edit" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          </span>
        </button>
        <div className="settings__who">
          <strong>{profile.name}</strong>
          <span>{profile.email}</span>
          {profile.role === 'admin' && <em className="settings__tag">Admin</em>}
        </div>
      </section>

      {updated && (
        <p className="settings__notice" role="status">
          Profile updated.
        </p>
      )}

      <section className="settings__section">
        <h2 className="settings__group">Account</h2>
        <ul className="settings__list">
          <li>
            <button type="button" className="settings__row" onClick={openEditor}>
              <span className="settings__icon">
                <Icon>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </Icon>
              </span>
              <span className="settings__text">
                <span className="settings__title">Edit profile</span>
                <span className="settings__sub">Name, gender and avatar</span>
              </span>
              <Chevron />
            </button>
          </li>
          <li>
            <Link to="/downloads" className="settings__row">
              <span className="settings__icon">
                <Icon>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </Icon>
              </span>
              <span className="settings__text">
                <span className="settings__title">Downloads</span>
                <span className="settings__sub">Chapters saved for offline reading</span>
              </span>
              <Chevron />
            </Link>
          </li>
        </ul>
      </section>

      <section className="settings__section">
        <h2 className="settings__group">Privacy and terms</h2>
                  <li>
            <Link to="/notifications" className="settings__row">
              <span className="settings__icon">
                <Icon>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </Icon>
              </span>
              <span className="settings__text">
                <span className="settings__title">Notifications</span>
                <span className="settings__sub">New chapters and reminders</span>
              </span>
              <Chevron />
            </Link>
          </li>
        <ul className="settings__list">
          <li>
            <Link to="/privacy" className="settings__row">
              <span className="settings__icon">
                <Icon>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </Icon>
              </span>
              <span className="settings__text">
                <span className="settings__title">Privacy Policy</span>
                <span className="settings__sub">How we look after your data</span>
              </span>
              <Chevron />
            </Link>
          </li>
          <li>
            <Link to="/terms" className="settings__row">
              <span className="settings__icon">
                <Icon>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </Icon>
              </span>
              <span className="settings__text">
                <span className="settings__title">Terms of Use</span>
                <span className="settings__sub">The rules of the community</span>
              </span>
              <Chevron />
            </Link>
          </li>
        </ul>
      </section>

      <section className="settings__section">
        <ul className="settings__list">
          <li>
            <button
              type="button"
              className="settings__row settings__row--danger"
              onClick={() => signOutUser()}
            >
              <span className="settings__icon">
                <Icon>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </Icon>
              </span>
              <span className="settings__text">
                <span className="settings__title">Log out</span>
              </span>
            </button>
          </li>
        </ul>
      </section>

      <p className="settings__footer">
        {appConfig.appName} · © {new Date().getFullYear()}
      </p>

      {editing && (
        <EditProfileSheet profile={profile} onClose={closeEditor} onSaved={handleSaved} />
      )}
    </div>
  )
}