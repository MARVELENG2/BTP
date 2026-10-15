import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  loadChapterManager,
  removeChapter,
  type ChapterManager,
} from '@/application/admin/manageChapters'
import { isChapterUnlocked } from '@/domain/rules/unlock'
import './AdminChaptersScreen.css'

export default function AdminChaptersScreen() {
  const { bookId } = useParams<{ bookId: string }>()
  // undefined = still loading, null = book not found
  const [manager, setManager] = useState<ChapterManager | null | undefined>(undefined)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!bookId) return
    loadChapterManager(bookId).then(setManager)
  }, [bookId])

  if (!bookId) return null
  if (manager === undefined) return <p className="admin-message">Loading chapters…</p>

  if (manager === null) {
    return (
      <div className="admin-message">
        <p>We couldn't find that book.</p>
        <Link to="/admin">Back to all books</Link>
      </div>
    )
  }

  const { book, chapters } = manager
  const lastId = chapters[chapters.length - 1]?.id

  async function handleDelete(chapterId: string, number: number, title: string) {
    const confirmed = window.confirm(
      `Delete chapter ${number}, "${title}"?\n\nIts text is permanently deleted. This cannot be undone.`,
    )
    if (!confirmed) return

    const result = await removeChapter(book.id, chapterId)
    if (!result.ok) {
      setMessage(result.message ?? 'The chapter could not be deleted.')
      return
    }
    setMessage(`Chapter ${number} was deleted.`)
    setManager(await loadChapterManager(book.id))
  }

  return (
    <div className="admin">
      <Link to="/admin" className="chapter-list__back">
        ← All books
      </Link>
      <h1 className="chapter-list__title">{book.title}</h1>
      <p className="chapter-list__sub">
        {chapters.length} chapters · {book.chaptersPerWeek} unlock per week
      </p>

      <div className="chapter-list__actions">
        <Link to={`/admin/books/${book.id}/chapters/new`} className="admin__add">
          + Paste a chapter
        </Link>
        <Link to={`/admin/books/${book.id}/chapters/upload`} className="admin__button">
          Upload files
        </Link>
      </div>

      {message && <p className="admin__notice">{message}</p>}
      {chapters.length === 0 && (
        <p className="admin-message">No chapters yet. Paste one or upload some files.</p>
      )}

      <ul className="admin__list">
        {chapters.map((chapter) => {
          const unlocked = isChapterUnlocked(book, chapter.number)
          return (
            <li key={chapter.id} className="chapter-row">
              <span className="chapter-row__number">{chapter.number}</span>
              <div className="chapter-row__info">
                <strong>{chapter.title}</strong>
                <span>{unlocked ? 'Unlocked for readers' : 'Locked until its week'}</span>
              </div>
              <div className="chapter-row__actions">
                <Link
                  to={`/admin/books/${book.id}/chapters/${chapter.number}/edit`}
                  className="admin__button"
                >
                  Edit
                </Link>
                {chapter.id === lastId && (
                  <button
                    type="button"
                    className="admin__button admin__button--danger"
                    onClick={() => handleDelete(chapter.id, chapter.number, chapter.title)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}