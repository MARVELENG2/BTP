import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReadingSummary, type ReadingSummary } from '@/application/reader/readingProgress'
import './ReadingStats.css'

function weeks(count: number): string {
  return `${count} ${count === 1 ? 'week' : 'weeks'}`
}

export default function ReadingStats() {
  // undefined = still loading, null = not signed in
  const [summary, setSummary] = useState<ReadingSummary | null | undefined>(undefined)

  useEffect(() => {
    getReadingSummary().then(setSummary)
  }, [])

  if (summary === undefined) return <p className="reading-stats__loading">Loading your progress…</p>
  if (summary === null) return null

  const { streak, badges, books } = summary

  return (
    <div className="reading-stats">
      <section className="reading-stats__streak">
        <span className="reading-stats__streak-number">{streak.current}</span>
        <div className="reading-stats__streak-text">
          <strong>Week streak</strong>
          <span>
            {streak.current === 0
              ? 'Finish a chapter this week to start one.'
              : `Longest so far: ${weeks(streak.longest)}`}
          </span>
        </div>
      </section>

      <section>
        <h2>Badges</h2>
        {badges.length === 0 ? (
          <p className="reading-stats__empty">Finish a book to earn your first badge.</p>
        ) : (
          <ul className="reading-stats__badges">
            {badges.map((badge) => (
              <li key={badge.id} title={badge.description}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                </svg>
                {badge.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Your books</h2>
        {books.length === 0 ? (
          <p className="reading-stats__empty">
            Read a chapter to the end and your progress will show up here.
          </p>
        ) : (
          <ul className="reading-stats__books">
            {books.map((item) => {
              const percent =
                item.book.totalChapters > 0
                  ? Math.round((item.chaptersRead / item.book.totalChapters) * 100)
                  : 0
              return (
                <li key={item.book.id} className="reading-stats__book">
                  <div className="reading-stats__book-head">
                    <strong>{item.book.title}</strong>
                    <span>
                      {item.chaptersRead} of {item.book.totalChapters}
                    </span>
                  </div>
                  <div
                    className="reading-stats__bar"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  {item.completed ? (
                    <span className="reading-stats__done">Finished</span>
                  ) : item.nextChapter !== null ? (
                    <Link
                      to={`/books/${item.book.id}/chapters/${item.nextChapter}`}
                      className="reading-stats__continue"
                    >
                      Continue with chapter {item.nextChapter}
                    </Link>
                  ) : (
                    <span className="reading-stats__wait">
                      You're all caught up. New chapters unlock soon.
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}