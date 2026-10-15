import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Book } from '@/domain/models'
import { getCoverColor } from '@/presentation/theme/coverColors'
import './BookCover.css'

interface BookCoverProps {
  book: Book
  size?: 'small' | 'large'
  index?: number
  linked?: boolean
}

export default function BookCover({
  book,
  size = 'small',
  index = 0,
  linked = true,
}: BookCoverProps) {
  // Remember which image URL failed to load, so we show the coloured placeholder instead.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const className = `book-cover book-cover--${size}${linked ? '' : ' book-cover--static'}`
  const style = { animationDelay: `${index * 80}ms` }

  const showImage = Boolean(book.coverUrl) && failedUrl !== book.coverUrl

  const inner = showImage ? (
    <img
      src={book.coverUrl}
      alt={book.title}
      className="book-cover__image"
      onError={() => setFailedUrl(book.coverUrl)}
    />
  ) : (
    <span className="book-cover__placeholder" style={{ background: getCoverColor(book.id) }}>
      <span className="book-cover__title">{book.title}</span>
      <span className="book-cover__author">{book.author}</span>
    </span>
  )

  if (!linked) {
    return (
      <div className={className} style={style}>
        {inner}
      </div>
    )
  }

  return (
    <Link to={`/books/${book.id}`} className={className} style={style} aria-label={book.title}>
      {inner}
    </Link>
  )
}