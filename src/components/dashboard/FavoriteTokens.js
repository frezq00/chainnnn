import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../../hooks/useFavorites'
import { formatPrice, formatPercentChange } from '../../utils/formatters'

const FavoriteTokens = () => {
  const { favorites, loading, removeFavorite } = useFavorites()
  const navigate = useNavigate()

  const handleTokenClick = (token) => {
    const chainPathMap = {
      '0x1': 'ethereum',
      'solana': 'solana',
      '0x38': 'bsc',
      '0x89': 'polygon',
      '0xa4b1': 'arbitrum',
      '0x2105': 'base',
      '0xa': 'optimism',
      '0xa86a': 'avalanche'
    }

    const chainPath = chainPathMap[token.chain_id] || token.chain_id
    navigate(`/${chainPath}/${token.token_address}`)
  }

  const handleRemoveFavorite = async (token) => {
    try {
      await removeFavorite(token.token_address, token.chain_id)
    } catch (error) {
      console.error('Błąd usuwania z ulubionych:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-dex-bg-secondary rounded-lg p-6">
        <h2 className="text-xl font-semibold text-dex-text-primary mb-4">
          Ulubione tokeny
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-dex-bg-tertiary rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-dex-bg-tertiary rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-dex-bg-tertiary rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dex-bg-secondary rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-dex-text-primary">
          Ulubione tokeny
        </h2>
        <span className="text-dex-text-secondary text-sm">
          {favorites.length} tokenów
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-dex-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-dex-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-dex-text-primary mb-2">
            Brak ulubionych tokenów
          </h3>
          <p className="text-dex-text-secondary mb-4">
            Dodaj tokeny do ulubionych, aby śledzić je tutaj
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-dex-blue hover:bg-blue-600 text-white rounded-lg"
          >
            Przeglądaj tokeny
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((token) => (
            <div
              key={`${token.token_address}-${token.chain_id}`}
              className="flex items-center justify-between p-4 bg-dex-bg-tertiary rounded-lg hover:bg-dex-bg-highlight transition-colors cursor-pointer"
              onClick={() => handleTokenClick(token)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={token.token_logo || '/images/tokens/default-token.svg'}
                  alt={token.token_symbol}
                  className="w-10 h-10 rounded-full bg-dex-bg-primary"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzM0Mzk0NyIvPjwvc3ZnPg=='
                  }}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-dex-text-primary">
                      {token.token_symbol}
                    </span>
                    <span className="text-xs text-dex-text-secondary bg-dex-bg-primary px-2 py-1 rounded">
                      {token.chain_id === '0x1' ? 'ETH' : 
                       token.chain_id === 'solana' ? 'SOL' :
                       token.chain_id === '0x38' ? 'BSC' :
                       token.chain_id === '0x89' ? 'POLYGON' :
                       token.chain_id}
                    </span>
                  </div>
                  <div className="text-sm text-dex-text-secondary">
                    {token.token_name}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-dex-text-primary">
                    Dodano {new Date(token.added_at).toLocaleDateString('pl-PL')}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFavorite(token)
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Usuń z ulubionych"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoriteTokens