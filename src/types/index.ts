/** Tipos compartidos entre las pantallas del demo. */

export type Rol = 'DOCENTE' | 'COORDINADOR'

export type NivelRiesgo = 'ALTO' | 'MEDIO' | 'BAJO'

export type EstadoEstudiante = 'ACTIVO' | 'APLAZADO' | 'RETIRADO'

export interface Sesion {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
  token: string
}

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
}

export interface NotaMateria {
  nombre: string
  nota: number
}

export interface Estudiante {
  id: number
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  semestre: number
  email: string
  telefono: string
  categoria: string
  razon: string
  promedio: number
  faltas: number
  riesgoActual: NivelRiesgo
  riesgoScore: number
  estado: EstadoEstudiante
  fechaIngreso: string
  materias: NotaMateria[]
  historialRiesgo: number[]
}

export interface EstudianteNuevo {
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  semestre: number
  email: string
  telefono: string
  categoria: string
  razon: string
  promedio: number
  faltas: number
  estado: EstadoEstudiante
}

export interface ConteoCarrera {
  carrera: string
  total: number
  alto: number
  medio: number
  bajo: number
  retirados: number
  aplazados: number
}

export interface ConteoCategoria {
  categoria: string
  total: number
  porcentaje: number
  alto: number
}

export interface ConteoSemestre {
  semestre: number
  total: number
  alto: number
  medio: number
  bajo: number
  retirados: number
}

export interface Reporte {
  totalEstudiantes: number
  riesgoAlto: number
  riesgoMedio: number
  riesgoBajo: number
  retirados: number
  aplazados: number
  activos: number
  porcentajeDesercion: number
  promedioGeneral: number
  totalFaltas: number
  categoriaPrincipal: string
  insight: string
  porCarrera: ConteoCarrera[]
  porCategoria: ConteoCategoria[]
  porSemestre: ConteoSemestre[]
}

export interface Notificacion {
  id: number
  estudianteId: number
  nombre: string
  carrera: string
  semestre: number
  categoria: string
  riesgo: NivelRiesgo
  motivo: string
  linkCita: string
  fecha: string
  leida: boolean
}

export interface Conversacion {
  estudianteId: number
  nombre: string
  apellido: string
  carrera: string
  semestre: number
  categoria: string
  riesgoActual: NivelRiesgo
  ultimoMensaje: string
  ultimaFecha: string
  noLeidos: number
}

export interface Mensaje {
  id: number
  estudianteId: number
  autor: 'PROFESOR' | 'ESTUDIANTE'
  texto: string
  tipo: 'TEXTO' | 'ARCHIVO'
  nombreArchivo: string | null
  mime: string | null
  archivoId: string | null
  fecha: string
  timestamp: number
  leido: boolean
}

export interface MensajeNuevo {
  texto: string
  tipo?: 'TEXTO' | 'ARCHIVO'
  nombreArchivo?: string
  mime?: string
  archivoBase64?: string
}

export interface Analisis {
  estudianteId: number
  nombre: string
  riesgoActual: NivelRiesgo
  riesgoScore: number
  promedio: number
  faltas: number
  categoria: string
  recomendacion: string
  acciones: string[]
  fuente: string
  fecha: string
}

export interface FiltrosReporte {
  carrera?: string
  semestre?: number
  categoria?: string
}

export interface FiltrosEstudiante {
  search?: string
  carrera?: string
  semestre?: number
  categoria?: string
  riesgo?: NivelRiesgo
  limit?: number
}
