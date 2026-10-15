import type { CSSProperties } from 'react'
import './ProgressButton.css'

interface ProgressButtonProps {
  idleLabel: string
  busy: boolean
  label?: string
  percent?: number | null
  disabled?: boolean
}

export default function ProgressButton({
  idleLabel,
  busy,
  label,
  percent = null,
  disabled = false,
}: ProgressButtonProps) {
  const text = busy ? `${label ?? 'Saving…'}${percent !== null ? ` ${percent}%` : ''}` : idleLabel
  const fillStyle: CSSProperties | undefined =
    busy && percent !== null ? { width: `${percent}%` } : undefined

  const className = [
    'progress-button',
    busy ? 'progress-button--busy' : '',
    busy && percent === null ? 'progress-button--waiting' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="submit" className={className} disabled={busy || disabled} aria-busy={busy}>
      <span className="progress-button__fill" style={fillStyle} />
      <span className="progress-button__label">{text}</span>
    </button>
  )
}