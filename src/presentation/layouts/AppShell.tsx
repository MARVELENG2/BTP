import { Link, Outlet } from 'react-router-dom'
import { appConfig } from '@/shared/config/appConfig'
import BottomNav from '@/presentation/components/BottomNav'
import CookieBanner from '@/presentation/components/CookieBanner'
import TopBar from '@/presentation/components/TopBar'
import './AppShell.css'

export default function AppShell() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-shell__main">
        <Outlet />
      </main>
      <footer className="app-shell__footer">
        <p>© {new Date().getFullYear()} {appConfig.appName}</p>
        <p>
          <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms</Link>
        </p>
      </footer>
      <BottomNav />
      <CookieBanner />
    </div>
  )
}