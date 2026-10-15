import { Link } from 'react-router-dom'
import { useOnlineStatus } from '@/presentation/hooks/useOnlineStatus'
import './OfflineBanner.css'

export default function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <div className="offline-banner" role="status">
      <span>You're offline. Downloaded chapters still work.</span>
      <Link to="/downloads">Downloads</Link>
    </div>
  )
}