import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type DatosRegistro } from '../services/api'
import type { Sesion } from '../types'
import { borrarSesion, guardarSesion, leerSesion } from './almacenSesion'

interface AuthContexto {
  sesion: Sesion | null
  iniciarSesion: (email: string, password: string, rol?: string, sede?: string | null) => Promise<void>
  registrarse: (datos: DatosRegistro) => Promise<void>
  cerrarSesion: () => void
}

const AuthContext = createContext<AuthContexto | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)

  useEffect(() => {
    const expirar = () => setSesion(null)
    window.addEventListener('permanencia:sesion-expirada', expirar)
    return () => window.removeEventListener('permanencia:sesion-expirada', expirar)
  }, [])

  const iniciarSesion = useCallback(async (
    email: string,
    password: string,
    rol?: string,
    sede?: string | null,
  ) => {
    const nueva = await authApi.login(email, password, rol, sede)
    guardarSesion(nueva)
    setSesion(nueva)
  }, [])

  const registrarse = useCallback(async (datos: DatosRegistro) => {
    const nueva = await authApi.registrar(datos)
    guardarSesion(nueva)
    setSesion(nueva)
  }, [])

  const cerrarSesion = useCallback(() => {
    // Revoca el token en el servidor; si falla (sin red), igual se borra en el navegador.
    // La petición sale antes de borrar la sesión para que lleve el token.
    void authApi.logout().catch(() => undefined)
    borrarSesion()
    setSesion(null)
  }, [])

  const valor = useMemo(
    () => ({ sesion, iniciarSesion, registrarse, cerrarSesion }),
    [sesion, iniciarSesion, registrarse, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContexto {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return contexto
}
