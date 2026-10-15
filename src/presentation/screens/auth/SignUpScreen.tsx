import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUpUser } from '@/application/account/signUpUser'
import type { Gender } from '@/domain/models'
import { MIN_PASSWORD_LENGTH, type SignUpErrors } from '@/domain/rules/signUp'
import AvatarPicker from '@/presentation/components/AvatarPicker'
import './AuthScreen.css'

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'unspecified', label: 'Prefer not to say' },
]

export default function SignUpScreen() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [gender, setGender] = useState<Gender | ''>('')
  const [avatarId, setAvatarId] = useState('')
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const chooseGender = (value: Gender) => {
    setGender(value)
    setAvatarId('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    const outcome = await signUpUser({ name, email, password, gender, avatarId })
    setBusy(false)

    if (!outcome.ok) {
      setErrors(outcome.errors)
      setMessage(outcome.message)
      return
    }

    setErrors({})
    if (outcome.needsEmailConfirmation) setConfirmationSent(true)
    else navigate('/profile', { replace: true })
  }

  if (confirmationSent) {
    return (
      <div className="auth">
        <h1>Check your email</h1>
        <p className="auth__intro">
          We sent a confirmation link to <strong>{email}</strong>. Open it, then come back and log
          in.
        </p>
        <Link to="/login" className="auth__button">
          Go to log in
        </Link>
      </div>
    )
  }

  return (
    <div className="auth">
      <h1>Join the community</h1>
      <p className="auth__intro">Create your account to read along, week by week.</p>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {message && <p className="auth__message">{message}</p>}

        <div className="auth__field">
          <label className="auth__label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            className="auth__input"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name && <p className="auth__error">{errors.name}</p>}
        </div>

        <div className="auth__field">
          <label className="auth__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="auth__input"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && <p className="auth__error">{errors.email}</p>}
        </div>

        <div className="auth__field">
          <label className="auth__label" htmlFor="password">
            Password
          </label>
          <div className="auth__password-row">
            <input
              id="password"
              className="auth__input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="auth__toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password ? (
            <p className="auth__error">{errors.password}</p>
          ) : (
            <p className="auth__hint">At least {MIN_PASSWORD_LENGTH} characters.</p>
          )}
        </div>

        <div className="auth__field" role="radiogroup" aria-label="Gender">
          <span className="auth__label">Gender</span>
          <div className="auth__options">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={gender === option.value}
                className={
                  gender === option.value
                    ? 'auth__option auth__option--active'
                    : 'auth__option'
                }
                onClick={() => chooseGender(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.gender && <p className="auth__error">{errors.gender}</p>}
        </div>

        <div className="auth__field">
          <span className="auth__label">Choose your avatar</span>
          {gender === '' ? (
            <p className="auth__hint">Pick an option above to see your avatars.</p>
          ) : (
            <AvatarPicker gender={gender} value={avatarId} onChange={setAvatarId} />
          )}
          {errors.avatarId && <p className="auth__error">{errors.avatarId}</p>}
        </div>

        <button type="submit" className="auth__button" disabled={busy}>
          {busy ? 'Creating your account…' : 'Create account'}
        </button>
      </form>

      <p className="auth__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}