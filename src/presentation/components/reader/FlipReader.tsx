import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import type { ReadingDesign } from '@/domain/models'
import './FlipReader.css'

const PAD_X = 22
const PAD_Y = 26
const GAP = 40
const TURN_MS = 480

interface Turn {
  dir: 'next' | 'prev'
  from: number
  to: number
}

interface PageLayerProps {
  index: number
  width: number
  height: number
  layoutKey: string
  className: string
  onScrollWidth?: (scrollWidth: number) => void
  children: ReactNode
}

// One full copy of the chapter, laid out in columns and scrolled to a single page.
function PageLayer({
  index,
  width,
  height,
  layoutKey,
  className,
  onScrollWidth,
  children,
}: PageLayerProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (el) el.scrollLeft = index * (width + GAP)
  }, [index, width, height, layoutKey])

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (el && onScrollWidth) onScrollWidth(el.scrollWidth)
  }, [width, height, layoutKey, onScrollWidth])

  return (
    <div className={className} style={{ padding: `${PAD_Y}px ${PAD_X}px` }}>
      <div ref={viewportRef} className="flip__viewport" style={{ width, height }}>
        <div
          className="flip__columns"
          style={{ width, height, columnWidth: width, columnGap: GAP, columnFill: 'auto' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

interface FlipReaderProps {
  children: ReactNode
  design: ReadingDesign
  surfaceClassName: string
  // changes whenever text settings change, so pages are measured again
  layoutKey: string
}

export default function FlipReader({
  children,
  design,
  surfaceClassName,
  layoutKey,
}: FlipReaderProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  // what is typed in the page picker (kept as text so the box can be empty while typing)
  const [draft, setDraft] = useState('')
  // where we are in the chapter (0 to 1), so a font change keeps your place
  const ratioRef = useRef(0)
  const touchStartX = useRef<number | null>(null)

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const observer = new ResizeObserver(() =>
      setSize({ width: el.clientWidth, height: el.clientHeight }),
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const contentWidth = Math.max(0, size.width - PAD_X * 2)
  const contentHeight = Math.max(0, size.height - PAD_Y * 2)
  const ready = contentWidth > 60 && contentHeight > 60
  const safePage = Math.min(page, pages - 1)

  const handleScrollWidth = useCallback(
    (scrollWidth: number) => {
      const count = Math.max(1, Math.round((scrollWidth + GAP) / (contentWidth + GAP)))
      setPages(count)
      setPage(Math.round(ratioRef.current * (count - 1)))
    },
    [contentWidth],
  )

  const turnTo = useCallback(
    (target: number) => {
      if (turn || target < 0 || target > pages - 1 || target === safePage) return
      ratioRef.current = pages > 1 ? target / (pages - 1) : 0
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setPage(target)
        return
      }
      setTurn({ dir: target > safePage ? 'next' : 'prev', from: safePage, to: target })
    },
    [turn, pages, safePage],
  )

  useEffect(() => {
    if (!turn) return
    const id = setTimeout(() => {
      setPage(turn.to)
      setTurn(null)
    }, TURN_MS)
    return () => clearTimeout(id)
  }, [turn])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // While the page picker is open, the arrow keys belong to it.
      if (pickerOpen) {
        if (event.key === 'Escape') setPickerOpen(false)
        return
      }
      if (event.key === 'ArrowRight') turnTo(safePage + 1)
      if (event.key === 'ArrowLeft') turnTo(safePage - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [turnTo, safePage, pickerOpen])

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    if (x > rect.width * 0.6) turnTo(safePage + 1)
    else if (x < rect.width * 0.4) turnTo(safePage - 1)
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start === null) return
    const dx = event.changedTouches[0].clientX - start
    if (Math.abs(dx) < 50) return
    turnTo(dx < 0 ? safePage + 1 : safePage - 1)
  }

  const openPicker = () => {
    if (turn || pages <= 1) return
    setDraft(String(safePage + 1))
    setPickerOpen(true)
  }

  const parsedDraft = Number.parseInt(draft, 10)
  const draftValid = Number.isInteger(parsedDraft) && parsedDraft >= 1 && parsedDraft <= pages

  const handleJump = (event: FormEvent) => {
    event.preventDefault()
    if (!draftValid) return
    setPickerOpen(false)
    turnTo(parsedDraft - 1)
  }

  const layerClass = `flip__layer flip__layer--${design} ${surfaceClassName}`
  const topIndex = turn ? (turn.dir === 'next' ? turn.from : turn.to) : safePage

  return (
    <div className="flip-reader">
      <div className={`flip-reader__stage flip-reader__stage--${design}`}>
        <div
          ref={stageRef}
          className="flip"
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {ready && (
            <>
              {turn && (
                <PageLayer
                  key="under"
                  index={turn.dir === 'next' ? turn.to : turn.from}
                  width={contentWidth}
                  height={contentHeight}
                  layoutKey={layoutKey}
                  className={`${layerClass} flip__layer--under`}
                >
                  {children}
                </PageLayer>
              )}
              <PageLayer
                key="current"
                index={topIndex}
                width={contentWidth}
                height={contentHeight}
                layoutKey={layoutKey}
                className={turn ? `${layerClass} flip__layer--turn-${turn.dir}` : layerClass}
                onScrollWidth={handleScrollWidth}
              >
                {children}
              </PageLayer>
            </>
          )}
        </div>
      </div>

      <div className="flip-reader__footer">
        <button
          type="button"
          className="flip-reader__nav"
          aria-label="Previous page"
          disabled={safePage === 0 || turn !== null}
          onClick={() => turnTo(safePage - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="flip-reader__status"
          onClick={openPicker}
          disabled={pages <= 1 || turn !== null}
          aria-label={`Page ${safePage + 1} of ${pages}. Tap to go to a page.`}
        >
          <span className="flip-reader__page-label">
            Page {safePage + 1} of {pages}
          </span>
          <span className="flip-reader__progress">
            <span style={{ width: `${((safePage + 1) / pages) * 100}%` }} />
          </span>
        </button>
        <button
          type="button"
          className="flip-reader__nav"
          aria-label="Next page"
          disabled={safePage >= pages - 1 || turn !== null}
          onClick={() => turnTo(safePage + 1)}
        >
          ›
        </button>
      </div>

      {pickerOpen && (
        <div className="flip-jump" role="dialog" aria-modal="true" aria-label="Go to page">
          <button
            type="button"
            className="flip-jump__backdrop"
            aria-label="Close"
            onClick={() => setPickerOpen(false)}
          />
          <form className="flip-jump__sheet" onSubmit={handleJump}>
            <p className="flip-jump__title">Go to page</p>

            <div className="flip-jump__readout">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="flip-jump__number"
                value={draft}
                onChange={(event) => setDraft(event.target.value.replace(/\D/g, '').slice(0, 5))}
                aria-label="Page number"
              />
              <span className="flip-jump__of">of {pages}</span>
            </div>

            <input
              type="range"
              className="flip-jump__slider"
              min={1}
              max={pages}
              value={draftValid ? parsedDraft : 1}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Choose a page"
            />

            {!draftValid && draft !== '' && (
              <p className="flip-jump__hint">Enter a page from 1 to {pages}.</p>
            )}

            <div className="flip-jump__quick">
              <button type="button" className="flip-jump__chip" onClick={() => setDraft('1')}>
                Start
              </button>
              <button
                type="button"
                className="flip-jump__chip"
                onClick={() => setDraft(String(Math.ceil(pages / 2)))}
              >
                Middle
              </button>
              <button
                type="button"
                className="flip-jump__chip"
                onClick={() => setDraft(String(pages))}
              >
                End
              </button>
            </div>

            <div className="flip-jump__actions">
              <button
                type="button"
                className="flip-jump__button"
                onClick={() => setPickerOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flip-jump__button flip-jump__button--primary"
                disabled={!draftValid}
              >
                {draftValid ? `Go to page ${parsedDraft}` : 'Go'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}