import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  addChapters,
  saveChapterEdit,
  type ChapterProgress,
  type EditableChapter,
} from '@/application/admin/manageChapters'
import ProgressButton from './ProgressButton'
import './ChapterAdmin.css'

interface ChapterFormProps {
  bookId: string
  initial?: EditableChapter
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function ChapterForm({ bookId, initial }: ChapterFormProps) {
  const navigate = useNavigate()
  const editing = Boolean(initial)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<ChapterProgress | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setErrors([])
    setProgress({ label: 'Saving chapter…', percent: null })

    try {
      const draft = { title, content }
      const result = initial
        ? await saveChapterEdit(initial.id, draft)
        : await addChapters(bookId, [draft], setProgress)

      if (result.ok) {
        navigate(`/admin/books/${bookId}/chapters`)
        return
      }
      setErrors(result.errors)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Something went wrong. Please try again.'])
    }
    setSaving(false)
    setProgress(null)
  }

  return (
    <div className="chapter-form">
      <Link to={`/admin/books/${bookId}/chapters`} className="chapter-form__back">
        ← All chapters
      </Link>
      <h1>{editing ? `Edit chapter ${initial?.number}` : 'Paste a chapter'}</h1>
      {!editing && (
        <p className="chapter-form__hint">
          It is added as the next chapter. A blank line starts a new paragraph.
        </p>
      )}

      <form onSubmit={handleSubmit} className="chapter-form__form">
        <label>
          Chapter title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={150} />
        </label>

        <label>
          Chapter text
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="chapter-form__text"
          />
        </label>
        <p className="chapter-form__meta">{countWords(content).toLocaleString()} words</p>

        {errors.length > 0 && (
          <ul className="chapter-form__errors" role="alert">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <ProgressButton
          idleLabel={editing ? 'Save changes' : 'Add chapter'}
          busy={saving}
          label={progress?.label}
          percent={progress?.percent ?? null}
        />
      </form>
    </div>
  )
}