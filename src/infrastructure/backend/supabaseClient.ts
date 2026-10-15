import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isBackendConfigured = Boolean(url && key)

// Placeholder values keep the app from crashing when .env.local is missing.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'missing-key')