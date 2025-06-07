import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Brakuje zmiennych środowiskowych Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Typy dla TypeScript (opcjonalne)
export const TABLES = {
  USER_PROFILES: 'user_profiles',
  FAVORITE_TOKENS: 'favorite_tokens'
}