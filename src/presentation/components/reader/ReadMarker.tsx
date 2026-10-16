import { useEffect, useRef, useState } from 'react'
import { markChapterRead } from '@/application/reader/readingProgress'
import { isRealRead } from '@/domain/rules/readingCheck'
import './ReadMarker.css'

interface ReadMarkerProps {
  bookId: string
  chapterNumber: number
  wordCount: number
}

type Status = 'reading' | 'waiting' | 'counted'

// Sits at the end of a chapter. It counts as read once this scrolls or flips into view AND the
// reader has spent enough time on the chapter. Time only counts while the app is visible.
export default function ReadMarker({ bookId, chapterNumber, wordCount }: ReadMarkerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('reading')

  useEffect(() => {
    const element = ref.current
    let reachedEnd = false
    let activeSeconds = 0
    let lastTick = Date.now()
    let counted = false
    let observer: IntersectionObserver | undefined

    const evaluate = () => {
      if (counted || !reachedEnd) return
      if (isRealRead({ reachedEnd, activeSeconds, wordCount })) {
        counted = true
        clearInterval(timer)
        setStatus('counted')
        markChapterRead(bookId, chapterNumber)
      } else {
        setStatus('waiting')
      }
    }

    const timer = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.min((now - lastTick) / 1000, 2)
      lastTick = now
      if (document.visibilityState === 'visible') activeSeconds += elapsed
      evaluate()
    }, 1000)

    if (element && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reachedEnd = true
          observer?.disconnect()
          evaluate()
        }
      })
      observer.observe(element)
    }

    return () => {
      clearInterval(timer)
      observer?.disconnect()
    }
  }, [bookId, chapterNumber, wordCount])

  return (
    <>
      <div ref={ref} aria-hidden="true" style={{ height: 2 }} />
      {status === 'waiting' && (
        <p className="read-status" role="status">
          Almost there. This chapter counts once you've spent a little more time with it.
        </p>
      )}
      {status === 'counted' && (
        <p className="read-status read-status--done" role="status">
          ✓ Chapter counted as read
        </p>
      )}
    </>
  )
}