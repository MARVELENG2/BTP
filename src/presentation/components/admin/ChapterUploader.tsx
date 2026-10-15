import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  addChapters,
  draftsFromFiles,
  type ChapterProgress,
} from '@/application/admin/manageChapters'
import {
  importChaptersFromDocument,
  type ImportProgress,
} from '@/application/admin/importDocument'
import type { ChapterDraft } from '@/domain/rules/chapterInput'
import ProgressButton from './ProgressButton'
import './ChapterAdmin.css'
import './ChapterImport.css'

interface Item {
  key: number
  title: string
  content: string
}

interface ChapterUploaderProps {
  bookId: string
  bookTitle: string
  startNumber: number
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function excerpt(text: string): string {
  return text.length > 140 ? `${text.slice(0, 140).trim()}…` : text
}

export default function ChapterUploader({ bookId, bookTitle, startNumber }: ChapterUploaderProps) {
  const navigate = useNavigate()
  const nextKey = useRef(0)
  const [items, setItems] = useState<Item[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [reading, setReading] = useState(false)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<ChapterProgress | null>(null)

  const busy = reading || saving

  function loadDrafts(drafts: ChapterDraft[]) {
    setItems(drafts.map((draft) => ({ key: nextKey.current++, ...draft })))
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return

    setReading(true)
    setErrors([])
    const result = await draftsFromFiles(files)
    loadDrafts(result.drafts)
    setNotes(result.problems)
    setReading(false)
  }

  async function handleDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setReading(true)
    setErrors([])
    setItems([])
    setNotes([])
    setImportProgress({ label: 'Opening file…', percent: null })

    const result = await importChaptersFromDocument(file, setImportProgress)
    loadDrafts(result.drafts)
    setNotes(result.notes)
    setImportProgress(null)
    setReading(false)
  }

  function changeTitle(key: number, title: string) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, title } : item)))
  }

  function removeItem(key: number) {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy || items.length === 0) return
    setSaving(true)
    setErrors([])
    setProgress({ label: 'Starting…', percent: 0 })

    try {
      const result = await addChapters(
        bookId,
        items.map(({ title, content }) => ({ title, content })),
        setProgress,
      )
      if (result.ok) {
        navigate(`/admin/books/${bookId}/chapters`)
        return
      }
      // Chapters that were already added are removed from the list, so a retry won't duplicate them.
      if (result.added > 0) setItems((current) => current.slice(result.added))
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
      <h1>Upload chapters</h1>
      <p className="chapter-form__hint">
        Adding to <strong>{bookTitle}</strong>. Choose your files, check the list that appears, then
        add. Choosing files again replaces the list.
      </p>

      <div className="chapter-import__pickers">
        <label className="chapter-import__pick">
          <span>Text files (.txt or .md), one chapter per file</span>
          <input
            type="file"
            multiple
            accept=".txt,.md,text/plain,text/markdown"
            onChange={handleFiles}
            disabled={busy}
          />
        </label>

        <label className="chapter-import__pick">
          <span>A whole book (.pdf or .docx), split into chapters automatically</span>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleDocument}
            disabled={busy}
          />
        </label>
      </div>

      {importProgress && (
        <div className="chapter-import__progress" role="status">
          <span>
            {importProgress.label}
            {importProgress.percent !== null ? ` ${importProgress.percent}%` : ''}
          </span>
          <div className="chapter-import__track">
            <div
              className={`chapter-import__bar${
                importProgress.percent === null ? ' chapter-import__bar--waiting' : ''
              }`}
              style={importProgress.percent !== null ? { width: `${importProgress.percent}%` } : undefined}
            />
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <ul className="chapter-import__notes" role="status">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="chapter-form__form">
        {items.length > 0 && (
          <>
            <p className="chapter-form__meta">
              Check the titles, then add. You can remove anything that isn't a chapter.
            </p>
            <ul className="chapter-upload__list">
              {items.map((item, index) => (
                <li key={item.key} className="chapter-upload__item">
                  <span className="chapter-upload__number">{startNumber + index}</span>
                  <div className="chapter-upload__fields">
                    <input
                      value={item.title}
                      onChange={(event) => changeTitle(item.key, event.target.value)}
                      maxLength={150}
                      disabled={saving}
                      aria-label={`Title for chapter ${startNumber + index}`}
                    />
                    <span>{countWords(item.content).toLocaleString()} words</span>
                    <span className="chapter-import__excerpt">{excerpt(item.content)}</span>
                  </div>
                  <button
                    type="button"
                    className="chapter-upload__remove"
                    onClick={() => removeItem(item.key)}
                    disabled={saving}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {errors.length > 0 && (
          <ul className="chapter-form__errors" role="alert">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <ProgressButton
          idleLabel={items.length === 1 ? 'Add 1 chapter' : `Add ${items.length} chapters`}
          busy={saving}
          label={progress?.label}
          percent={progress?.percent ?? null}
          disabled={items.length === 0 || reading}
        />
      </form>
    </div>
  )
}