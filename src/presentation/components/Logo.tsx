import { useState } from 'react'
import { appConfig } from '@/shared/config/appConfig'

interface LogoProps {
  size?: number
}

// Shows public/logo.png. If that file doesn't exist yet, shows a built-in placeholder.
export default function Logo({ size = 120 }: LogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        role="img"
        aria-label={`${appConfig.appName} logo`}
      >
        <circle cx="60" cy="60" r="58" fill="#2E7D4F" />
        <path
          d="M26 80 Q43 72 60 80 Q77 72 94 80 L94 90 Q77 82 60 90 Q43 82 26 90 Z"
          fill="#F5ECD7"
        />
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="30"
          fontWeight="700"
          fill="#FFFFFF"
        >
          BTP
        </text>
      </svg>
    )
  }

  return (
    <img
      src={appConfig.logoUrl}
      alt={`${appConfig.appName} logo`}
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  )
}