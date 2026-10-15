import { useEffect } from 'react'
import { flushPendingReads } from '@/application/reader/readingProgress'
import { useAuth } from '@/presentation/context/useAuth'

// Sends chapters finished offline when the app opens and whenever the connection comes back.
export default function ProgressSync() {
  const { profile, refreshProfile } = useAuth()

  useEffect(() => {
    const onOnline = () => {
      // If the app was opened offline, the profile couldn't load. Load it now.
      if (!profile) refreshProfile()
      flushPendingReads()
    }

    flushPendingReads()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [profile, refreshProfile])

  return null
}