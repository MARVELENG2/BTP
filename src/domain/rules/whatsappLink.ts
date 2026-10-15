const ALLOWED_HOSTS = ['chat.whatsapp.com', 'wa.me', 'whatsapp.com', 'www.whatsapp.com']

// An empty link is allowed. It means "not set", and the join button is hidden.
export function validateWhatsAppLink(raw: string): string[] {
  const value = raw.trim()
  if (value === '') return []

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return ['Please paste the full link, starting with https://']
  }

  if (url.protocol !== 'https:') return ['The link must start with https://']
  if (!ALLOWED_HOSTS.includes(url.hostname)) {
    return ['This must be a WhatsApp link, such as https://chat.whatsapp.com/…']
  }
  if (url.pathname.length <= 1) return ['That link is missing the group code at the end.']
  return []
}

// The link the app should actually use, or null when there isn't a real one.
export function usableWhatsAppLink(raw: string | null | undefined): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (value === '' || value.includes('REPLACE_WITH')) return null
  return validateWhatsAppLink(value).length === 0 ? value : null
}