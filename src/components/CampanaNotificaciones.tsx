import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificacionesApi } from '../services/api'
import type { Notificacion } from '../types'
import { hace } from '../utils/format'
import { Icon } from './Icon'
import { RiesgoBadge } from './Ui'

export function CampanaNotificaciones() {
  const [abierto, setAbierto] = useState(false)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(true)
  const contenedor = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        const datos = await notificacionesApi.listar()
        if (activo) setNotificaciones(datos)
      } catch {
        // La campanita no debe romper la navegación si el backend se cae.
      } finally {
        if (activo) setCargando(false)
      }
    }
    void cargar()
    const intervalo = window.setInterval(cargar, 30_000)
    return () => {
      activo = false
      window.clearInterval(intervalo)
    }
  }, [])

  useEffect(() => {
    if (!abierto) return
    const alClicFuera = (evento: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(evento.target as Node)) setAbierto(false)
    }
    const alEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    document.addEventListener('keydown', alEscape)
    return () => {
      document.removeEventListener('mousedown', alClicFuera)
      document.removeEventListener('keydown', alEscape)
    }
  }, [abierto])

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  const abrirNotificacion = async (notificacion: Notificacion) => {
    if (!notificacion.leida) {
      setNotificaciones((actuales) =>
        actuales.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n)),
      )
      try {
        await notificacionesApi.marcarLeida(notificacion.id)
      } catch {
        // Si falla, se corrige en el siguiente refresco.
      }
    }
    setAbierto(false)
    navigate(`/estudiantes/${notificacion.estudianteId}`)
  }

  const marcarTodas = async () => {
    setNotificaciones((actuales) => actuales.map((n) => ({ ...n, leida: true })))
    try {
      await notificacionesApi.marcarTodas()
    } catch {
      // El siguiente refresco restaura el estado real.
    }
  }

  return (
    <div className="campana" ref={contenedor}>
      <button
        type="button"
        className={`boton-icono boton-icono--campana${abierto ? ' activo' : ''}`}
        onClick={() => setAbierto((valor) => !valor)}
        aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ''}`}
        aria-expanded={abierto}
      >
        <Icon name="bell" size={20} />
        {noLeidas > 0 && <span className="campana__contador">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </button>

      {abierto && (
        <div className="campana__panel">
          <header className="campana__cabecera">
            <div>
              <h3>Alertas de permanencia</h3>
              <p>{noLeidas > 0 ? `${noLeidas} sin leer` : 'Todo al día'}</p>
            </div>
            {noLeidas > 0 && (
              <button type="button" className="boton-texto" onClick={marcarTodas}>
                Marcar todas
              </button>
            )}
          </header>

          <div className="campana__lista">
            {cargando ? (
              <p className="campana__vacia">Cargando alertas…</p>
            ) : notificaciones.length === 0 ? (
              <div className="campana__vacia">
                <Icon name="check" size={22} />
                <span>No hay alertas pendientes.</span>
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <article
                  key={notificacion.id}
                  className={`alerta${notificacion.leida ? ' alerta--leida' : ''}`}
                  onClick={() => void abrirNotificacion(notificacion)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(evento) => {
                    if (evento.key === 'Enter') void abrirNotificacion(notificacion)
                  }}
                >
                  <span className="alerta__icono">
                    <Icon name="alert" size={17} />
                  </span>
                  <div className="alerta__contenido">
                    <div className="alerta__fila">
                      <strong>{notificacion.nombre}</strong>
                      <RiesgoBadge riesgo={notificacion.riesgo} compacto />
                    </div>
                    <p>{notificacion.motivo}</p>
                    <div className="alerta__meta">
                      <span>{notificacion.carrera} · {notificacion.semestre}°</span>
                      <span>{hace(notificacion.fecha)}</span>
                    </div>
                    <a
                      className="alerta__cita"
                      href={notificacion.linkCita}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(evento) => evento.stopPropagation()}
                    >
                      <Icon name="calendar" size={13} /> Agendar cita
                    </a>
                  </div>
                  {!notificacion.leida && <span className="alerta__no-leida" />}
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
