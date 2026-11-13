import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CampanaNotificaciones } from './CampanaNotificaciones'
import { IaChat } from './IaChat'
import { Icon, type IconName } from './Icon'
import { Avatar, Modal } from './Ui'
import { ETIQUETAS_ROL } from '../types'

const NAVEGACION: Array<{ ruta: string; etiqueta: string; icono: IconName; fin?: boolean }> = [
  { ruta: '/', etiqueta: 'Panel', icono: 'panel', fin: true },
  { ruta: '/reportes', etiqueta: 'Estadísticas', icono: 'chart' },
  { ruta: '/chat', etiqueta: 'Acompañamiento', icono: 'chat' },
]

/** El estudiante solo ve su proceso: estadísticas, conversación e historial. */
const NAVEGACION_ESTUDIANTE: Array<{ ruta: string; etiqueta: string; icono: IconName; fin?: boolean }> = [
  { ruta: '/reportes', etiqueta: 'Estadísticas', icono: 'chart' },
  { ruta: '/chat', etiqueta: 'Conversación', icono: 'chat' },
  { ruta: '/historial', etiqueta: 'Historial', icono: 'clock' },
]

function tituloDeRuta(pathname: string, esEstudiante: boolean): { titulo: string; subtitulo: string } {
  if (pathname === '/') {
    return { titulo: 'Panel de permanencia', subtitulo: 'Una mirada clara al pulso de tus estudiantes.' }
  }
  if (pathname.startsWith('/estudiantes/')) {
    return { titulo: 'Ficha del estudiante', subtitulo: 'Historial, contexto y plan de acompañamiento.' }
  }
  if (pathname.startsWith('/historial')) {
    return { titulo: 'Tu historial', subtitulo: 'Lo que ha pasado y lo que viene en tu proceso.' }
  }
  if (pathname.startsWith('/reportes')) {
    return esEstudiante
      ? { titulo: 'Mis estadísticas', subtitulo: 'Cómo ha cambiado tu rendimiento desde que empezaste.' }
      : { titulo: 'Estadísticas', subtitulo: 'Los datos que ayudan a decidir dónde actuar primero.' }
  }
  if (pathname.startsWith('/chat')) {
    return esEstudiante
      ? { titulo: 'Conversación', subtitulo: 'Un espacio directo con tu profesor acompañante.' }
      : { titulo: 'Acompañamiento', subtitulo: 'Conversaciones cercanas, en un solo lugar.' }
  }
  return { titulo: 'Permanencia', subtitulo: 'Acompañar a tiempo cambia historias.' }
}

