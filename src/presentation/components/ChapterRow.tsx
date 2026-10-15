import { Link } from 'react-router-dom'
import './ChapterRow.css'

interface ChapterRowProps {
  bookId: string
  number: number
  title: string
  unlocked: boolean
  read?: boolean
}

export default function ChapterRow({ bookId, number, title, unlocked, read = false }: ChapterRowProps) {
  const className = [
    'chapter-row',
    unlocked ? 'chapter-row--unlocked' : 'chapter-row--locked',
    read ? 'chapter-row--read' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li>
      <Link to={`/books/${bookId}/chapters/${number}`} className={className}>
        <span className="chapter-row__badge" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {!unlocked ? (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </>
            ) : read ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <circle cx="12" cy="12" r="4" />
            )}
          </svg>
        </span>
        <span className="chapter-row__text">
          <span className="chapter-row__label">Chapter {number}</span>
          <span className="chapter-row__title">{title}</span>
        </span>
        <span className="chapter-row__status">{read ? 'Read' : unlocked ? 'New' : 'Locked'}</span>
      </Link>
    </li>
  )
}