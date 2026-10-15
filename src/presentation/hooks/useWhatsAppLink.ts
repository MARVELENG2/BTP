import { useEffect, useState } from 'react'
import { getCachedWhatsAppLink, getWhatsAppLink } from '@/application/settings/appSettings'

// undefined = still loading, null = no usable link
export function useWhatsAppLink(): string | null | undefined {
  const [link, setLink] = useState<string | null | undefined>(() => getCachedWhatsAppLink())

  useEffect(() => {
    let active = true
    getWhatsAppLink().then((value) => {
      if (active) setLink(value)
    })
    return () => {
      active = false
    }
  }, [])

  return link
}
