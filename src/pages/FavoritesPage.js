import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatNumber } from '../utils/formatters';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        setError('Failed to load favorites');
      }
    } catch (err) {
      setError('Error loading favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (tokenAddress, chainId) => {
    try {
      const response = await fetch('/api/favorites/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ tokenAddress, chainId })
      });

      if (response.ok) {
        setFavorites(favorites.filter(fav => 
          !(fav.token_address === tokenAddress && fav.chain_id === chainId)
        ));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleTokenClick = (favorite) => {
    const chainPathMap = {
      '0x1': 'ethereum',
      'solana': 'solana',
      '0x38': 'bsc',
      '0x89': 'polygon',
      '0xa4b1': 'arbitrum',
      '0x2105': 'base',
      '0xa86a': 'avalanche',
      '0xa': 'optimism',
    };

    const chainPath = chainPathMap[favorite.chain_id] || favorite.chain_id;
    navigate(`/${chainPath}/${favorite.token_address}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dex-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>

      {favorites.length === 0 ? (
        <div className="bg-dex-bg-secondary rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-dex-text-secondary mb-4">
            Start adding tokens to your favorites to see them here
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-dex-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Browse Tokens
          </button>
        </div>
      ) : (
        <div className="bg-dex-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs text-dex-text-secondary uppercase border-b border-dex-border">
                <tr>
                  <th className="p-4 text-left">Token</th>
                  <th className="p-4 text-left">Chain</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-right">Added</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((favorite) => (
                  <tr
                    key={`${favorite.chain_id}-${favorite.token_address}`}
                    className="border-b border-dex-border hover:bg-dex-bg-tertiary cursor-pointer"
                    onClick={() => handleTokenClick(favorite)}
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <img
                          src={favorite.token_logo || '/images/tokens/default-token.svg'}
                          alt={favorite.token_symbol}
                          className="w-8 h-8 rounded-full mr-3"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzM0Mzk0NyIvPjwvc3ZnPg==';
                          }}
                        />
                        <div>
                          <div className="font-medium text-dex-text-primary">
                            {favorite.token_symbol}
                          </div>
                          <div className="text-sm text-dex-text-secondary">
                            {favorite.token_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-dex-bg-tertiary rounded text-xs">
                        {favorite.chain_id === '0x1' ? 'Ethereum' :
                         favorite.chain_id === 'solana' ? 'Solana' :
                         favorite.chain_id === '0x38' ? 'BSC' :
                         favorite.chain_id === '0x89' ? 'Polygon' :
                         favorite.chain_id}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-dex-text-secondary">-</span>
                    </td>
                    <td className="p-4 text-right text-dex-text-secondary">
                      {new Date(favorite.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(favorite.token_address, favorite.chain_id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Remove from favorites"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;