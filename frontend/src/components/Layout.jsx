import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-surface-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-xl text-brand-600 tracking-tight">
            Flow
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-600">{user?.full_name}</span>
            <button
              onClick={logout}
              className="text-sm text-surface-500 hover:text-surface-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
