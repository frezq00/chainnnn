import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import FavoriteTokens from './FavoriteTokens'
import UserStats from './UserStats'

const UserDashboard = () => {
  const { user, profile } = useAuth()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dex-text-primary mb-2">
          Witaj, {profile?.full_name || user?.email}!
        </h1>
        <p className="text-dex-text-secondary">
          Zarządzaj swoimi ulubionymi tokenami i śledź swoje inwestycje
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statystyki użytkownika */}
        <div className="lg:col-span-1">
          <UserStats />
        </div>

        {/* Ulubione tokeny */}
        <div className="lg:col-span-2">
          <FavoriteTokens />
        </div>
      </div>
    </div>
  )
}

export default UserDashboard