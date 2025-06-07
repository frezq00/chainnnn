import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp, isSupabaseConfigured } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isSupabaseConfigured) {
      setError('Funkcje autentykacji są obecnie niedostępne. Skontaktuj się z administratorem.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signUp(email, password, fullName)
      setSuccess(true)
      setEmail('')
      setPassword('')
      setFullName('')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-dex-bg-secondary rounded-lg w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-dex-text-primary mb-2">
              Rejestracja zakończona!
            </h2>
            <p className="text-dex-text-secondary mb-6">
              Sprawdź swoją skrzynkę email, aby potwierdzić konto.
            </p>
            <button
              onClick={() => {
                setSuccess(false)
                onClose()
              }}
              className="px-6 py-2 bg-dex-blue hover:bg-blue-600 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-dex-bg-secondary rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-dex-text-primary">
            Zarejestruj się
          </h2>
          <button
            onClick={onClose}
            className="text-dex-text-secondary hover:text-dex-text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-500 text-yellow-400 rounded">
            Funkcje autentykacji są obecnie niedostępne. Aby włączyć rejestrację, skonfiguruj Supabase.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-dex-text-secondary text-sm mb-2">
              Imię i nazwisko
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-dex-bg-tertiary border border-dex-border rounded text-dex-text-primary focus:outline-none focus:border-dex-blue"
              required
              disabled={!isSupabaseConfigured}
            />
          </div>

          <div>
            <label className="block text-dex-text-secondary text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-dex-bg-tertiary border border-dex-border rounded text-dex-text-primary focus:outline-none focus:border-dex-blue"
              required
              disabled={!isSupabaseConfigured}
            />
          </div>

          <div>
            <label className="block text-dex-text-secondary text-sm mb-2">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-dex-bg-tertiary border border-dex-border rounded text-dex-text-primary focus:outline-none focus:border-dex-blue"
              minLength={6}
              required
              disabled={!isSupabaseConfigured}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full py-2 bg-dex-blue hover:bg-blue-600 text-white rounded font-medium disabled:opacity-50"
          >
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-dex-text-secondary">Masz już konto? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-dex-blue hover:underline"
            disabled={!isSupabaseConfigured}
          >
            Zaloguj się
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterModal