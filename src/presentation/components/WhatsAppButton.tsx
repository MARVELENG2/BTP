import { useWhatsAppLink } from '@/presentation/hooks/useWhatsAppLink'
import './WhatsAppButton.css'

export default function WhatsAppButton() {
  const link = useWhatsAppLink()

  // No real link yet: show nothing rather than a button that goes nowhere.
  if (!link) return null

  return (
    <a className="whatsapp-button" href={link} target="_blank" rel="noopener noreferrer">
      Join our WhatsApp group
    </a>
  )
}