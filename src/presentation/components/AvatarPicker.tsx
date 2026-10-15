import type { Gender } from '@/domain/models'
import { getAvatarIds } from '@/domain/rules/avatars'
import Avatar from './Avatar'
import './AvatarPicker.css'

interface AvatarPickerProps {
  gender: Gender
  value: string
  onChange: (avatarId: string) => void
}

export default function AvatarPicker({ gender, value, onChange }: AvatarPickerProps) {
  return (
    <div className="avatar-picker" role="radiogroup" aria-label="Choose an avatar">
      {getAvatarIds(gender).map((id, i) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={id === value}
          aria-label={`Avatar ${i + 1}`}
          className={
            id === value
              ? 'avatar-picker__item avatar-picker__item--active'
              : 'avatar-picker__item'
          }
          onClick={() => onChange(id)}
        >
          <Avatar avatarId={id} size={64} />
        </button>
      ))}
    </div>
  )
}