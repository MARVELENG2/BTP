import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBooksForAdmin, removeBook } from '@/application/admin/manageBooks'
import type { Book } from '@/domain/models'
import BookCover from '@/presentation/components/BookCover'
import './AdminBooksScreen.css'

export default function AdminBooksScreen() {
  const [books, setBooks] = useState<Book[] | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    listBooksForAdmin().then(setBooks)
  }, [])

  async function handleDelete(book: Book) {
    const confirmed = window.confirm(
      `Delete "${book.title}"?\n\nThis permanently deletes the book and all ${book.totalChapters} of its chapters. This cannot be undone.`,
    )
    if (!confirmed) return

    const result = await removeBook(book.id)
    if (!result.ok) {
      setMessage(result.message ?? 'The book could not be deleted.')
      return
    }
    setMessage(`"${book.title}" was deleted.`)
    setBooks(await listBooksForAdmin())
  }

  if (!books) return <p className="admin-message">Loading books…</p>

  return (
    <div className="admin">
      <div className="admin__head">
        <h1>Manage books</h1>
               <div className="admin__head-actions">
          <Link to="/admin/settings" className="admin__button">
            Settings
          </Link>
          <Link to="/admin/books/new" className="admin__add">
            + Add book
          </Link>
        </div>
      </div>

      {message && <p className="admin__notice">{message}</p>}
      {books.length === 0 && <p className="admin-message">No books yet. Add your first one.</p>}

      <ul className="admin__list">
        {books.map((book) => (
          <li key={book.id} className="admin__item">
            <div className="admin__cover">
              <BookCover book={book} linked={false} />
            </div>
            <div className="admin__info">
              <strong>{book.title}</strong>
              <span>{book.author || 'No author'}</span>
              <span>
                {book.totalChapters} chapters · {book.chaptersPerWeek} per week
              </span>
              <div className="admin__actions">
                                <Link to={`/admin/books/${book.id}/chapters`} className="admin__button">
                  Chapters
                </Link>
                <Link to={`/admin/books/${book.id}/edit`} className="admin__button">
                  Edit
                </Link>
                <button
                  type="button"
                  className="admin__button admin__button--danger"
                  onClick={() => handleDelete(book)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}