import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadChapterForEdit, type EditableChapter } from '@/application/admin/manageChapters'
import ChapterForm from '@/presentation/components/admin/ChapterForm'

export default function AdminChapterEditorScreen() {
  const { bookId, chapterNumber } = useParams<{ bookId: string; chapterNumber: string }>()
  // undefined = still loading, null = not found
  const [chapter, setChapter] = useState<EditableChapter | null | undefined>(undefined)

  useEffect(() => {
    if (!bookId || !chapterNumber) return
    loadChapterForEdit(bookId, Number(chapterNumber)).then(setChapter)
  }, [bookId, chapterNumber])

  if (!bookId) return null
  if (!chapterNumber) return <ChapterForm bookId={bookId} />

  if (chapter === undefined) return <p className="admin-message">Loading chapter…</p>

  if (chapter === null) {
    return (
      <div className="admin-message">
        <p>We couldn't find that chapter.</p>
        <Link to={`/admin/books/${bookId}/chapters`}>Back to chapters</Link>
      </div>
    )
  }

  return <ChapterForm key={chapter.id} bookId={bookId} initial={chapter} />
}