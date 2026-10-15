import { useEffect, useState } from 'react'
import { getLibrary, type Library } from '@/application/reader/getLibrary'
import { appConfig } from '@/shared/config/appConfig'
import { chunk } from '@/shared/utils/chunk'
import BookCover from '@/presentation/components/BookCover'
import './LibraryScreen.css'

export default function LibraryScreen() {
  const [library, setLibrary] = useState<Library | null>(null)

  useEffect(() => {
    getLibrary().then(setLibrary)
  }, [])

  if (!library) {
    return <p className="library__loading">Loading your library…</p>
  }

  const rows = chunk(library.shelf, appConfig.booksPerShelfRow)

  return (
    <div className="library">
      <h1>Library</h1>
      <p className="library__intro">Every book we're reading together.</p>
      {rows.length === 0 && <p className="library__loading">No books yet. Check back soon.</p>}
      {rows.map((row, rowIndex) => (
        <div className="shelf" key={rowIndex}>
          <div
            className="shelf__books"
            style={{ gridTemplateColumns: `repeat(${appConfig.booksPerShelfRow}, 1fr)` }}
          >
            {row.map((book, i) => (
              <BookCover
                key={book.id}
                book={book}
                index={rowIndex * appConfig.booksPerShelfRow + i}
              />
            ))}
          </div>
          <div className="shelf__plank" />
        </div>
      ))}
    </div>
  )
}