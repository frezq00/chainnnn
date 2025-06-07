import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useFavorites } from '../../hooks/useFavorites'

const FavoriteButton = ({ 
  tokenAddress, 
  chainId, 
  tokenName, 
  tokenSymbol, 
  tokenLogo,
  className = "",
  size = "md" 
}) => {
  const { user, isSupabaseConfigured } = useAuth()
  const { favorites, addFavorite, removeFavorite, loading } = useFavorites()
  const [isProcessing, setIsProcessing] = useState(false)

  console.log('🔍 FavoriteButton Debug:', {
    tokenAddress,
    chainId,
    tokenSymbol,
    isSupabaseConfigured,
    user: !!user,
    favoritesCount: favorites.length,
    loading
  })

  const isFavorite = favorites.some(
    fav => fav.token_address === tokenAddress && fav.chain_id === chainId
  )

  console.log('❤️ Is favorite:', isFavorite)

  const handleToggleFavorite = async (e) => {
    e.stopPropagation() // Zapobiega nawigacji gdy przycisk jest w linku
    
    console.log('🔍 Kliknięto przycisk ulubionych')
    
    if (!isSupabaseConfigured) {
      console.log('❌ Supabase nie jest skonfigurowane')
      alert('Funkcje ulubionych są obecnie niedostępne. Skonfiguruj Supabase aby je włączyć.')
      return
    }
    
    if (!user) {
      console.log('❌ Użytkownik nie jest zalogowany')
      alert('Zaloguj się, aby dodać tokeny do ulubionych')
      return
    }

    if (isProcessing) return

    setIsProcessing(true)
    
    try {
      if (isFavorite) {
        console.log('🗑️ Usuwanie z ulubionych...')
        await removeFavorite(tokenAddress, chainId)
      } else {
        console.log('➕ Dodawanie do ulubionych...')
        await addFavorite({
          tokenAddress,
          chainId,
          tokenName,
          tokenSymbol,
          tokenLogo
        })
      }
      console.log('✅ Operacja zakończona pomyślnie')
    } catch (error) {
      console.error('❌ Błąd przy zmianie ulubionych:', error)
      alert('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsProcessing(false)
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  }

  // Jeśli Supabase nie jest skonfigurowane, nie pokazuj przycisku
  if (!isSupabaseConfigured) {
    console.log('🚫 Nie pokazuję przycisku - Supabase nie skonfigurowane')
    return null
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isProcessing || loading}
      className={`
        ${buttonSizeClasses[size]}
        ${className}
        rounded-full transition-all duration-200 
        ${isFavorite 
          ? 'text-red-500 hover:text-red-400' 
          : 'text-dex-text-tertiary hover:text-red-500'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dex-bg-highlight'}
      `}
      title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
    >
      <svg 
        className={`${sizeClasses[size]} transition-transform ${isProcessing ? 'scale-90' : 'hover:scale-110'}`}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isFavorite ? 0 : 2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  )
}

export default FavoriteButton