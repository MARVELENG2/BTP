import { useEffect, useState } from 'react'
import type { ThisWeek } from '@/application/reader/getThisWeek'
import { formatCountdown } from '@/shared/utils/formatCountdown'
import './ThisWeekCard.css'

interface ThisWeekCardProps {
  week: ThisWeek
}

export default function ThisWeekCard({ week }: ThisWeekCardProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const { book, unlockedCount, nextUnlockAt } = week
  const percent = Math.round((unlockedCount / book.totalChapters) * 100)

  return (
    <section className="this-week">
      <p className="this-week__label">This week's reading</p>
      <h2 className="this-week__title">{book.title}</h2>
      <p className="this-week__status">
        {unlockedCount === 0
          ? 'Starting soon'
          : `${unlockedCount} of ${book.totalChapters} chapters unlocked`}
      </p>
      <div
        className="this-week__bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      {nextUnlockAt && (
        <p className="this-week__countdown">
          {unlockedCount === 0 ? 'First chapters unlock in' : 'Next chapters unlock in'}{' '}
          <strong>{formatCountdown(nextUnlockAt.getTime() - now)}</strong>
        </p>
      )}
    </section>
  )
}