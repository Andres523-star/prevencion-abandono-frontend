import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

/** Protege las rutas privadas y recuerda a dónde quería ir el usuario. */
export function ProtectedRoute() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (!sesion) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
