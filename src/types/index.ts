/** Tipos compartidos entre las pantallas del demo. */

/** Jerarquía institucional: nivel de acceso a los datos, de menor a mayor. */
export type Rol =
  | 'ESTUDIANTE'
  | 'PROFESOR'
  | 'JEFE_PROGRAMA'
  | 'COORDINADOR_SEDE'
  | 'DECANO'
  | 'RECTOR'

/** Etiquetas legibles de cada rol para menús y formularios. */
export const ETIQUETAS_ROL: Record<Rol, string> = {
  ESTUDIANTE: 'Estudiante',
  PROFESOR: 'Profesor',
  JEFE_PROGRAMA: 'Jefe de Programa',
  COORDINADOR_SEDE: 'Coordinador de Sede',
  DECANO: 'Decano / Jefe de Facultad',
  RECTOR: 'Rector / Director Nacional',
}

/** Roles que deben elegir una sede al iniciar sesión. */
/** Todos los roles eligen sede al entrar; el rector conserva la vista nacional. */
export const ROLES_CON_SEDE: Rol[] = [
  'ESTUDIANTE',
  'PROFESOR',
  'JEFE_PROGRAMA',
  'COORDINADOR_SEDE',
  'DECANO',
]

/** Las 17 sedes de la Universidad Cooperativa de Colombia. */
export const SEDES_UCC = [
  'Apartadó',
  'Arauca',
  'Barrancabermeja',
  'Bogotá',
  'Bucaramanga',
  'Cali',
  'Cartago',
  'El Espinal',
  'Ibagué',
  'Medellín',
  'Montería',
  'Neiva',
  'Pasto',
  'Pereira',
  'Popayán',
  'Santa Marta',
  'Villavicencio',
] as const

export type NivelRiesgo = 'ALTO' | 'MEDIO' | 'BAJO'

export type EstadoEstudiante = 'ACTIVO' | 'APLAZADO' | 'RETIRADO'

/** Sesión activa: el rol define el alcance de los datos y la sede (si aplica). */
export interface Sesion {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
  programa: string | null
  sede: string | null
  facultad: string | null
  estudianteId: number | null
  token: string
}

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
  programa: string | null
  sede: string | null
}

export interface NotaMateria {
  nombre: string
  nota: number
  faltas: number
  faltasJustificadas: number
  semestre: number
  grupo: string
  homologada: boolean
  fecha: string
}

export interface Estudiante {
  id: number
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  facultad: string
  sede: string
  semestre: number
  grupo: string
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
  grupo: string
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

export interface ConteoSede {
  sede: string
  total: number
  alto: number
  medio: number
  bajo: number
  retirados: number
}

export interface ConteoGrupo {
  grupo: string
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
  porSede: ConteoSede[]
  porGrupo: ConteoGrupo[]
}

export interface Notificacion {
  id: number
  estudianteId: number
  nombre: string
  carrera: string
  semestre: number
  grupo: string
  categoria: string
  riesgo: NivelRiesgo
  tipo: string
  titulo: string
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
  /** Firma con vencimiento para descargar el adjunto (la entrega el backend con cada mensaje). */
  archivoFirma?: string | null
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
  sede?: string
  facultad?: string
  semestre?: number
  categoria?: string
  riesgo?: NivelRiesgo
  grupo?: string
}

export interface FiltrosEstudiante {
  search?: string
  carrera?: string
  sede?: string
  facultad?: string
  semestre?: number
  categoria?: string
  riesgo?: NivelRiesgo
  estado?: EstadoEstudiante
  grupo?: string
  limit?: number
}

/** Acción del historial de acompañamiento de un estudiante. */
export interface AccionAcompanamiento {
  id: number
  estudianteId: number
  fecha: string
  titulo: string
  descripcion: string
  responsable: string
  estado: 'CUMPLIDO' | 'NO_ASISTIO' | 'PENDIENTE'
}

/** Catálogo de opciones para los filtros, recortado según el rol. */
export interface Catalogo {
  sedes: string[]
  facultades: string[]
  programas: string[]
  categorias: string[]
  semestres: number[]
  riesgos: NivelRiesgo[]
  sedeFija: string | null
  programaFijo: string | null
  grupos: string[]
}

/** Período académico del perfil personal del estudiante. */
export interface PeriodoAcademico {
  periodo: string
  etiqueta: string
  promedio: number
  faltas: number
  riesgo: NivelRiesgo
  riesgoScore: number
  materias: NotaMateria[]
  inicio: string
  fin: string
}

export interface ResumenPersonal {
  periodo: string
  promedio: number
  faltas: number
  riesgo: NivelRiesgo
  riesgoScore: number
}

/** Perfil completo que ve el rol Estudiante en Estadísticas. */
export interface PerfilEstudiante {
  estudianteId: number
  nombre: string
  apellido: string
  carrera: string
  facultad: string
  sede: string
  semestre: number
  grupo: string
  email: string
  fechaIngreso: string
  estado: EstadoEstudiante
  categoria: string
  razon: string
  promedioActual: number
  faltas: number
  riesgoActual: NivelRiesgo
  riesgoScore: number
  periodos: PeriodoAcademico[]
  inicio: ResumenPersonal
  actual: ResumenPersonal
  lectura: string
}

/** Justificación de una falta radicada por el estudiante. */
export interface Justificacion {
  id: number
  estudianteId: number
  estudiante: string
  materia: string
  semestre: number
  grupo: string
  fechaFalta: string
  motivo: string
  descripcion: string
  evidencia: string
  correoDestino: string
  estado: 'EN_REVISION' | 'APROBADA' | 'RECHAZADA'
  radicado: string
  creadaEn: string
}

export interface JustificacionNueva {
  materia: string
  semestre: number
  grupo: string
  fechaFalta: string
  motivo: string
  descripcion: string
  evidencia: string
  correoDestino: string
}

/** Respuesta del mini chat de IA. */
export interface RespuestaIA {
  respuesta: string
  sugerencias: string[]
  alcance: string
  permitido: boolean
}

export interface CapacidadesIA {
  disponible: boolean
  rol: string
  capacidades: string[]
}

/** Turno guardado en el historial confidencial de IA. */
export interface MensajeHistorialIA {
  id: number
  autor: 'IA' | 'YO'
  texto: string
  fecha: string
}
