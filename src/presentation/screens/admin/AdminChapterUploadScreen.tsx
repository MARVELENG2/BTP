import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadChapterManager, type ChapterManager } from '@/application/admin/manageChapters'
import ChapterUploader from '@/presentation/components/admin/ChapterUploader'

export default function AdminChapterUploadScreen() {
  const { bookId } = useParams<{ bookId: string }>()
  // undefined = still loading, null = book not found
  const [manager, setManager] = useState<ChapterManager | null | undefined>(undefined)

  useEffect(() => {
    if (!bookId) return
    loadChapterManager(bookId).then(setManager)
  }, [bookId])

  if (!bookId) return null
  if (manager === undefined) return <p className="admin-message">Loading…</p>

  if (manager === null) {
    return (
      <div className="admin-message">
        <p>We couldn't find that book.</p>
        <Link to="/admin">Back to all books</Link>
      </div>
    )
  }

  return (
    <ChapterUploader
      bookId={bookId}
      bookTitle={manager.book.title}
      startNumber={manager.chapters.length + 1}
    />
  )
}