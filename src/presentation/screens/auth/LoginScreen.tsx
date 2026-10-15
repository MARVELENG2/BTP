import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInUser } from '@/application/account/signInUser'
import './AuthScreen.css'

export default function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    const outcome = await signInUser(email, password)
    setBusy(false)

    if (!outcome.ok) {
      setMessage(outcome.message)
      return
    }
    navigate('/profile', { replace: true })
  }

  return (
    <div className="auth">
      <h1>Welcome back</h1>
      <p className="auth__intro">Log in to pick up where you left off.</p>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {message && <p className="auth__message">{message}</p>}

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
              autoComplete="current-password"
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
        </div>

        <button type="submit" className="auth__button" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="auth__switch">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  )
}