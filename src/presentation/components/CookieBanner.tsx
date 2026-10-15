import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCookieConsent, saveCookieConsent } from '@/application/privacy/cookieConsent'
import type { CookieConsent } from '@/domain/models'
import './CookieBanner.css'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => getCookieConsent() === null)

  if (!visible) return null

  const choose = (choice: CookieConsent) => {
    saveCookieConsent(choice)
    setVisible(false)
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie preferences">
      <p>
        We use essential storage to keep you signed in and remember your reading settings. With
        your OK, we may also use optional cookies to understand how the app is used.{' '}
        <Link to="/privacy">Privacy policy</Link>
      </p>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="cookie-banner__button cookie-banner__button--ghost"
          onClick={() => choose('declined')}
        >
          Essential only
        </button>
        <button type="button" className="cookie-banner__button" onClick={() => choose('accepted')}>
          Accept all
        </button>
      </div>
    </div>
  )
}