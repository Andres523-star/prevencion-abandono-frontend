import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/Toast'
import { Chat } from './pages/Chat'
import { Dashboard } from './pages/Dashboard'
import { DetalleEstudiante } from './pages/DetalleEstudiante'
import { Estudiantes } from './pages/Estudiantes'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Reportes } from './pages/Reportes'

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
                <Route index element={<Dashboard />} />
                <Route path="estudiantes" element={<Estudiantes />} />
                <Route path="estudiantes/:id" element={<DetalleEstudiante />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/:id" element={<Chat />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
