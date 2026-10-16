import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { OpenChapter } from '@/application/reader/getChapterForReading'
import { countWords } from '@/domain/rules/readingCheck'
import WhatsAppButton from '@/presentation/components/WhatsAppButton'
import ReadMarker from './ReadMarker'
import './ChapterEnd.css'

interface ChapterEndProps {
  access: OpenChapter
}

export default function ChapterEnd({ access }: ChapterEndProps) {
  const { book, chapter, nextChapter, nextUnlocked, nextUnlockAt } = access
  const wordCount = useMemo(() => countWords(chapter.content), [chapter.content])

  if (nextChapter === null) {
    return (
      <div className="chapter-end">
        <ReadMarker bookId={book.id} chapterNumber={chapter.number} wordCount={wordCount} />
        <p className="chapter-end__title">You've finished {book.title}</p>
        <p className="chapter-end__text">What a read. Come and share your thoughts with everyone.</p>
        <div className="chapter-end__actions">
          <WhatsAppButton />
          <Link to={`/books/${book.id}`} className="chapter-end__link">
            Back to the book
          </Link>
        </div>
      </div>
    )
  }

  if (nextUnlocked) {
    return (
      <div className="chapter-end">
        <ReadMarker bookId={book.id} chapterNumber={chapter.number} wordCount={wordCount} />
        <p className="chapter-end__title">End of Chapter {chapter.number}</p>
        <div className="chapter-end__actions">
          <Link
            to={`/books/${book.id}/chapters/${nextChapter}`}
            className="chapter-end__button"
          >
            Continue to Chapter {nextChapter}
          </Link>
          <Link to={`/books/${book.id}`} className="chapter-end__link">
            Back to the book
          </Link>
        </div>
      </div>
    )
  }

  const date = nextUnlockAt
    ? nextUnlockAt.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : ''

  return (
    <div className="chapter-end">
      <ReadMarker bookId={book.id} chapterNumber={chapter.number} wordCount={wordCount} />
      <p className="chapter-end__title">That's all for this week</p>
      <p className="chapter-end__text">
        Chapter {nextChapter} unlocks on {date}. Until then, come and talk about it on WhatsApp.
      </p>
      <div className="chapter-end__actions">
        <WhatsAppButton />
        <Link to={`/books/${book.id}`} className="chapter-end__link">
          Back to the book
        </Link>
      </div>
    </div>
  )
}