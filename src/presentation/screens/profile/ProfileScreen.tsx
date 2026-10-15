import { Link } from 'react-router-dom'
import { signOutUser } from '@/application/account/session'
import Avatar from '@/presentation/components/Avatar'
import ReadingStats from '@/presentation/components/ReadingStats'
import { useAuth } from '@/presentation/context/useAuth'
import './ProfileScreen.css'

export default function ProfileScreen() {
  const { profile, loading } = useAuth()

  if (loading) {
    return <p className="profile__loading">Loading…</p>
  }

  if (!profile) {
    return (
      <div className="profile">
        <div className="profile__placeholder" aria-hidden="true">
          ?
        </div>
        <h1>Your reading corner</h1>
        <p>
          Create an account to track your progress, keep your weekly streak, and collect a badge
          for every book you finish.
        </p>
        <div className="profile__actions">
          <Link to="/signup" className="profile__button">
            Create account
          </Link>
          <Link to="/login" className="profile__button profile__button--ghost">
            Log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="profile">
      <div className="profile__avatar">
        <Avatar avatarId={profile.avatarId} size={104} label={`${profile.name}'s avatar`} />
      </div>
      <h1>{profile.name}</h1>
      <p className="profile__email">{profile.email}</p>
      {profile.role === 'admin' && <span className="profile__badge">Admin</span>}

      <ReadingStats />

      <div className="profile__actions">
        {profile.role === 'admin' && (
          <Link to="/admin" className="profile__button">
            Admin panel
          </Link>
        )}
        <Link to="/settings" className="profile__button profile__button--ghost">
          Settings
        </Link>
        <button
          type="button"
          className="profile__button profile__button--ghost"
          onClick={() => signOutUser()}
        >
          Log out
        </button>
      </div>
    </div>
  )
}