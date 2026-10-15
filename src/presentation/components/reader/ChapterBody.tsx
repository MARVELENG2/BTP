import type { ReactNode } from 'react'
import './ChapterBody.css'

interface ChapterBodyProps {
  chapterNumber: number
  title: string
  paragraphs: string[]
  end: ReactNode
}

export default function ChapterBody({ chapterNumber, title, paragraphs, end }: ChapterBodyProps) {
  return (
    <div className="chapter-body">
      <p className="chapter-body__number">Chapter {chapterNumber}</p>
      <h2 className="chapter-body__title">{title}</h2>
      {paragraphs.map((text, i) => (
        <p key={i} className="chapter-body__paragraph">
          {text}
        </p>
      ))}
      <div className="chapter-body__end">{end}</div>
    </div>
  )
}