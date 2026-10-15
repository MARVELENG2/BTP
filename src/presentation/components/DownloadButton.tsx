import { useEffect, useState, type FormEvent } from 'react'
import {
  downloadUnlockedChapters,
  getDownloadStatus,
  removeDownloads,
  type DownloadProgress,
  type DownloadStatus,
} from '@/application/offline/downloads'
import type { Book } from '@/domain/models'
import ProgressButton from '@/presentation/components/admin/ProgressButton'
import { useAuth } from '@/presentation/context/useAuth'
import { useOnlineStatus } from '@/presentation/hooks/useOnlineStatus'
import './DownloadButton.css'

interface DownloadButtonProps {
  book: Book
}

export default function DownloadButton({ book }: DownloadButtonProps) {
  const { profile } = useAuth()
  const online = useOnlineStatus()
  const [status, setStatus] = useState<DownloadStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getDownloadStatus(book).then(setStatus)
  }, [book])

  // Downloads are for signed-in readers.
  if (!profile || !status) return null

  const missing = status.available - status.downloaded
  const complete = status.available > 0 && missing === 0

  async function handleDownload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage(null)
    setProgress({ label: 'Starting…', percent: 0 })

    const result = await downloadUnlockedChapters(book, setProgress)
    if (!result.ok) setMessage(result.message ?? 'The download failed. Please try again.')

    setStatus(await getDownloadStatus(book))
    setProgress(null)
    setBusy(false)
  }

  async function handleRemove() {
    await removeDownloads(book.id)
    setMessage(null)
    setStatus(await getDownloadStatus(book))
  }

  return (
    <section className="download-card">
      <div className="download-card__text">
        <strong>Read offline</strong>
        <span>
          {status.available === 0
            ? 'Chapters can be downloaded once they unlock.'
            : `${status.downloaded} of ${status.available} unlocked chapters saved on this device.`}
        </span>
      </div>

      {message && <p className="download-card__message">{message}</p>}

      {missing > 0 && (
        <form onSubmit={handleDownload}>
          <ProgressButton
            idleLabel={missing === 1 ? 'Download 1 chapter' : `Download ${missing} chapters`}
            busy={busy}
            label={progress?.label}
            percent={progress?.percent ?? null}
            disabled={!online}
          />
        </form>
      )}

      {complete && <p className="download-card__done">✓ Saved on this device</p>}

      {status.downloaded > 0 && !busy && (
        <button type="button" className="download-card__remove" onClick={handleRemove}>
          Remove downloads
        </button>
      )}
    </section>
  )
}