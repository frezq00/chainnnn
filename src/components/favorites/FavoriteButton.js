import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FavoriteButton = ({ token, chainId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && token) {
      checkFavoriteStatus();
    }
  }, [user, token]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          tokenAddress: token.tokenAddress || token.address,
          chainId: chainId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          tokenAddress: token.tokenAddress || token.address,
          chainId: chainId,
          tokenName: token.name,
          tokenSymbol: token.symbol,
          tokenLogo: token.logo
        })
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isFavorite
          ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
          : 'bg-dex-bg-tertiary text-dex-text-secondary hover:bg-dex-bg-highlight hover:text-yellow-500'
      } disabled:opacity-50`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>
  );
};

export default FavoriteButton;