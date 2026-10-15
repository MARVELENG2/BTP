import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  clearAllDownloads,
  listDownloads,
  removeDownloads,
  type DownloadedBookItem,
} from '@/application/offline/downloads'
import { getPendingReadCount } from '@/application/reader/readingProgress'
import { formatBytes } from '@/domain/rules/downloads'
import BookCover from '@/presentation/components/BookCover'
import './DownloadsScreen.css'

export default function DownloadsScreen() {
  // undefined = still loading
  const [items, setItems] = useState<DownloadedBookItem[] | undefined>(undefined)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    listDownloads().then(setItems)
  }, [])

  // Chapters finished offline and not yet sent. The count drops once the connection is back.
  useEffect(() => {
    const refresh = () => getPendingReadCount().then(setPending)
    refresh()
    const id = setInterval(refresh, 3000)
    return () => clearInterval(id)
  }, [])

  if (items === undefined) return <p className="downloads__message">Loading…</p>

  const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0)

  async function handleRemove(item: DownloadedBookItem) {
    const confirmed = window.confirm(
      `Remove "${item.book.title}" from this device?\n\nYou can download it again whenever you're online.`,
    )
    if (!confirmed) return
    await removeDownloads(item.book.id)
    setItems(await listDownloads())
  }

  async function handleRemoveAll() {
    const confirmed = window.confirm('Remove all downloaded chapters from this device?')
    if (!confirmed) return
    await clearAllDownloads()
    setItems(await listDownloads())
  }

  return (
    <div className="downloads">
      <h1>Downloads</h1>

      {pending > 0 && (
        <p className="downloads__pending" role="status">
          {pending} {pending === 1 ? 'chapter' : 'chapters'} finished offline.{' '}
          {pending === 1 ? 'It' : 'They'} will count toward your progress once you're back online.
        </p>
      )}

      {items.length === 0 ? (
        <p className="downloads__empty">
          Nothing is saved on this device yet. Open a book and tap Download to read it without a
          connection.
        </p>
      ) : (
        <>
          <p className="downloads__summary">
            Using {formatBytes(totalBytes)} on this device.{' '}
            <button type="button" className="downloads__link-button" onClick={handleRemoveAll}>
              Remove all
            </button>
          </p>

          <ul className="downloads__list">
            {items.map((item) => (
              <li key={item.book.id} className="downloads__item">
                <div className="downloads__cover">
                  <BookCover book={item.book} linked={false} />
                </div>
                <div className="downloads__info">
                  <strong>{item.book.title}</strong>
                  <span>
                    {item.chapters.length} {item.chapters.length === 1 ? 'chapter' : 'chapters'} ·{' '}
                    {formatBytes(item.bytes)}
                  </span>
                  <div className="downloads__chips">
                    {item.chapters.map((chapter) => (
                      <Link
                        key={chapter.number}
                        to={`/books/${item.book.id}/chapters/${chapter.number}`}
                        className="downloads__chip"
                        title={chapter.title}
                      >
                        Ch. {chapter.number}
                      </Link>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="downloads__link-button downloads__link-button--danger"
                    onClick={() => handleRemove(item)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}