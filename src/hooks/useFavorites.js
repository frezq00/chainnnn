import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Pobierz ulubione tokeny użytkownika
  const fetchFavorites = async () => {
    if (!user || !isSupabaseConfigured()) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('favorite_tokens')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error && error.code !== 'SUPABASE_NOT_CONFIGURED') throw error

      setFavorites(data || [])
    } catch (error) {
      console.error('Błąd pobierania ulubionych:', error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  // Dodaj token do ulubionych
  const addFavorite = async ({ tokenAddress, chainId, tokenName, tokenSymbol, tokenLogo }) => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany')
    if (!isSupabaseConfigured()) throw new Error('Supabase nie jest skonfigurowane')

    try {
      const { data, error } = await supabase
        .from('favorite_tokens')
        .insert({
          user_id: user.id,
          token_address: tokenAddress,
          chain_id: chainId,
          token_name: tokenName,
          token_symbol: tokenSymbol,
          token_logo: tokenLogo
        })
        .select()
        .single()

      if (error) throw error

      setFavorites(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Błąd dodawania do ulubionych:', error)
      throw error
    }
  }

  // Usuń token z ulubionych
  const removeFavorite = async (tokenAddress, chainId) => {
    if (!user) throw new Error('Użytkownik nie jest zalogowany')
    if (!isSupabaseConfigured()) throw new Error('Supabase nie jest skonfigurowane')

    try {
      const { error } = await supabase
        .from('favorite_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('token_address', tokenAddress)
        .eq('chain_id', chainId)

      if (error) throw error

      setFavorites(prev => 
        prev.filter(fav => 
          !(fav.token_address === tokenAddress && fav.chain_id === chainId)
        )
      )
    } catch (error) {
      console.error('Błąd usuwania z ulubionych:', error)
      throw error
    }
  }

  // Sprawdź czy token jest w ulubionych
  const isFavorite = (tokenAddress, chainId) => {
    return favorites.some(fav => 
      fav.token_address === tokenAddress && fav.chain_id === chainId
    )
  }

  useEffect(() => {
    fetchFavorites()
  }, [user])

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
    isSupabaseConfigured: isSupabaseConfigured()
  }
}