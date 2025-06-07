import { createClient } from '@supabase/supabase-js'

// Sprawdź czy zmienne środowiskowe są dostępne
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

console.log('🔍 Debugowanie Supabase:')
console.log('URL:', supabaseUrl ? 'USTAWIONY' : 'BRAK')
console.log('Key:', supabaseAnonKey ? 'USTAWIONY' : 'BRAK')
console.log('URL value:', supabaseUrl)
console.log('Key value:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'BRAK')

// Jeśli brak zmiennych, utwórz placeholder client
let supabase

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Tworzenie prawdziwego klienta Supabase')
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Placeholder client - nie będzie działał, ale nie spowoduje błędu
  console.error('❌ Zmienne środowiskowe Supabase nie są skonfigurowane!')
  console.error('Sprawdź plik .env i upewnij się, że zawiera:')
  console.error('REACT_APP_SUPABASE_URL=https://vwblpwpdhwscbwxvtref.supabase.co')
  console.error('REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.reject(new Error('Supabase nie jest skonfigurowane')),
      signInWithPassword: () => Promise.reject(new Error('Supabase nie jest skonfigurowane')),
      signOut: () => Promise.reject(new Error('Supabase nie jest skonfigurowane'))
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'SUPABASE_NOT_CONFIGURED' } }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.reject(new Error('Supabase nie jest skonfigurowane')) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.reject(new Error('Supabase nie jest skonfigurowane')) }) }) }),
      delete: () => ({ eq: () => Promise.reject(new Error('Supabase nie jest skonfigurowane')) })
    })
  }
}

export { supabase }

// Typy dla TypeScript (opcjonalne)
export const TABLES = {
  USER_PROFILES: 'user_profiles',
  FAVORITE_TOKENS: 'favorite_tokens'
}

// Helper do sprawdzania czy Supabase jest skonfigurowane
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}