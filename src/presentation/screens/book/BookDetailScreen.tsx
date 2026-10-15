import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBookDetail, type BookDetail } from '@/application/reader/getBookDetail'
import BookCover from '@/presentation/components/BookCover'
import ChapterRow from '@/presentation/components/ChapterRow'
import ThisWeekCard from '@/presentation/components/ThisWeekCard'
import { getWeekdayName } from '@/shared/utils/weekdayName'
import './BookDetailScreen.css'
import DownloadButton from '@/presentation/components/DownloadButton'

export default function BookDetailScreen() {
  const { bookId } = useParams<{ bookId: string }>()
  // undefined = still loading, null = book not found
  const [detail, setDetail] = useState<BookDetail | null | undefined>(undefined)

  useEffect(() => {
    if (!bookId) return
    getBookDetail(bookId).then(setDetail)
  }, [bookId])

  if (detail === undefined) {
    return <p className="book-detail__message">Loading…</p>
  }

  if (detail === null) {
    return (
      <div className="book-detail__message">
        <p>We couldn't find that book.</p>
        <Link to="/library">Back to the library</Link>
      </div>
    )
  }

  const { book, chapters } = detail

  return (
    <div className="book-detail">
      <Link to="/library" className="book-detail__back">
        ← Library
      </Link>

      <header className="book-detail__header">
        <BookCover book={book} size="large" linked={false} />
        <div className="book-detail__info">
          <h1>{book.title}</h1>
          <p className="book-detail__author">by {book.author}</p>
          <ul className="book-detail__facts">
            <li>{book.totalChapters} chapters</li>
            <li>{book.chaptersPerWeek} per week</li>
            <li>Unlocks {getWeekdayName(book.unlockWeekday)}s</li>
          </ul>
        </div>
      </header>

      <p className="book-detail__description">{book.description}</p>

            <ThisWeekCard week={detail} />

      <DownloadButton book={book} />

      <h2>Chapters</h2>
      <ul className="book-detail__chapters">
        {chapters.map((chapter) => (
          <ChapterRow
            key={chapter.number}
            bookId={book.id}
            number={chapter.number}
            title={chapter.title}
                        unlocked={chapter.unlocked}
            read={chapter.read}
          />
        ))}
      </ul>
    </div>
  )
}