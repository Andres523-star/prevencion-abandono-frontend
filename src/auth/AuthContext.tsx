import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../services/api'
import type { Sesion } from '../types'

const CLAVE_SESION = 'permanencia.sesion'

interface AuthContexto {
  sesion: Sesion | null
  iniciarSesion: (email: string, password: string) => Promise<void>
  registrarse: (datos: {
    nombre: string
    apellido: string
    email: string
    password: string
    rol: string
  }) => Promise<void>
  cerrarSesion: () => void
}

const AuthContext = createContext<AuthContexto | null>(null)

function leerSesion(): Sesion | null {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION)
    return guardada ? (JSON.parse(guardada) as Sesion) : null
  } catch {
    localStorage.removeItem(CLAVE_SESION)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)

  useEffect(() => {
    const expirar = () => setSesion(null)
    window.addEventListener('permanencia:sesion-expirada', expirar)
    return () => window.removeEventListener('permanencia:sesion-expirada', expirar)
  }, [])

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const nueva = await authApi.login(email, password)
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva))
    setSesion(nueva)
  }, [])

  const registrarse = useCallback(
    async (datos: { nombre: string; apellido: string; email: string; password: string; rol: string }) => {
      const nueva = await authApi.registrar(datos)
      localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva))
      setSesion(nueva)
    },
    [],
  )

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVE_SESION)
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
