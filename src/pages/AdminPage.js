import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [usersResponse, favoritesResponse] = await Promise.all([
        fetch('http://localhost:3000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }),
        fetch('http://localhost:3000/api/admin/favorites', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
      ]);

      if (usersResponse.ok && favoritesResponse.ok) {
        const usersData = await usersResponse.json();
        const favoritesData = await favoritesResponse.json();
        setUsers(usersData);
        setFavorites(favoritesData);
      } else {
        setError('Failed to load admin data');
      }
    } catch (err) {
      setError('Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
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
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex border-b border-dex-border mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'users'
              ? 'text-dex-text-primary border-b-2 border-dex-blue'
              : 'text-dex-text-secondary hover:text-dex-text-primary'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'favorites'
              ? 'text-dex-text-primary border-b-2 border-dex-blue'
              : 'text-dex-text-secondary hover:text-dex-text-primary'
          }`}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-dex-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs text-dex-text-secondary uppercase border-b border-dex-border">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Joined</th>
                  <th className="p-4 text-left">Favorites</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-dex-border hover:bg-dex-bg-tertiary">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-dex-blue rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-dex-text-secondary">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' 
                          ? 'bg-red-900/30 text-red-400' 
                          : 'bg-green-900/30 text-green-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-dex-text-secondary">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-dex-text-secondary">
                      {favorites.filter(f => f.user_id === user.id).length}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleUserRole(user.id, user.role)}
                          className="px-3 py-1 bg-dex-bg-tertiary hover:bg-dex-bg-highlight rounded text-xs"
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="bg-dex-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs text-dex-text-secondary uppercase border-b border-dex-border">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Token</th>
                  <th className="p-4 text-left">Chain</th>
                  <th className="p-4 text-left">Added</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((favorite) => (
                  <tr key={`${favorite.user_id}-${favorite.token_address}-${favorite.chain_id}`} className="border-b border-dex-border hover:bg-dex-bg-tertiary">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-dex-blue rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs">
                            {favorite.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm">{favorite.username}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <img
                          src={favorite.token_logo || '/images/tokens/default-token.svg'}
                          alt={favorite.token_symbol}
                          className="w-6 h-6 rounded-full mr-2"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzM0Mzk0NyIvPjwvc3ZnPg==';
                          }}
                        />
                        <div>
                          <div className="font-medium text-sm">{favorite.token_symbol}</div>
                          <div className="text-xs text-dex-text-secondary">{favorite.token_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-dex-bg-tertiary rounded text-xs">
                        {favorite.chain_id === '0x1' ? 'Ethereum' :
                         favorite.chain_id === 'solana' ? 'Solana' :
                         favorite.chain_id === '0x38' ? 'BSC' :
                         favorite.chain_id}
                      </span>
                    </td>
                    <td className="p-4 text-dex-text-secondary text-sm">
                      {new Date(favorite.created_at).toLocaleDateString()}
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

export default AdminPage;