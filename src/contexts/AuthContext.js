import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth musi być używane wewnątrz AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sprawdź czy Supabase jest skonfigurowane
    if (!isSupabaseConfigured()) {
      console.warn('Supabase nie jest skonfigurowane - funkcje autentykacji będą niedostępne')
      setLoading(false)
      return
    }

    // Pobierz aktualną sesję
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Błąd pobierania sesji:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Nasłuchuj zmian autentykacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    if (!isSupabaseConfigured()) return

    try {
      console.log('🔍 Pobieranie profilu dla użytkownika:', userId)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116' && error.code !== 'SUPABASE_NOT_CONFIGURED') {
        console.error('❌ Błąd pobierania profilu:', error)
        return
      }

      console.log('✅ Profil pobrany:', data)
      setProfile(data)
    } catch (error) {
      console.error('❌ Błąd pobierania profilu (catch):', error)
    }
  }

  const signUp = async (email, password, fullName) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowane. Skontaktuj się z administratorem.')
    }

    console.log('🔍 Rejestracja użytkownika:', { email, fullName })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      console.error('❌ Błąd rejestracji:', error)
      throw error
    }
    
    console.log('✅ Rejestracja zakończona:', data)
    return data
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowane. Skontaktuj się z administratorem.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowane. Skontaktuj się z administratorem.')
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase nie jest skonfigurowane. Skontaktuj się z administratorem.')
    }

    if (!user) throw new Error('Brak zalogowanego użytkownika')

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    
    setProfile(data)
    return data
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchProfile,
    isSupabaseConfigured: isSupabaseConfigured()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}