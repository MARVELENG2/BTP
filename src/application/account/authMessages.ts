// Turns technical sign-in errors into friendly messages.
export function friendlyAuthMessage(raw: string | undefined): string {
  const text = (raw ?? '').toLowerCase()

  if (text.includes('backend-not-configured')) {
    return "The app isn't connected to its backend yet. Check the .env.local file."
  }
  if (text.includes('invalid login credentials')) {
    return "That email and password don't match."
  }
  if (text.includes('already registered') || text.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in.'
  }
  if (text.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox for the link.'
  }
  if (text.includes('rate limit') || text.includes('too many')) {
    return 'Too many attempts. Please wait a little and try again.'
  }
  if (text.includes('password')) {
    return 'That password was not accepted. Try a longer one.'
  }
  if (text.includes('network') || text.includes('failed to fetch')) {
    return 'Could not reach the server. Check your internet connection.'
  }
  return 'Something went wrong. Please try again.'
}