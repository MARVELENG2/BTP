import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReadingSummary, type ReadingSummary } from '@/application/reader/readingProgress'
import './ReadingStats.css'

function weeks(count: number): string {
  return `${count} ${count === 1 ? 'week' : 'weeks'}`
}

function Flame({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

export default function ReadingStats() {
  // undefined = still loading, null = not signed in
  const [summary, setSummary] = useState<ReadingSummary | null | undefined>(undefined)

  useEffect(() => {
    getReadingSummary().then(setSummary)
  }, [])

  if (summary === undefined) return <p className="reading-stats__loading">Loading your progress…</p>
  if (summary === null) return null

  const { streak, badges, books, week, nextMilestone } = summary

  return (
    <div className="reading-stats">
      <section className="reading-stats__streak">
        <span className="reading-stats__streak-number">
          <Flame filled={streak.completedThisWeek} />
          {streak.current}
        </span>
        <div className="reading-stats__streak-text">
          <strong>Week streak</strong>
          <span>
            {streak.current === 0
              ? 'Finish a chapter this week to start one.'
              : streak.completedThisWeek
                ? `This week is done. Longest so far: ${weeks(streak.longest)}`
                : `Finish a chapter this week to keep it going. Longest so far: ${weeks(streak.longest)}`}
          </span>
          {streak.freezes > 0 && (
            <span className="reading-stats__freeze">
              {streak.freezes} streak {streak.freezes === 1 ? 'freeze' : 'freezes'} in reserve
            </span>
          )}
          {nextMilestone && (
            <span className="reading-stats__next">
              {weeks(nextMilestone.remaining)} to go for the {nextMilestone.weeks}-week badge
            </span>
          )}
        </div>
      </section>

      <section>
        <h2>This week</h2>
        <ol className="reading-stats__week">
          {week.map((day) => {
            const classes = ['reading-stats__day']
            if (day.hasRead) classes.push('reading-stats__day--read')
            if (day.isToday) classes.push('reading-stats__day--today')
            if (day.isFuture) classes.push('reading-stats__day--future')

            return (
              <li
                key={day.label}
                className={classes.join(' ')}
                aria-label={`${day.label} ${day.date}: ${day.hasRead ? 'finished a chapter' : day.isFuture ? 'still to come' : 'no reading'}`}
              >
                <span className="reading-stats__day-label">{day.label}</span>
                <span className="reading-stats__day-icon">
                  {day.hasRead ? <Flame filled /> : <span className="reading-stats__day-dot" />}
                </span>
                <span className="reading-stats__day-date">{day.date}</span>
              </li>
            )
          })}
        </ol>
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