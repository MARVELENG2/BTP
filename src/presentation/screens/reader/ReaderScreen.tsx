import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getChapterForReading,
  type ChapterAccess,
} from '@/application/reader/getChapterForReading'
import {
  loadReadingPreferences,
  updateReadingPreferences,
} from '@/application/reader/readingPreferences'
import type { ReadingPreferences } from '@/domain/models'
import ChapterBody from '@/presentation/components/reader/ChapterBody'
import ChapterEnd from '@/presentation/components/reader/ChapterEnd'
import FlipReader from '@/presentation/components/reader/FlipReader'
import LockedChapterView from '@/presentation/components/reader/LockedChapterView'
import LoginRequiredView from '@/presentation/components/reader/LoginRequiredView'
import ReaderSettings from '@/presentation/components/reader/ReaderSettings'
import { FONT_STACKS, READER_COLORS } from '@/presentation/theme/readerOptions'
import './ReaderScreen.css'

export default function ReaderScreen() {
  const { bookId, chapterNumber } = useParams<{ bookId: string; chapterNumber: string }>()
  // undefined = still loading
  const [access, setAccess] = useState<ChapterAccess | undefined>(undefined)
  const [preferences, setPreferences] = useState<ReadingPreferences>(() =>
    loadReadingPreferences(),
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (!bookId || !chapterNumber) return
    let active = true
    getChapterForReading(bookId, Number(chapterNumber)).then((result) => {
      if (active) setAccess(result)
    })
    return () => {
      active = false
    }
  }, [bookId, chapterNumber])

  if (access === undefined) {
    return <p className="reader__message">Opening chapter…</p>
  }

  if (access.status === 'not-found') {
    return (
      <div className="reader__message">
              {access.offline ? (
          <p>
            This chapter couldn't be loaded. Without a connection, only chapters you've downloaded
            can be opened.
          </p>
        ) : (
          <p>We couldn't find that chapter.</p>
        )}
        <Link to={access.offline ? '/downloads' : '/library'}>
          {access.offline ? 'Open downloads' : 'Back to the library'}
        </Link>
      </div>
    )
  }

  if (access.status === 'login-required') {
    return <LoginRequiredView access={access} />
  }

  if (access.status === 'locked') {
    return <LockedChapterView access={access} />
  }

  const night = preferences.nightMode
  const colors = night ? READER_COLORS.night : READER_COLORS.day
  const texture = night ? 'none' : preferences.texture
  const surfaceClass = `reader-surface--${texture}`

  const style = {
    '--reader-bg': night ? READER_COLORS.night.page : preferences.pageColor,
    '--reader-text': colors.text,
    '--reader-backdrop': colors.backdrop,
    '--reader-chrome': colors.chrome,
    '--reader-font': FONT_STACKS[preferences.font],
    '--reader-size': `${preferences.textSize}px`,
    '--reader-line': String(preferences.lineSpacing),
  } as CSSProperties

  const handleChange = (patch: Partial<ReadingPreferences>) => {
    setPreferences(updateReadingPreferences(preferences, patch))
  }

  const body = (
    <ChapterBody
      chapterNumber={access.chapter.number}
      title={access.chapter.title}
      paragraphs={access.chapter.content.split('\n\n')}
      end={<ChapterEnd access={access} />}
    />
  )

  return (
    <div className="reader" style={style}>
      <header className="reader__header">
        <Link
          to={`/books/${access.book.id}`}
          className="reader__back"
          aria-label="Back to the book"
        >
          ←
        </Link>
        <div className="reader__heading">
          <span className="reader__book">{access.book.title}</span>
          <span className="reader__chapter">Chapter {access.chapter.number}</span>
        </div>
        <button
          type="button"
          className="reader__settings-button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Reading settings"
        >
          Aa
        </button>
      </header>

      {preferences.readingMode === 'flip' ? (
        <FlipReader
          key={access.chapter.id}
          design={preferences.theme}
          surfaceClassName={surfaceClass}
          layoutKey={`${preferences.font}-${preferences.textSize}-${preferences.lineSpacing}`}
        >
          {body}
        </FlipReader>
      ) : (
        <div className="reader__scroll" key={access.chapter.id}>
          <article
            className={`reader__page reader__page--${preferences.theme} ${surfaceClass}`}
          >
            {body}
          </article>
        </div>
      )}

      {settingsOpen && (
        <ReaderSettings
          preferences={preferences}
          onChange={handleChange}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}