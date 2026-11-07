import axios, { type AxiosError } from 'axios'
import type {
  Analisis,
  Conversacion,
  Estudiante,
  EstudianteNuevo,
  FiltrosEstudiante,
  FiltrosReporte,
  Mensaje,
  MensajeNuevo,
  Notificacion,
  Reporte,
  Sesion,
} from '../types'

/** URL del backend del demo. Se puede cambiar con VITE_API_URL. */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({ baseURL: API_URL, timeout: 30_000 })

api.interceptors.request.use((config) => {
  const guardada = localStorage.getItem('permanencia.sesion')
  if (guardada) {
    try {
      const sesion = JSON.parse(guardada) as Sesion
      if (sesion.token) config.headers.Authorization = `Bearer ${sesion.token}`
    } catch {
      localStorage.removeItem('permanencia.sesion')
    }
  }
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('permanencia.sesion')
      window.dispatchEvent(new Event('permanencia:sesion-expirada'))
    }
    return Promise.reject(error)
  },
)

/** Convierte cualquier error de axios en un mensaje legible para el usuario. */
export function mensajeError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (error.response?.data?.error) return error.response.data.error
    if (error.code === 'ECONNABORTED') return 'La solicitud tardó demasiado. Intenta de nuevo.'
    if (!error.response) {
      return 'No se pudo conectar con el backend. Verifica que esté corriendo en el puerto 8080.'
    }
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}

export const authApi = {
  async login(email: string, password: string): Promise<Sesion> {
    const { data } = await api.post<Sesion>('/auth/login', { email, password })
    return data
  },
  async registrar(datos: {
    nombre: string
    apellido: string
    email: string
    password: string
    rol: string
  }): Promise<Sesion> {
    const { data } = await api.post<Sesion>('/auth/register', datos)
    return data
  },
}

export const estudiantesApi = {
  async listar(filtros: FiltrosEstudiante = {}): Promise<Estudiante[]> {
    const { data } = await api.get<Estudiante[]>('/estudiantes', { params: filtros })
    return data
  },
  async obtener(id: number): Promise<Estudiante> {
    const { data } = await api.get<Estudiante>(`/estudiantes/${id}`)
    return data
  },
  async crear(datos: EstudianteNuevo): Promise<Estudiante> {
    const { data } = await api.post<Estudiante>('/estudiantes', datos)
    return data
  },
}

export const reportesApi = {
  async obtener(filtros: FiltrosReporte = {}): Promise<Reporte> {
    const { data } = await api.get<Reporte>('/reportes', { params: filtros })
    return data
  },
}

export const notificacionesApi = {
  async listar(): Promise<Notificacion[]> {
    const { data } = await api.get<Notificacion[]>('/notificaciones')
    return data
  },
  async marcarLeida(id: number): Promise<void> {
    await api.post(`/notificaciones/${id}/leer`)
  },
  async marcarTodas(): Promise<void> {
    await api.post('/notificaciones/leer-todas')
  },
}

export const chatApi = {
  async conversaciones(): Promise<Conversacion[]> {
    const { data } = await api.get<Conversacion[]>('/chats')
    return data
  },
  async mensajes(estudianteId: number): Promise<Mensaje[]> {
    const { data } = await api.get<Mensaje[]>(`/chats/${estudianteId}/mensajes`)
    return data
  },
  async enviar(estudianteId: number, mensaje: MensajeNuevo): Promise<Mensaje> {
    const { data } = await api.post<Mensaje>(`/chats/${estudianteId}/mensajes`, mensaje)
    return data
  },
  archivoUrl(archivoId: string): string {
    return `${API_URL}/chats/adjuntos/${archivoId}`
  },
}

export const analisisApi = {
  async analizar(estudianteId: number): Promise<Analisis> {
    const { data } = await api.post<Analisis>(`/analizar/${estudianteId}`)
    return data
  },
}
