import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useFavorites } from '../../hooks/useFavorites'

const UserStats = () => {
  const { user, profile } = useAuth()
  const { favorites } = useFavorites()
  const [joinDate, setJoinDate] = useState('')

  useEffect(() => {
    if (user?.created_at) {
      const date = new Date(user.created_at)
      setJoinDate(date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
    }
  }, [user])

  const stats = [
    {
      label: 'Ulubione tokeny',
      value: favorites.length,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      color: 'text-red-400'
    },
    {
      label: 'Data dołączenia',
      value: joinDate,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-blue-400'
    }
  ]

  return (
    <div className="bg-dex-bg-secondary rounded-lg p-6">
      <h2 className="text-xl font-semibold text-dex-text-primary mb-6">
        Twoje statystyki
      </h2>

      <div className="space-y-6">
        {/* Profil użytkownika */}
        <div className="flex items-center space-x-4 p-4 bg-dex-bg-tertiary rounded-lg">
          <div className="w-12 h-12 bg-dex-blue rounded-full flex items-center justify-center text-white text-lg font-medium">
            {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-medium text-dex-text-primary">
              {profile?.full_name || 'Użytkownik'}
            </div>
            <div className="text-sm text-dex-text-secondary">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-dex-bg-tertiary rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-dex-text-secondary">
                  {stat.label}
                </span>
              </div>
              <span className="font-medium text-dex-text-primary">
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Szybkie akcje */}
        <div className="pt-4 border-t border-dex-border">
          <h3 className="text-sm font-medium text-dex-text-secondary mb-3">
            Szybkie akcje
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-2 p-3 text-left bg-dex-bg-tertiary hover:bg-dex-bg-highlight rounded-lg transition-colors">
              <svg className="w-4 h-4 text-dex-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-dex-text-primary">Szukaj tokenów</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-3 text-left bg-dex-bg-tertiary hover:bg-dex-bg-highlight rounded-lg transition-colors">
              <svg className="w-4 h-4 text-dex-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-dex-text-primary">Zobacz portfolio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserStats