import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadBookForAdmin } from '@/application/admin/manageBooks'
import type { Book } from '@/domain/models'
import BookForm from '@/presentation/components/admin/BookForm'

export default function AdminBookFormScreen() {
  const { bookId } = useParams<{ bookId: string }>()
  // undefined = still loading, null = not found
  const [book, setBook] = useState<Book | null | undefined>(undefined)

  useEffect(() => {
    if (!bookId) return
    loadBookForAdmin(bookId).then(setBook)
  }, [bookId])

  if (!bookId) return <BookForm />

  if (book === undefined) return <p className="admin-message">Loading book…</p>

  if (book === null) {
    return (
      <div className="admin-message">
        <p>We couldn't find that book.</p>
        <Link to="/admin">Back to all books</Link>
      </div>
    )
  }

  return <BookForm key={book.id} initial={book} />
}