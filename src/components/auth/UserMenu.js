import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Błąd wylogowania:', error)
    }
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dex-bg-tertiary transition-colors"
      >
        <div className="w-8 h-8 bg-dex-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getInitials()}
        </div>
        <span className="text-dex-text-primary hidden md:block">
          {profile?.full_name || user?.email}
        </span>
        <svg
          className={`w-4 h-4 text-dex-text-secondary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dex-bg-secondary border border-dex-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-dex-border">
            <div className="text-sm font-medium text-dex-text-primary">
              {profile?.full_name || 'Użytkownik'}
            </div>
            <div className="text-xs text-dex-text-secondary">
              {user?.email}
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                navigate('/dashboard')
                setIsOpen(false)
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-dex-text-primary hover:bg-dex-bg-tertiary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => {
                navigate('/portfolio')
                setIsOpen(false)
              }}
              className="flex items-center w-full px-3 py-2 text-sm text-dex-text-primary hover:bg-dex-bg-tertiary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Portfolio
            </button>
          </div>

          <div className="border-t border-dex-border py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-dex-bg-tertiary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu