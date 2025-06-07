import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
    setIsOpen(false);
  };

  const handleFavorites = () => {
    navigate('/favorites');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-dex-bg-tertiary hover:bg-dex-bg-highlight rounded-lg"
      >
        <div className="w-8 h-8 bg-dex-blue rounded-full flex items-center justify-center">
          <span className="text-white font-medium">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <span className="text-dex-text-primary">{user?.username}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dex-bg-secondary rounded-lg shadow-lg border border-dex-border z-50">
          <div className="py-2">
            <button
              onClick={handleFavorites}
              className="w-full text-left px-4 py-2 text-dex-text-primary hover:bg-dex-bg-highlight flex items-center"
            >
              <span className="mr-2">⭐</span>
              Favorites
            </button>
            
            {user?.role === 'admin' && (
              <button
                onClick={handleAdminPanel}
                className="w-full text-left px-4 py-2 text-dex-text-primary hover:bg-dex-bg-highlight flex items-center"
              >
                <span className="mr-2">⚙️</span>
                Admin Panel
              </button>
            )}
            
            <hr className="my-2 border-dex-border" />
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-dex-bg-highlight flex items-center"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;