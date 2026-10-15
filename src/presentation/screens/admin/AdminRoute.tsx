import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/presentation/context/useAuth'

export default function AdminRoute() {
  const { profile, loading } = useAuth()

  if (loading) return <p className="admin-message">Checking your access…</p>
  if (!profile || profile.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}