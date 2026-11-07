import type { Estudiante, NivelRiesgo } from '../types'

export const CARRERAS = [
  'Enfermería',
  'Medicina',
  'Derecho',
  'Ingeniería de Software',
  'Ingeniería Industrial',
  'Odontología',
] as const

export const CATEGORIAS = [
  'Crisis económica',
  'Depresión familiar',
  'Desconexión al futuro',
  'Estrés académico',
  'Desmotivación',
] as const

export const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export const RIESGOS: NivelRiesgo[] = ['ALTO', 'MEDIO', 'BAJO']

export const COLOR_RIESGO: Record<NivelRiesgo, string> = {
  ALTO: '#d9553f',
  MEDIO: '#e2a12a',
  BAJO: '#2f8a68',
}

export const COLOR_CATEGORIA: Record<string, string> = {
  'Crisis económica': '#d97757',
  'Depresión familiar': '#8b6db3',
  'Desconexión al futuro': '#4f7fb8',
  'Estrés académico': '#d9a441',
  Desmotivación: '#6b8f71',
}

export const ICONO_CATEGORIA: Record<string, 'money' | 'heart' | 'compass' | 'activity' | 'sparkles'> = {
  'Crisis económica': 'money',
  'Depresión familiar': 'heart',
  'Desconexión al futuro': 'compass',
  'Estrés académico': 'activity',
  Desmotivación: 'sparkles',
}

export function nombreCompleto(estudiante: Pick<Estudiante, 'nombre' | 'apellido'>): string {
  return `${estudiante.nombre} ${estudiante.apellido}`
}

export function iniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}

export function formatearNumero(valor: number): string {
  return new Intl.NumberFormat('es-CO').format(valor)
}

export function fechaCorta(iso: string): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(fecha)
}

export function fechaHora(iso: string): string {
  if (!iso) return '—'
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha)
}

export function hora(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(fecha)
}

/** Texto relativo corto, por ejemplo "hace 12 min". */
export function hace(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const segundos = Math.max(0, Math.floor((Date.now() - fecha.getTime()) / 1000))
  if (segundos < 60) return 'ahora'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias} d`
  return fechaCorta(iso)
}

/** Enlace de Google Calendar para agendar una cita de acompañamiento. */
export function enlaceCita(estudiante: Estudiante): string {
  const inicio = new Date()
  inicio.setDate(inicio.getDate() + 1)
  inicio.setHours(10, 0, 0, 0)
  const fin = new Date(inicio.getTime() + 30 * 60 * 1000)
  const formato = (fecha: Date) => fecha.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const titulo = `Cita de acompañamiento con ${estudiante.nombre} ${estudiante.apellido}`
  const detalle = `Riesgo ${estudiante.riesgoActual} · ${estudiante.categoria} · ${estudiante.carrera}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    details: detalle,
    dates: `${formato(inicio)}/${formato(fin)}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
