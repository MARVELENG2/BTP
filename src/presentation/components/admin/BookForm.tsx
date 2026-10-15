import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveBook, type SaveProgress } from '@/application/admin/manageBooks'
import type { Book, Weekday } from '@/domain/models'
import BookCover from '@/presentation/components/BookCover'
import './BookForm.css'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const BLANK_BOOK: Book = {
  id: 'new-book',
  title: '',
  author: '',
  description: '',
  coverUrl: '',
  totalChapters: 0,
  chaptersPerWeek: 2,
  unlockWeekday: 1,
  startDate: '',
  isFeatured: false,
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

interface BookFormProps {
  initial?: Book
}

export default function BookForm({ initial }: BookFormProps) {
  const navigate = useNavigate()
  const editing = Boolean(initial)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [chaptersPerWeek, setChaptersPerWeek] = useState(String(initial?.chaptersPerWeek ?? 2))
  const [unlockWeekday, setUnlockWeekday] = useState<number>(initial?.unlockWeekday ?? 1)
  const [startDate, setStartDate] = useState(initial?.startDate ?? todayIso())
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<SaveProgress | null>(null)

  // A temporary preview of the chosen image, cleaned up when it changes.
  const previewUrl = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile])
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const previewBook: Book = {
    ...(initial ?? BLANK_BOOK),
    title: title.trim() || 'Your title',
    author: author.trim(),
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setErrors([])
    setProgress({ label: 'Saving…', percent: null })

    try {
      const result = await saveBook({
        bookId: initial?.id,
        coverFile,
        onProgress: setProgress,
        input: {
          title,
          author,
          description,
          chaptersPerWeek: Number(chaptersPerWeek),
          unlockWeekday: unlockWeekday as Weekday,
          startDate,
          isFeatured,
        },
      })

      if (result.ok) {
        navigate('/admin')
        return
      }
      setErrors(result.errors)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Something went wrong. Please try again.'])
    }
    setSaving(false)
    setProgress(null)
  }

  const percent = progress?.percent ?? null
  const buttonLabel = saving
    ? `${progress?.label ?? 'Saving…'}${percent !== null ? ` ${percent}%` : ''}`
    : editing
      ? 'Save changes'
      : 'Add book'

  const fillStyle: CSSProperties | undefined =
    saving && percent !== null ? { width: `${percent}%` } : undefined

  return (
    <div className="book-form">
      <Link to="/admin" className="book-form__back">
        ← All books
      </Link>
      <h1>{editing ? 'Edit book' : 'Add a book'}</h1>

      <div className="book-form__preview">
        {previewUrl ? (
          <img src={previewUrl} alt="Chosen cover" className="book-form__preview-image" />
        ) : (
          <BookCover book={previewBook} size="large" linked={false} />
        )}
      </div>

      <form onSubmit={handleSubmit} className="book-form__form">
        <label>
          Cover image (JPG, PNG or WebP, resized automatically)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
          />
        </label>

        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
        </label>

        <label>
          Author
          <input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={120} />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            maxLength={2000}
          />
        </label>

        <label>
          Chapters per week
          <input
            type="number"
            min={1}
            max={20}
            value={chaptersPerWeek}
            onChange={(event) => setChaptersPerWeek(event.target.value)}
          />
        </label>

        <label>
          New chapters unlock every
          <select
            value={unlockWeekday}
            onChange={(event) => setUnlockWeekday(Number(event.target.value))}
          >
            {WEEKDAYS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start date
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>

        {editing && (
          <p className="book-form__hint">
            Changing the weekly limit, unlock day or start date takes effect for all readers
            straight away.
          </p>
        )}

        <label className="book-form__check">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
          />
          Feature this book on the home screen
        </label>

        {errors.length > 0 && (
          <ul className="book-form__errors" role="alert">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className={`book-form__submit${saving ? ' book-form__submit--busy' : ''}${
            saving && percent === null ? ' book-form__submit--waiting' : ''
          }`}
          disabled={saving}
          aria-busy={saving}
        >
          <span className="book-form__submit-fill" style={fillStyle} />
          <span className="book-form__submit-label">{buttonLabel}</span>
        </button>
      </form>
    </div>
  )
}