import { Link } from 'react-router-dom'
import Logo from '@/presentation/components/Logo'
import OfflineBanner from '@/presentation/components/OfflineBanner'
import { appConfig } from '@/shared/config/appConfig'
import './TopBar.css'

export default function TopBar() {
  return (
    <>
      <header className="top-bar">
        <Link to="/" className="top-bar__brand" aria-label={appConfig.appName}>
          <Logo size={36} />
          <span className="top-bar__name">{appConfig.appName}</span>
        </Link>
        <Link to="/notifications" className="top-bar__icon-button" aria-label="Notifications">
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
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </Link>
      </header>
      <OfflineBanner />
    </>
  )
}