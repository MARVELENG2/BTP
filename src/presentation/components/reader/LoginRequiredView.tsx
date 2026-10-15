import { Link } from 'react-router-dom'
import type { LoginRequiredChapter } from '@/application/reader/getChapterForReading'
import './LoginRequiredView.css'

interface LoginRequiredViewProps {
  access: LoginRequiredChapter
}

export default function LoginRequiredView({ access }: LoginRequiredViewProps) {
  const { book, chapterNumber } = access

  return (
    <div className="login-required">
      <Link to={`/books/${book.id}`} className="login-required__back">
        ← {book.title}
      </Link>
      <h1>Log in to read</h1>
      <p>
        Chapter {chapterNumber} is ready for you. Sign in to your account to start reading, and
        we'll keep your settings with you.
      </p>
      <div className="login-required__actions">
        <Link to="/login" className="login-required__button">
          Log in
        </Link>
        <Link
          to="/signup"
          className="login-required__button login-required__button--ghost"
        >
          Create account
        </Link>
      </div>
    </div>
  )
}