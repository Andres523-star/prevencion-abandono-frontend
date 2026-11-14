import { type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/Toast'
import { Chat } from './pages/Chat'
import { Dashboard } from './pages/Dashboard'
import { DetalleEstudiante } from './pages/DetalleEstudiante'
import { Historial } from './pages/Historial'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Reportes } from './pages/Reportes'

/** El panel institucional no aplica al estudiante: su entrada es Estadísticas. */
function Inicio() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'ESTUDIANTE') return <Navigate to="/reportes" replace />
  return <Dashboard />
}

/** Fichas y panel solo para los roles institucionales. */
function SoloInstitucional({ children }: { children: ReactNode }) {
  const { sesion } = useAuth()
  if (sesion?.rol === 'ESTUDIANTE') return <Navigate to="/reportes" replace />
  return children
}

/** El historial personal es exclusivo del rol Estudiante. */
function SoloEstudiante({ children }: { children: ReactNode }) {
  const { sesion } = useAuth()
  if (sesion?.rol !== 'ESTUDIANTE') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Inicio />} />
                <Route
                  path="estudiantes/:id"
                  element={
                    <SoloInstitucional>
                      <DetalleEstudiante />
                    </SoloInstitucional>
                  }
                />
                <Route path="reportes" element={<Reportes />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/:id" element={<Chat />} />
                <Route
                  path="historial"
                  element={
                    <SoloEstudiante>
                      <Historial />
                    </SoloEstudiante>
                  }
                />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
