import { createClient } from '@supabase/supabase-js'

// Sprawdź czy zmienne środowiskowe są dostępne
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Jeśli brak zmiennych, utwórz placeholder client
let supabase

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Placeholder client - nie będzie działał, ale nie spowoduje błędu
  console.warn('Zmienne środowiskowe Supabase nie są skonfigurowane. Funkcje autentykacji będą niedostępne.')
  
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