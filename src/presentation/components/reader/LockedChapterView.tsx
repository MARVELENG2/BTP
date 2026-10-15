import { Link } from 'react-router-dom'
import type { LockedChapter } from '@/application/reader/getChapterForReading'
import WhatsAppButton from '@/presentation/components/WhatsAppButton'
import { useNow } from '@/presentation/hooks/useNow'
import { formatCountdown } from '@/shared/utils/formatCountdown'
import { getWeekdayName } from '@/shared/utils/weekdayName'
import './LockedChapterView.css'

interface LockedChapterViewProps {
  access: LockedChapter
}

export default function LockedChapterView({ access }: LockedChapterViewProps) {
  const now = useNow()
  const { book, chapterNumber, preview, unlockAt } = access
  const remaining = unlockAt.getTime() - now

  return (
    <div className="locked">
      <Link to={`/books/${book.id}`} className="locked__back">
        ← {book.title}
      </Link>

      <div className="locked__preview">
        <p className="locked__text" aria-hidden="true">
          {preview}
        </p>
        <div className="locked__lock">
          <span>
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        </div>
      </div>

      <h1>Chapter {chapterNumber} is locked</h1>

      {remaining > 0 ? (
        <p className="locked__countdown">
          It unlocks in <strong>{formatCountdown(remaining)}</strong>
        </p>
      ) : (
        <p className="locked__countdown">
          This chapter just unlocked. Reload the page to start reading.
        </p>
      )}

      <p className="locked__hint">
        Chapters unlock on {getWeekdayName(book.unlockWeekday)}s, {book.chaptersPerWeek} at a time,
        so everyone reads together. Meet us on WhatsApp to talk about what you've read so far.
      </p>

      <WhatsAppButton />

      <Link to={`/books/${book.id}`} className="locked__button">
        Back to the book
      </Link>
    </div>
  )
}