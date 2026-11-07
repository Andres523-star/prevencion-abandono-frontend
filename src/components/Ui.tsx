import { useEffect, type ReactNode } from 'react'
import { COLOR_RIESGO } from '../utils/format'
import type { EstadoEstudiante, NivelRiesgo } from '../types'
import { Icon, type IconName } from './Icon'

export function RiesgoBadge({ riesgo, compacto }: { riesgo: NivelRiesgo; compacto?: boolean }) {
  return (
    <span className={`riesgo-badge riesgo-badge--${riesgo.toLowerCase()}${compacto ? ' riesgo-badge--compacto' : ''}`}>
      <span className="riesgo-badge__punto" style={{ background: COLOR_RIESGO[riesgo] }} />
      {riesgo}
    </span>
  )
}

export function EstadoBadge({ estado }: { estado: EstadoEstudiante }) {
  const etiqueta = estado === 'ACTIVO' ? 'Activo' : estado === 'APLAZADO' ? 'Aplazado' : 'Retirado'
  return <span className={`estado-badge estado-badge--${estado.toLowerCase()}`}>{etiqueta}</span>
}

const PALETA_AVATAR = ['#145c4e', '#8a5a2b', '#4f6b9a', '#7a4f7d', '#a3533f', '#3d6b68', '#6b6b3f']
const COLORES_AVATAR = new Map<string, string>()

function colorAvatar(nombre: string): string {
  const existente = COLORES_AVATAR.get(nombre)
  if (existente) return existente
  let suma = 0
  for (let i = 0; i < nombre.length; i++) suma += nombre.charCodeAt(i)
  const color = PALETA_AVATAR[suma % PALETA_AVATAR.length]
  COLORES_AVATAR.set(nombre, color)
  return color
}

interface AvatarProps {
  nombre: string
  apellido: string
  tamano?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  riesgo?: NivelRiesgo
}

export function Avatar({ nombre, apellido, tamano = 'md', riesgo }: AvatarProps) {
  return (
    <span
      className={`avatar avatar--${tamano}`}
      style={{ background: colorAvatar(`${nombre}${apellido}`) }}
      aria-hidden="true"
    >
      {nombre.charAt(0)}
      {apellido.charAt(0)}
      {riesgo && <span className="avatar__punto" style={{ background: COLOR_RIESGO[riesgo] }} />}
    </span>
  )
}

export function Cargando({ texto = 'Cargando información…' }: { texto?: string }) {
  return (
    <div className="cargando">
      <span className="cargando__spinner" />
      <p>{texto}</p>
    </div>
  )
}

export function Vacio({
  icono = 'search',
  titulo,
  texto,
  children,
}: {
  icono?: IconName
  titulo: string
  texto?: string
  children?: ReactNode
}) {
  return (
    <div className="vacio">
      <span className="vacio__icono">
        <Icon name={icono} size={26} />
      </span>
      <h3>{titulo}</h3>
      {texto && <p>{texto}</p>}
      {children}
    </div>
  )
}

export function BarraProgreso({
  valor,
  maximo = 5,
  color,
  etiqueta,
}: {
  valor: number
  maximo?: number
  color: string
  etiqueta?: string
}) {
  const porcentaje = Math.max(0, Math.min(100, (valor / maximo) * 100))
  return (
    <div className="barra-progreso" aria-label={etiqueta}>
      <span className="barra-progreso__relleno" style={{ width: `${porcentaje}%`, background: color }} />
    </div>
  )
}

interface ModalProps {
  abierto: boolean
  titulo: string
  descripcion?: string
  onCerrar: () => void
  children: ReactNode
  pie?: ReactNode
  ancho?: 'normal' | 'amplio'
}

export function Modal({ abierto, titulo, descripcion, onCerrar, children, pie, ancho = 'normal' }: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = overflowAnterior
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="modal-fondo" role="presentation" onMouseDown={onCerrar}>
      <div
        className={`modal modal--${ancho}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <header className="modal__cabecera">
          <div>
            <h2>{titulo}</h2>
            {descripcion && <p>{descripcion}</p>}
          </div>
          <button type="button" className="boton-icono" onClick={onCerrar} aria-label="Cerrar">
            <Icon name="close" size={19} />
          </button>
        </header>
        <div className="modal__cuerpo">{children}</div>
        {pie && <footer className="modal__pie">{pie}</footer>}
      </div>
    </div>
  )
}
