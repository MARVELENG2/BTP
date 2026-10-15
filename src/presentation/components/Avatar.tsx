import type { ReactNode } from 'react'
import {
  AVATAR_SPECS,
  FALLBACK_AVATAR,
  type AvatarSpec,
} from '@/presentation/theme/avatarSpecs'

interface AvatarProps {
  avatarId: string
  size?: number
  label?: string
}

function hairLayers(spec: AvatarSpec): { back: ReactNode; front: ReactNode } {
  const { hair, accent } = spec
  const cap = (
    <path d="M33 44 Q32 25 50 25 Q68 25 67 44 Q61 34 50 34 Q39 34 33 44 Z" fill={hair} />
  )
  const fringe = (
    <path d="M33 42 Q36 28 50 28 Q64 28 67 42 Q58 34 50 34 Q42 34 33 42 Z" fill={hair} />
  )

  switch (spec.style) {
    case 'short':
      return { back: null, front: cap }
    case 'afro':
      return {
        back: <circle cx="50" cy="38" r="27" fill={hair} />,
        front: <path d="M34 40 Q50 24 66 40 Q50 31 34 40 Z" fill={hair} />,
      }
    case 'bun':
      return { back: <circle cx="50" cy="21" r="8" fill={hair} />, front: cap }
    case 'long':
      return {
        back: (
          <path d="M31 44 Q29 22 50 22 Q71 22 69 44 L72 78 Q50 84 28 78 Z" fill={hair} />
        ),
        front: fringe,
      }
    case 'braids':
      return {
        back: (
          <g fill={hair}>
            {[28, 33, 38, 62, 67, 72].map((x) => (
              <rect key={x} x={x} y="38" width="4" height="40" rx="2" />
            ))}
          </g>
        ),
        front: cap,
      }
    case 'headwrap':
      return {
        back: null,
        front: (
          <g fill={accent}>
            <path d="M32 41 Q33 22 50 22 Q67 22 68 41 Q50 32 32 41 Z" />
            <circle cx="65" cy="26" r="6" />
          </g>
        ),
      }
    case 'curly':
      return {
        back: (
          <g fill={hair}>
            {[
              [36, 34, 9],
              [46, 27, 9],
              [56, 27, 9],
              [64, 34, 9],
              [31, 44, 7],
              [69, 44, 7],
            ].map(([cx, cy, r]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
        ),
        front: cap,
      }
    case 'cap':
      return {
        back: null,
        front: (
          <g fill={accent}>
            <path d="M32 40 Q33 21 50 21 Q67 21 68 40 Z" />
            <rect x="29" y="38" width="44" height="5" rx="2.5" />
          </g>
        ),
      }
    case 'locs':
      return {
        back: (
          <g fill={hair}>
            {[27, 32, 68, 73].map((x, i) => (
              <rect key={x} x={x} y="34" width="6" height={i % 2 ? 40 : 30} rx="3" />
            ))}
          </g>
        ),
        front: cap,
      }
    case 'bob':
      return {
        back: (
          <path d="M31 46 Q29 22 50 22 Q71 22 69 46 L69 62 Q50 67 31 62 Z" fill={hair} />
        ),
        front: fringe,
      }
    case 'ponytail':
      return {
        back: <path d="M62 30 Q82 30 79 56 Q75 44 64 40 Z" fill={hair} />,
        front: cap,
      }
    case 'bald':
      return { back: null, front: null }
  }
}

export default function Avatar({ avatarId, size = 64, label }: AvatarProps) {
  const spec = AVATAR_SPECS[avatarId] ?? FALLBACK_AVATAR
  const { back, front } = hairLayers(spec)

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={label ?? 'Avatar'}
      style={{ display: 'block', borderRadius: '50%' }}
    >
      <circle cx="50" cy="50" r="50" fill={spec.background} />
      {back}
      <path d="M16 100 Q16 74 50 74 Q84 74 84 100 Z" fill={spec.cloth} />
      <rect x="44" y="60" width="12" height="16" rx="4" fill={spec.skin} />
      <ellipse cx="50" cy="46" rx="16" ry="19" fill={spec.skin} />
      {front}
      <circle cx="43" cy="46" r="1.8" fill="#1E1410" />
      <circle cx="57" cy="46" r="1.8" fill="#1E1410" />
      <path
        d="M44 55 Q50 60 56 55"
        fill="none"
        stroke="#1E1410"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {spec.beard && (
        <path d="M35 52 Q36 68 50 69 Q64 68 65 52 Q58 60 50 60 Q42 60 35 52 Z" fill={spec.hair} />
      )}
      {spec.glasses && (
        <g fill="none" stroke="#1E1410" strokeWidth="1.4">
          <circle cx="43" cy="46" r="5.5" />
          <circle cx="57" cy="46" r="5.5" />
          <path d="M48.5 46 L51.5 46" />
        </g>
      )}
    </svg>
  )
}