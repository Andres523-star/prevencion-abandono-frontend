import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Icon, type IconName } from '../components/Icon'
import { Cargando, Vacio } from '../components/Ui'
import { acompanamientoApi, mensajeError } from '../services/api'
import type { AccionAcompanamiento } from '../types'
import { fechaCorta } from '../utils/format'

const ESTADOS: Record<
  AccionAcompanamiento['estado'],
  { etiqueta: string; icono: IconName; clase: string }
> = {
  CUMPLIDO: { etiqueta: 'Cumplido', icono: 'check', clase: 'cumplido' },
  NO_ASISTIO: { etiqueta: 'No asistió', icono: 'close', clase: 'no_asistio' },
  PENDIENTE: { etiqueta: 'Próximo', icono: 'clock', clase: 'pendiente' },
}

function comoFecha(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

/** Línea de tiempo personal del estudiante: acciones pasadas y próximas citas. */
export function Historial() {
  const { sesion } = useAuth()
  const estudianteId = sesion?.estudianteId ?? null
  const [acciones, setAcciones] = useState<AccionAcompanamiento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (estudianteId === null) {
      setCargando(false)
      return undefined
    }
    let vigente = true
    acompanamientoApi
      .listar(estudianteId)
      .then((datos) => {
        if (vigente) setAcciones(datos)
      })
      .catch((err) => {
        if (vigente) setError(mensajeError(err))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [estudianteId])

  const { proximas, pasadas, cumplidas, noAsistio } = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const esProxima = (accion: AccionAcompanamiento) =>
      accion.estado === 'PENDIENTE' || comoFecha(accion.fecha) >= hoy
    return {
      proximas: acciones
        .filter(esProxima)
        .sort((a, b) => comoFecha(a.fecha).getTime() - comoFecha(b.fecha).getTime()),
      pasadas: acciones
        .filter((accion) => !esProxima(accion))
        .sort((a, b) => comoFecha(b.fecha).getTime() - comoFecha(a.fecha).getTime()),
      cumplidas: acciones.filter((accion) => accion.estado === 'CUMPLIDO').length,
      noAsistio: acciones.filter((accion) => accion.estado === 'NO_ASISTIO').length,
    }
  }, [acciones])

  const porAnio = useMemo(() => {
    const grupos = new Map<string, AccionAcompanamiento[]>()
    for (const accion of pasadas) {
      const anio = accion.fecha.slice(0, 4)
      const lista = grupos.get(anio) ?? []
      lista.push(accion)
      grupos.set(anio, lista)
    }
    return [...grupos.entries()]
  }, [pasadas])

  if (cargando) return <Cargando texto="Cargando tu historial de acompañamiento…" />

  if (error) {
    return (
      <Vacio icono="alert" titulo="No pudimos cargar tu historial" texto={error} />
    )
  }

  return (
    <div className="pagina pagina--historial">
      <section className="historial-hero">
        <div>
          <span className="bienvenida__saludo">Tu proceso, paso a paso</span>
          <h2>Todo lo que has hecho y lo que viene</h2>
          <p>
            Aquí queda registrado el acompañamiento con tu profesor y el equipo de bienestar.
            Cada cita, taller y llamada hace parte de tu historia en la universidad.
          </p>
        </div>
        <div className="historial-hero__resumen">
          <div>
            <strong>{cumplidas}</strong>
            <span>acciones cumplidas</span>
          </div>
          <div>
            <strong>{proximas.length}</strong>
            <span>próximas citas</span>
          </div>
          <div>
            <strong>{noAsistio}</strong>
            <span>inasistencias</span>
          </div>
        </div>
      </section>

      {proximas.length > 0 && (
        <article className="panel panel--proximas">
          <header className="panel__cabecera">
            <div>
              <h3>Lo que viene</h3>
              <p>Tus próximos encuentros y seguimientos.</p>
            </div>
            <span className="panel__etiqueta">{proximas.length} pendientes</span>
          </header>
          <div className="historial historial--proximas">
            {proximas.map((accion) => (
              <div key={accion.id} className="historial__item historial__item--pendiente">
                <span className="historial__punto" aria-hidden="true" />
                <div className="historial__contenido">
                  <div className="historial__fila">
                    <strong>{accion.titulo}</strong>
                    <span>{fechaCorta(accion.fecha)}</span>
                  </div>
                  <p>{accion.descripcion}</p>
                  <small>{accion.responsable}</small>
                  <span className="historial__pendiente">Pendiente</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      )}

      <article className="panel">
        <header className="panel__cabecera">
          <div>
            <h3>Lo que ya pasó</h3>
            <p>Más de un año de acompañamiento, ordenado del más reciente al más antiguo.</p>
          </div>
          <span className="panel__etiqueta">{pasadas.length} registros</span>
        </header>

        {pasadas.length === 0 ? (
          <p className="historial__vacio">Aún no hay acciones pasadas registradas.</p>
        ) : (
          porAnio.map(([anio, lista]) => (
            <section key={anio} className="historial-anio">
              <h4 className="historial-anio__titulo">{anio}</h4>
              <div className="historial">
                {lista.map((accion) => {
                  const estado = ESTADOS[accion.estado]
                  return (
                    <div
                      key={accion.id}
                      className={`historial__item historial__item--${estado.clase}`}
                    >
                      <span className="historial__punto" aria-hidden="true" />
                      <div className="historial__contenido">
                        <div className="historial__fila">
                          <strong>{accion.titulo}</strong>
                          <span>{fechaCorta(accion.fecha)}</span>
                        </div>
                        <p>{accion.descripcion}</p>
                        <small>{accion.responsable}</small>
                        <span className={`historial__marca historial__marca--${estado.clase}`}>
                          <Icon name={estado.icono} size={13} /> {estado.etiqueta}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </article>

      <section className="insight">
        <span className="insight__icono"><Icon name="sparkles" size={22} /></span>
        <div className="insight__texto">
          <span className="insight__etiqueta">Tu recorrido</span>
          <p>
            Empezaste con varios retos y hoy tu proceso muestra avances. Sigue asistiendo a tus
            citas y habla con tu profesor cuando algo se complique: pedir ayuda a tiempo también
            es una forma de avanzar.
          </p>
        </div>
      </section>
    </div>
  )
}
