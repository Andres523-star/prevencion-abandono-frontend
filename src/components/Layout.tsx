import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CampanaNotificaciones } from './CampanaNotificaciones'
import { Icon, type IconName } from './Icon'
import { Avatar } from './Ui'

const NAVEGACION: Array<{ ruta: string; etiqueta: string; icono: IconName; fin?: boolean }> = [
  { ruta: '/', etiqueta: 'Panel', icono: 'panel', fin: true },
  { ruta: '/estudiantes', etiqueta: 'Estudiantes', icono: 'users' },
  { ruta: '/reportes', etiqueta: 'Estadísticas', icono: 'chart' },
  { ruta: '/chat', etiqueta: 'Acompañamiento', icono: 'chat' },
]

function tituloDeRuta(pathname: string): { titulo: string; subtitulo: string } {
  if (pathname === '/') {
    return { titulo: 'Panel de permanencia', subtitulo: 'Una mirada clara al pulso de tus estudiantes.' }
  }
  if (pathname.startsWith('/estudiantes/')) {
    return { titulo: 'Ficha del estudiante', subtitulo: 'Historial, contexto y plan de acompañamiento.' }
  }
  if (pathname.startsWith('/estudiantes')) {
    return { titulo: 'Estudiantes', subtitulo: 'Encuentra, filtra y prioriza los casos que necesitan atención.' }
  }
  if (pathname.startsWith('/reportes')) {
    return { titulo: 'Estadísticas', subtitulo: 'Los datos que ayudan a decidir dónde actuar primero.' }
  }
  if (pathname.startsWith('/chat')) {
    return { titulo: 'Acompañamiento', subtitulo: 'Conversaciones cercanas, en un solo lugar.' }
  }
  return { titulo: 'Permanencia', subtitulo: 'Acompañar a tiempo cambia historias.' }
}

export function Layout() {
  const { sesion, cerrarSesion } = useAuth()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [menuUsuario, setMenuUsuario] = useState(false)
  const referenciaMenu = useRef<HTMLDivElement>(null)
  const { titulo, subtitulo } = useMemo(() => tituloDeRuta(location.pathname), [location.pathname])

  useEffect(() => {
    if (!menuUsuario) return
    const alClicFuera = (evento: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(evento.target as Node)) {
        setMenuUsuario(false)
      }
    }
    const alEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuUsuario(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    document.addEventListener('keydown', alEscape)
    return () => {
      document.removeEventListener('mousedown', alClicFuera)
      document.removeEventListener('keydown', alEscape)
    }
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

  const rol = sesion.rol === 'COORDINADOR' ? 'Coordinación' : 'Docente'
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
          <strong>Facultad de Ciencias de la Salud y Derecho</strong>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          <span className="sidebar__seccion">Espacio de trabajo</span>
          {NAVEGACION.map((item) => (
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

        <div className="sidebar__nota">
          <Icon name="shield" size={18} />
          <p>
            <strong>Demo con datos ficticios.</strong> 600 estudiantes precargados para explorar la
            plataforma.
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
          <button
            type="button"
            className="boton-icono boton-icono--claro"
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <Icon name="logout" size={18} />
          </button>
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
            <CampanaNotificaciones />
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
                  <div className="menu-usuario__cabecera">
                    <Avatar nombre={sesion.nombre} apellido={sesion.apellido} tamano="sm" />
                    <div>
                      <strong>
                        {sesion.nombre} {sesion.apellido}
                      </strong>
                      <span>{sesion.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="menu-usuario__item"
                    role="menuitem"
                    onClick={cerrarSesion}
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
    </div>
  )
}