export function Layout() {
  const { sesion, cerrarSesion } = useAuth()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuUsuario, setMenuUsuario] = useState(false)
  const [confirmarSalida, setConfirmarSalida] = useState<0 | 1 | 2>(0)
  const referenciaMenu = useRef<HTMLDivElement>(null)
  const esEstudiante = sesion?.rol === 'ESTUDIANTE'
  const navegacion = esEstudiante ? NAVEGACION_ESTUDIANTE : NAVEGACION
  const { titulo, subtitulo } = useMemo(
    () => tituloDeRuta(location.pathname, esEstudiante),
    [location.pathname, esEstudiante],
  )

  useEffect(() => {
    if (!menuUsuario) return
    const alClicFuera = (evento: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(evento.target as Node)) {
        setMenuUsuario(false)
      }
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [menuUsuario])

  useEffect(() => {
    setMenuAbierto(false)
    setMenuUsuario(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuAbierto])

  if (!sesion) return null

  const rol = ETIQUETAS_ROL[sesion.rol]
  const fecha = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <div className="app-shell">
      <div
        className={`sidebar-fondo${menuAbierto ? ' sidebar-fondo--visible' : ''}`}
        onClick={() => setMenuAbierto(false)}
        role="presentation"
      />

      <aside className={`sidebar${menuAbierto ? ' sidebar--abierta' : ''}`}>
        <div className="sidebar__marca">
          <span className="marca__simbolo">
            <Icon name="cap" size={22} />
          </span>
          <div>
            <strong>Permanencia</strong>
            <span>Universidad · Demo</span>
          </div>
          <button
            type="button"
            className="sidebar__cerrar boton-icono boton-icono--claro"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="sidebar__contexto">
          <span>Semestre 2026-2</span>
          <strong>
            {esEstudiante
              ? 'Mi proceso'
              : sesion.rol === 'RECTOR'
                ? 'Todas las sedes'
                : sesion.rol === 'DECANO'
                  ? sesion.facultad ?? 'Mi facultad'
                  : sesion.sede ?? sesion.programa ?? 'Plataforma'}
          </strong>
        </div>

        <div className="sidebar__centro">
          <nav className="sidebar__nav" aria-label="Navegación principal">
            <span className="sidebar__seccion">Espacio de trabajo</span>
            {navegacion.map((item) => (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                end={item.fin}
                className={({ isActive }) => `nav-item${isActive ? ' nav-item--activo' : ''}`}
              >
                <Icon name={item.icono} size={19} />
                <span>{item.etiqueta}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar__nota">
          <Icon name="shield" size={18} />
          <p>
            <strong>Demo con datos ficticios.</strong> 1.109.845 estudiantes de las 17 sedes
            precargados para explorar la plataforma.
          </p>
        </div>

        <div className="sidebar__usuario">
          <Avatar nombre={sesion.nombre} apellido={sesion.apellido} tamano="sm" />
          <div className="sidebar__usuario-datos">
            <strong>
              {sesion.nombre} {sesion.apellido}
            </strong>
            <span>{rol}</span>
          </div>
        </div>
      </aside>

      <div className="contenido-principal">
        <header className="topbar">
          <div className="topbar__izquierda">
            <button
              type="button"
              className="topbar__menu boton-icono"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
            >
              <Icon name="menu" size={21} />
            </button>
            <div>
              <p className="topbar__fecha">{fecha}</p>
              <h1>{titulo}</h1>
              <p className="topbar__subtitulo">{subtitulo}</p>
            </div>
          </div>
          <div className="topbar__derecha">
            <span className="topbar__estado">
              <span className="punto-en-linea" /> Sistema activo
            </span>
            {!esEstudiante && <CampanaNotificaciones />}
            <div className="menu-usuario" ref={referenciaMenu}>
              <button
                type="button"
                className={`menu-usuario__disparador${menuUsuario ? ' activo' : ''}`}
                onClick={() => setMenuUsuario((valor) => !valor)}
                aria-expanded={menuUsuario}
                aria-haspopup="menu"
              >
                <Avatar nombre={sesion.nombre} apellido={sesion.apellido} tamano="sm" />
                <span className="menu-usuario__nombre">
                  <strong>{sesion.nombre}</strong>
                  <span>{rol}</span>
                </span>
                <Icon name="chevronDown" size={14} />
              </button>
              {menuUsuario && (
                <div className="menu-usuario__panel" role="menu">
                  <button
                    type="button"
                    className="menu-usuario__item"
                    role="menuitem"
                    onClick={() => {
                      setMenuUsuario(false)
                      setConfirmarSalida(1)
                    }}
                  >
                    <Icon name="logout" size={16} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="contenido" id="contenido">
          <Outlet />
        </main>
      </div>

      <IaChat />

      <Modal
        abierto={confirmarSalida > 0}
        titulo={confirmarSalida === 1 ? 'Cerrar sesión' : 'Última confirmación'}
        descripcion={
          confirmarSalida === 1
            ? 'Vas a salir de tu cuenta de Permanencia.'
            : 'Tu sesión se cerrará y volverás a la pantalla de inicio de sesión.'
        }
        onCerrar={() => setConfirmarSalida(0)}
        ancho="normal"
        pie={
          confirmarSalida === 1 ? (
            <>
              <button type="button" className="boton boton--secundario" onClick={() => setConfirmarSalida(0)}>
                Cancelar
              </button>
              <button type="button" className="boton boton--primario" onClick={() => setConfirmarSalida(2)}>
                Sí, continuar <Icon name="arrowRight" size={15} />
              </button>
            </>
          ) : (
            <>
              <button type="button" className="boton boton--secundario" onClick={() => setConfirmarSalida(1)}>
                Volver
              </button>
              <button
                type="button"
                className="boton boton--peligro"
                onClick={() => {
                  setConfirmarSalida(0)
                  cerrarSesion()
                }}
              >
                <Icon name="logout" size={15} />
                {confirmarSalida === 2 ? 'Cerrar sesión definitivamente' : 'Cerrar sesión'}
              </button>
            </>
          )
        }
      >
        <div className="confirmar-salida">
          <span className="confirmar-salida__icono">
            <Icon name={confirmarSalida === 1 ? 'logout' : 'alert'} size={26} />
          </span>
          <div>
            <strong>{confirmarSalida === 1 ? '¿Quieres cerrar tu sesión ahora?' : '¿Confirmas que deseas salir?'}</strong>
            <p>
              {confirmarSalida === 1
                ? 'Puedes volver cuando quieras con tu correo y contraseña.'
                : 'Si cierras ahora, tendrás que iniciar sesión de nuevo para continuar.'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
