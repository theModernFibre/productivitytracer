import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      login(res.access_token, res.user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 to-brand-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600 tracking-tight">Flow</h1>
          <p className="text-surface-600 mt-1">B2B Productivity</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg border border-surface-200 p-8"
        >
          <h2 className="text-xl font-semibold text-surface-900 mb-6">Sign in</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none mb-4"
            placeholder="you@company.com"
          />
          <label className="block text-sm font-medium text-surface-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-surface-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none mb-6"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-4 text-center text-sm text-surface-600">
            No account?{' '}
            <Link to="/register" className="text-brand-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
