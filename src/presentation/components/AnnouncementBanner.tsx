import { useEffect, useState } from 'react'
import { dismissAnnouncement, getAnnouncementForReader } from '@/application/settings/announcements'
import type { Announcement } from '@/domain/rules/announcement'
import './AnnouncementBanner.css'

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    getAnnouncementForReader()
      .then(setAnnouncement)
      .catch(() => setAnnouncement(null))
  }, [])

  if (!announcement) return null

  const handleClose = () => {
    dismissAnnouncement(announcement.version)
    setAnnouncement(null)
  }

  return (
    <div className="announcement" role="status">
      <p>{announcement.text}</p>
      <button type="button" onClick={handleClose} aria-label="Dismiss announcement">
        ×
      </button>
    </div>
  )
}