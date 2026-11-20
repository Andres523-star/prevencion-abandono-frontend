import axios, { type AxiosError } from 'axios'
import type {
  AccionAcompanamiento,
  Analisis,
  CapacidadesIA,
  Catalogo,
  Conversacion,
  Estudiante,
  EstudianteNuevo,
  FiltrosEstudiante,
  FiltrosReporte,
  Justificacion,
  JustificacionNueva,
  Mensaje,
  MensajeHistorialIA,
  MensajeNuevo,
  Notificacion,
  PerfilEstudiante,
  Reporte,
  RespuestaIA,
  Sesion,
} from '../types'
import { borrarSesion, tokenActual } from '../auth/almacenSesion'

/** URL del backend del demo. Se puede cambiar con VITE_API_URL. */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({ baseURL: API_URL, timeout: 30_000 })

api.interceptors.request.use((config) => {
  const token = tokenActual()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      borrarSesion()
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
  async login(email: string, password: string, rol?: string, sede?: string | null): Promise<Sesion> {
    const { data } = await api.post<Sesion>('/auth/login', { email, password, rol, sede })
    return data
  },
  async registrar(datos: DatosRegistro): Promise<Sesion> {
    const { data } = await api.post<Sesion>('/auth/register', datos)
    return data
  },
  /** Sedes y, para cada una, los programas que se dictan (público: se usa antes de tener cuenta). */
  async opcionesRegistro(): Promise<Record<string, string[]>> {
    const { data } = await api.get<Record<string, string[]>>('/auth/opciones-registro')
    return data
  },
  /** Revoca el token en el servidor. */
  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}

/** El registro público solo crea profesores, atados a una sede y un programa. */
export interface DatosRegistro {
  nombre: string
  apellido: string
  email: string
  password: string
  sede: string
  programa: string
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

export const catalogosApi = {
  async obtener(): Promise<Catalogo> {
    const { data } = await api.get<Catalogo>('/catalogos')
    return data
  },
}

export const notificacionesApi = {
  async listar(grupo?: string): Promise<Notificacion[]> {
    const { data } = await api.get<Notificacion[]>('/notificaciones', {
      params: grupo ? { grupo } : undefined,
    })
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
  /**
   * Enlace de descarga de un adjunto. Lleva la firma con vencimiento que el backend entrega con
   * cada mensaje: sin ella la descarga responde 403.
   */
  archivoUrl(mensaje: Pick<Mensaje, 'archivoId' | 'archivoFirma'>): string {
    const firma = mensaje.archivoFirma ? `?firma=${encodeURIComponent(mensaje.archivoFirma)}` : ''
    return `${API_URL}/chats/adjuntos/${encodeURIComponent(mensaje.archivoId ?? '')}${firma}`
  },
}

export const analisisApi = {
  async analizar(estudianteId: number): Promise<Analisis> {
    const { data } = await api.post<Analisis>(`/analizar/${estudianteId}`)
    return data
  },
}

export const acompanamientoApi = {
  async listar(estudianteId: number): Promise<AccionAcompanamiento[]> {
    const { data } = await api.get<AccionAcompanamiento[]>(`/estudiantes/${estudianteId}/acompanamiento`)
    return data
  },
  async actualizar(
    estudianteId: number,
    accionId: number,
    estado: AccionAcompanamiento['estado'],
  ): Promise<AccionAcompanamiento> {
    const { data } = await api.put<AccionAcompanamiento>(
      `/estudiantes/${estudianteId}/acompanamiento/${accionId}`,
      { estado },
    )
    return data
  },
}

export const perfilApi = {
  async obtener(estudianteId: number): Promise<PerfilEstudiante> {
    const { data } = await api.get<PerfilEstudiante>(`/estudiantes/${estudianteId}/perfil`)
    return data
  },
}

export const iaApi = {
  async capacidades(): Promise<CapacidadesIA> {
    const { data } = await api.get<CapacidadesIA>('/ia/capacidades')
    return data
  },
  async consultar(mensaje: string): Promise<RespuestaIA> {
    const { data } = await api.post<RespuestaIA>('/ia/consultar', { mensaje })
    return data
  },
  async historial(): Promise<MensajeHistorialIA[]> {
    const { data } = await api.get<MensajeHistorialIA[]>('/ia/historial')
    return data
  },
  async limpiarHistorial(): Promise<{ eliminados: number }> {
    const { data } = await api.delete<{ eliminados: number }>('/ia/historial')
    return data
  },
}

export const justificacionesApi = {
  async listar(): Promise<Justificacion[]> {
    const { data } = await api.get<Justificacion[]>('/justificaciones')
    return data
  },
  async correo(): Promise<{ correo: string; recordatorio: string }> {
    const { data } = await api.get<{ correo: string; recordatorio: string }>('/justificaciones/correo')
    return data
  },
  async crear(datos: JustificacionNueva): Promise<Justificacion> {
    const { data } = await api.post<Justificacion>('/justificaciones', datos)
    return data
  },
}

/** Descargas reales: pide el archivo con el token y dispara la descarga en el navegador. */
export const descargasApi = {
  async descargar(ruta: string, params: object = {}, nombre?: string): Promise<void> {
    const { data, headers } = await api.get<Blob>(ruta, { params, responseType: 'blob' })
    const disposicion = String(headers['content-disposition'] ?? '')
    const encontrado = /filename="?([^";]+)"?/i.exec(disposicion)
    const archivo = nombre ?? (encontrado ? encontrado[1] : 'permanencia.csv')
    const url = URL.createObjectURL(data)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = archivo
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(url)
  },
  estudiantes(filtros: FiltrosEstudiante = {}): Promise<void> {
    return descargasApi.descargar('/export/estudiantes.csv', filtros)
  },
  reporte(filtros: FiltrosReporte = {}): Promise<void> {
    return descargasApi.descargar('/export/reporte.csv', filtros)
  },
  fichaCsv(id: number): Promise<void> {
    return descargasApi.descargar(`/export/estudiantes/${id}/ficha.csv`)
  },
  fichaHtml(id: number): Promise<void> {
    return descargasApi.descargar(`/export/estudiantes/${id}/ficha.html`)
  },
  todo(filtros: FiltrosReporte = {}): Promise<void> {
    return descargasApi.descargar('/export/todo.zip', filtros)
  },
}
