import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLibrary, type Library } from '@/application/reader/getLibrary'
import { getThisWeek, type ThisWeek } from '@/application/reader/getThisWeek'
import BookCover from '@/presentation/components/BookCover'
import ThisWeekCard from '@/presentation/components/ThisWeekCard'
import WhatsAppButton from '@/presentation/components/WhatsAppButton'
import './HomeScreen.css'

export default function HomeScreen() {
  const [library, setLibrary] = useState<Library | null>(null)
  const [week, setWeek] = useState<ThisWeek | null>(null)

  useEffect(() => {
    getLibrary().then(setLibrary)
    getThisWeek().then(setWeek)
  }, [])

  if (!library) {
    return <p className="home__loading">Loading your library…</p>
  }

  return (
    <div className="home">
      <section className="home__hero">
        <h1>Read together, one week at a time.</h1>
        <p>Two chapters a week, then we talk about it on WhatsApp.</p>
        <WhatsAppButton />
      </section>

      {week && (
        <section className="home__section">
          <ThisWeekCard week={week} />
        </section>
      )}

      {library.featured.length > 0 && (
        <section className="home__section">
          <div className="home__section-head">
            <h2>Featured</h2>
            <Link to="/library">See all</Link>
          </div>
          <div className="home__featured">
            {library.featured.map((book, i) => (
              <BookCover key={book.id} book={book} size="large" index={i} />
            ))}
          </div>
        </section>
      )}

      {library.shelf.length === 0 && (
        <p className="home__loading">No books yet. Check back soon.</p>
      )}
    </div>
  )
}