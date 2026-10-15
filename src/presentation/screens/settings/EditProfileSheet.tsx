import { useEffect, useState, type FormEvent } from 'react'
import { updateProfile } from '@/application/account/updateProfile'
import type { Gender, Profile } from '@/domain/models'
import { getAvatarIds } from '@/domain/rules/avatars'
import { hasProfileChanges, type ProfileEditErrors } from '@/domain/rules/profileEdit'
import Avatar from '@/presentation/components/Avatar'
import AvatarPicker from '@/presentation/components/AvatarPicker'
import ProgressButton from '@/presentation/components/admin/ProgressButton'
import './EditProfileSheet.css'

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'unspecified', label: 'Prefer not to say' },
]

interface EditProfileSheetProps {
  profile: Profile
  onClose: () => void
  // runs after a successful save; the screen closes the sheet from there
  onSaved: () => Promise<void>
}

export default function EditProfileSheet({ profile, onClose, onSaved }: EditProfileSheetProps) {
  const [name, setName] = useState(profile.name)
  const [gender, setGender] = useState<Gender>(profile.gender)
  const [avatarId, setAvatarId] = useState(profile.avatarId)
  const [errors, setErrors] = useState<ProfileEditErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const draft = { name, gender, avatarId }
  const changed = hasProfileChanges(profile, draft)

  // Keep the page behind the sheet from scrolling while it is open.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Avatars belong to a gender, so changing it picks a valid avatar straight away.
  function chooseGender(value: Gender) {
    if (value === gender) return
    setGender(value)
    setAvatarId(value === profile.gender ? profile.avatarId : (getAvatarIds(value)[0] ?? ''))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || !changed) return
    setSaving(true)
    setMessage(null)
    setErrors({})

    const result = await updateProfile(profile.id, draft)
    if (result.ok) {
      await onSaved()
      return
    }
    setErrors(result.errors)
    setMessage(result.message ?? null)
    setSaving(false)
  }

  return (
    <div className="edit-sheet" role="dialog" aria-modal="true" aria-label="Edit profile">
      <button type="button" className="edit-sheet__backdrop" aria-label="Close" onClick={onClose} />

      <form className="edit-sheet__panel" onSubmit={handleSubmit} noValidate>
        <div className="edit-sheet__head">
          <h2>Edit profile</h2>
          <button
            type="button"
            className="edit-sheet__close"
            onClick={onClose}
            aria-label="Close"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className="edit-sheet__body">
          <div className="edit-sheet__preview">
            <Avatar avatarId={avatarId} size={88} label="Your avatar" />
          </div>

          <div className="edit-sheet__field">
            <label className="edit-sheet__label" htmlFor="edit-name">
              Name
            </label>
            <input
              id="edit-name"
              className="edit-sheet__input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name && <p className="edit-sheet__error">{errors.name}</p>}
          </div>

          <div className="edit-sheet__field" role="radiogroup" aria-label="Gender">
            <span className="edit-sheet__label">Gender</span>
            <div className="edit-sheet__options">
              {GENDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={gender === option.value}
                  className={
                    gender === option.value
                      ? 'edit-sheet__option edit-sheet__option--active'
                      : 'edit-sheet__option'
                  }
                  onClick={() => chooseGender(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="edit-sheet__field">
            <span className="edit-sheet__label">Avatar</span>
            <AvatarPicker gender={gender} value={avatarId} onChange={setAvatarId} />
            {errors.avatarId && <p className="edit-sheet__error">{errors.avatarId}</p>}
          </div>

          {message && <p className="edit-sheet__message">{message}</p>}
        </div>

        <div className="edit-sheet__footer">
          <ProgressButton idleLabel="Save changes" busy={saving} label="Saving…" disabled={!changed} />
        </div>
      </form>
    </div>
  )
}