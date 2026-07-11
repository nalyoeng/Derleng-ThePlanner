import AuthPage from './features/auth'
import UserRoutes from './routes/UserRoutes'
import AdminRoutes from './routes/AdminRoutes'
import { useAuth } from './hooks/useAuth'
import {
  isAdminRole,
  normalizeRole,
} from './constants/roles'

export default function App() {
  const {
    user,
    role,
    loading,
    error,
    logout,
  } = useAuth()

  const currentRole = normalizeRole(role)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading account...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-600">{error}</p>

        <button
          type="button"
          onClick={logout}
          className="rounded-xl bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (isAdminRole(currentRole)) {
    return (
      <AdminRoutes
        role={currentRole}
        onLogout={logout}
      />
    )
  }

  if (currentRole !== 'user') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-red-600">
          Unsupported account role: {currentRole || 'empty'}
        </p>

        <button
          type="button"
          onClick={logout}
          className="rounded-xl bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <UserRoutes
      user={user}
      onLogout={logout}
    />
  )
}