import { useEffect, useRef } from 'react'
import { markChapterRead } from '@/application/reader/readingProgress'

interface ReadMarkerProps {
  bookId: string
  chapterNumber: number
}

// When this scrolls or flips into view, the reader has reached the end and the chapter counts as read.
export default function ReadMarker({ bookId, chapterNumber }: ReadMarkerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect()
        markChapterRead(bookId, chapterNumber)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [bookId, chapterNumber])

  return <div ref={ref} aria-hidden="true" style={{ height: 2 }} />
}