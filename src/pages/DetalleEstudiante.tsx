import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { Avatar, BarraProgreso, Cargando, EstadoBadge, RiesgoBadge, Vacio } from '../components/Ui'
import { analisisApi, acompanamientoApi, descargasApi, estudiantesApi, mensajeError } from '../services/api'
import type { AccionAcompanamiento, Analisis, Estudiante } from '../types'
import {
  COLOR_CATEGORIA,
  COLOR_RIESGO,
  enlaceCita,
  fechaCorta,
  ICONO_CATEGORIA,
  nombreCompleto,
} from '../utils/format'

function colorNota(nota: number): string {
  if (nota < 3) return COLOR_RIESGO.ALTO
  if (nota < 3.8) return COLOR_RIESGO.MEDIO
  return COLOR_RIESGO.BAJO
}

function MedidorRiesgo({ score, color }: { score: number; color: string }) {
  const radio = 52
  const circunferencia = 2 * Math.PI * radio
  const progreso = Math.max(0, Math.min(100, score))
  return (
    <div className="medidor">
      <svg viewBox="0 0 120 120" className="medidor__svg" aria-hidden="true">
        <circle cx="60" cy="60" r={radio} fill="none" stroke="#edf1ec" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - progreso / 100)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="medidor__centro">
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  )
}

export function DetalleEstudiante() {
  const { id } = useParams()
  const { mostrarToast } = useToast()
  const estudianteId = Number(id)
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [analisis, setAnalisis] = useState<Analisis | null>(null)
  const [analizando, setAnalizando] = useState(false)
  const [errorAnalisis, setErrorAnalisis] = useState('')
  const [acciones, setAcciones] = useState<AccionAcompanamiento[]>([])
  const [errorHistorial, setErrorHistorial] = useState('')
  const [guardandoAccion, setGuardandoAccion] = useState<number | null>(null)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setCargando(true)
      setError('')
      setAnalisis(null)
      try {
        const datos = await estudiantesApi.obtener(estudianteId)
        if (activo) setEstudiante(datos)
      } catch (err) {
        if (activo) setError(mensajeError(err))
      } finally {
        if (activo) setCargando(false)
      }
    }
    if (Number.isFinite(estudianteId)) void cargar()
    else {
      setError('El estudiante no existe.')
      setCargando(false)
    }
    return () => {
      activo = false
    }
  }, [estudianteId])

  useEffect(() => {
    let activo = true
    if (!Number.isFinite(estudianteId)) return undefined
    acompanamientoApi
      .listar(estudianteId)
      .then((datos) => {
        if (activo) setAcciones(datos)
      })
      .catch((err) => {
        if (activo) setErrorHistorial(mensajeError(err))
      })
    return () => {
      activo = false
    }
  }, [estudianteId])

  const cambiarEstado = async (
    accion: AccionAcompanamiento,
    estado: AccionAcompanamiento['estado'],
  ) => {
    setGuardandoAccion(accion.id)
    try {
      const actualizada = await acompanamientoApi.actualizar(estudianteId, accion.id, estado)
      setAcciones((actuales) =>
        actuales.map((item) => (item.id === actualizada.id ? actualizada : item)),
      )
      mostrarToast(
        estado === 'CUMPLIDO' ? 'Acción marcada como cumplida.' : 'Acción marcada como no asistió.',
        estado === 'CUMPLIDO' ? 'exito' : 'info',
      )
    } catch (err) {
      mostrarToast(mensajeError(err), 'error')
    } finally {
      setGuardandoAccion(null)
    }
  }

  const generarAnalisis = async () => {
    if (!estudiante) return
    setAnalizando(true)
    setErrorAnalisis('')
    try {
      const resultado = await analisisApi.analizar(estudiante.id)
      setAnalisis(resultado)
      mostrarToast('Plan de acción generado.', 'exito')
    } catch (err) {
      setErrorAnalisis(mensajeError(err))
    } finally {
      setAnalizando(false)
    }
  }

  const descargar = async (tipo: 'html' | 'csv' | 'zip') => {
    if (!estudiante) return
    try {
      if (tipo === 'html') await descargasApi.fichaHtml(estudiante.id)
      else if (tipo === 'csv') await descargasApi.fichaCsv(estudiante.id)
      else
        await descargasApi.todo({
          carrera: estudiante.carrera,
          sede: estudiante.sede,
          semestre: estudiante.semestre,
          grupo: estudiante.grupo,
        })
      mostrarToast('La descarga está lista.')
    } catch (err) {
      mostrarToast(mensajeError(err), 'error')
    }
  }

  if (cargando) return <Cargando texto="Cargando la ficha del estudiante…" />

  if (error || !estudiante) {
    return (
      <Vacio icono="alert" titulo="No pudimos abrir esta ficha" texto={error}>
        <Link to="/" className="boton boton--primario">
          <Icon name="arrowLeft" size={16} /> Volver a estudiantes
        </Link>
      </Vacio>
    )
  }

  const color = COLOR_RIESGO[estudiante.riesgoActual]
  const colorCausa = COLOR_CATEGORIA[estudiante.categoria] ?? '#145c4e'
  const datosHistorial = estudiante.historialRiesgo.map((valor, indice) => ({
    corte: `Corte ${indice + 1}`,
    valor,
  }))
  const iconoCausa = ICONO_CATEGORIA[estudiante.categoria] ?? 'activity'
  const cita = enlaceCita(estudiante)

  return (
    <div className="pagina pagina--detalle">
      <Link to="/" className="volver">
        <Icon name="arrowLeft" size={16} /> Volver al directorio
      </Link>

      <section className="ficha-hero" style={{ borderTopColor: color }}>
        <div className="ficha-hero__persona">
          <Avatar
            nombre={estudiante.nombre}
            apellido={estudiante.apellido}
            tamano="xl"
            riesgo={estudiante.riesgoActual}
          />
          <div>
            <div className="ficha-hero__etiquetas">
              <RiesgoBadge riesgo={estudiante.riesgoActual} />
              <EstadoBadge estado={estudiante.estado} />
              <span className="chip-causa" style={{ background: `${colorCausa}12`, color: colorCausa }}>
                <Icon name={iconoCausa} size={14} /> {estudiante.categoria}
              </span>
            </div>
            <h2>{nombreCompleto(estudiante)}</h2>
            <p>
              {estudiante.carrera} · {estudiante.semestre}° semestre · Grupo {estudiante.grupo} ·{' '}
              {estudiante.sede} · {estudiante.facultad} · Ingreso {fechaCorta(estudiante.fechaIngreso)}
            </p>
            <div className="ficha-hero__acciones">
              <Link to={`/chat/${estudiante.id}`} className="boton boton--primario">
                <Icon name="chat" size={17} /> Abrir conversación
              </Link>
              <a href={cita} target="_blank" rel="noreferrer" className="boton boton--secundario">
                <Icon name="calendar" size={17} /> Agendar cita
              </a>
              <a href={`mailto:${estudiante.email}`} className="boton boton--secundario">
                <Icon name="mail" size={17} /> Escribir correo
              </a>
              <button type="button" className="boton boton--secundario" onClick={() => void descargar('html')}>
                <Icon name="download" size={17} /> Descargar ficha
              </button>
              <button type="button" className="boton boton--secundario" onClick={() => void descargar('csv')}>
                <Icon name="download" size={17} /> Descargar CSV
              </button>
              <button type="button" className="boton boton--secundario" onClick={() => void descargar('zip')}>
                <Icon name="download" size={17} /> Descargar su grupo (.zip)
              </button>
            </div>
          </div>
        </div>

        <div className="ficha-hero__riesgo">
          <MedidorRiesgo score={estudiante.riesgoScore} color={color} />
          <div>
            <span>Nivel de riesgo</span>
            <strong style={{ color }}>{estudiante.riesgoActual}</strong>
            <small>Promedio {estudiante.promedio.toFixed(1)} · {estudiante.faltas} faltas</small>
          </div>
        </div>
      </section>

      <div className="detalle-grid">
        <div className="detalle-columna">
          <article className="panel">
            <header className="panel__cabecera">
              <div>
                <h3>Contexto del caso</h3>
                <p>La historia detrás de la alerta de permanencia.</p>
              </div>
              <span className="panel__etiqueta">Registro docente</span>
            </header>
            <blockquote className="contexto" style={{ borderLeftColor: colorCausa }}>
              {estudiante.razon}
            </blockquote>
            <div className="datos-grid">
              <div className="dato">
                <span className="dato__icono"><Icon name="user" size={16} /></span>
                <div><span>Cédula</span><strong>{estudiante.cedula}</strong></div>
              </div>
              <div className="dato">
                <span className="dato__icono"><Icon name="mail" size={16} /></span>
                <div><span>Correo</span><strong>{estudiante.email}</strong></div>
              </div>
              <div className="dato">
                <span className="dato__icono"><Icon name="phone" size={16} /></span>
                <div><span>Teléfono</span><strong>{estudiante.telefono || 'No registrado'}</strong></div>
              </div>
              <div className="dato">
                <span className="dato__icono"><Icon name="calendar" size={16} /></span>
                <div><span>Fecha de ingreso</span><strong>{fechaCorta(estudiante.fechaIngreso)}</strong></div>
              </div>
            </div>
          </article>

          <article className="panel">
            <header className="panel__cabecera">
              <div>
                <h3>Materias del semestre</h3>
                <p>Notas del último corte reportado.</p>
              </div>
              <span className="panel__etiqueta">{estudiante.semestre}° semestre</span>
            </header>
            <div className="materias">
              {estudiante.materias.map((materia) => (
                <div key={materia.nombre} className="materia">
                  <div className="materia__fila">
                    <span>
                      {materia.nombre}
                      {materia.homologada && (
                        <span className="chip-causa chip-causa--suave chip-causa--mini">Homologada</span>
                      )}
                    </span>
                    <strong style={{ color: colorNota(materia.nota) }}>{materia.nota.toFixed(1)}</strong>
                  </div>
                  <BarraProgreso
                    valor={materia.nota}
                    color={colorNota(materia.nota)}
                    etiqueta={`Nota de ${materia.nombre}: ${materia.nota}`}
                  />
                  <small className="materia__detalle">
                    {materia.semestre}.º · Grupo {materia.grupo} · {materia.faltas} faltas ·{' '}
                    {materia.faltasJustificadas} justificadas
                  </small>
                </div>
              ))}
              <div className="materias__pie">
                <span><Icon name="book" size={15} /> Promedio general</span>
                <strong>{estudiante.promedio.toFixed(1)} / 5.0</strong>
              </div>
            </div>
          </article>

          <article className="panel">
            <header className="panel__cabecera">
              <div>
                <h3>Evolución del riesgo</h3>
                <p>Puntaje calculado en los últimos cortes académicos.</p>
              </div>
              <span className="panel__etiqueta">0 a 100</span>
            </header>
            <div className="grafica grafica--historial">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosHistorial} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradiente-riesgo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#edf1ec" />
                  <XAxis dataKey="corte" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#63746c' }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#63746c' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8e2',
                      boxShadow: '0 12px 30px rgba(16, 43, 36, 0.12)',
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    name="Puntaje de riesgo"
                    stroke={color}
                    strokeWidth={2.5}
                    fill="url(#gradiente-riesgo)"
                    dot={{ r: 3, fill: color, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel">
            <header className="panel__cabecera">
              <div>
                <h3>Historial de acompañamiento</h3>
                <p>La historia de las acciones realizadas con este estudiante.</p>
              </div>
              <span className="panel__etiqueta">
                {acciones.filter((accion) => accion.estado === 'CUMPLIDO').length} cumplidas
              </span>
            </header>

            {errorHistorial && (
              <p className="mensaje-error" role="alert">
                <Icon name="alert" size={16} /> {errorHistorial}
              </p>
            )}

            {!errorHistorial && acciones.length === 0 && (
              <p className="historial__vacio">Aún no hay acciones registradas.</p>
            )}

            <div className="historial">
              {acciones.map((accion) => (
                <div
                  key={accion.id}
                  className={`historial__item historial__item--${accion.estado.toLowerCase()}`}
                >
                  <span className="historial__punto" aria-hidden="true" />
                  <div className="historial__contenido">
                    <div className="historial__fila">
                      <strong>{accion.titulo}</strong>
                      <span>{fechaCorta(accion.fecha)}</span>
                    </div>
                    <p>{accion.descripcion}</p>
                    <small>{accion.responsable}</small>
                    <div className="historial__acciones">
                      <button
                        type="button"
                        className={`historial__toggle${
                          accion.estado === 'CUMPLIDO' ? ' historial__toggle--activo-ok' : ''
                        }`}
                        onClick={() => void cambiarEstado(accion, 'CUMPLIDO')}
                        disabled={guardandoAccion === accion.id}
                      >
                        <Icon name="check" size={14} /> Cumplido
                      </button>
                      <button
                        type="button"
                        className={`historial__toggle${
                          accion.estado === 'NO_ASISTIO' ? ' historial__toggle--activo-no' : ''
                        }`}
                        onClick={() => void cambiarEstado(accion, 'NO_ASISTIO')}
                        disabled={guardandoAccion === accion.id}
                      >
                        <Icon name="close" size={14} /> No asistió
                      </button>
                      {accion.estado === 'PENDIENTE' && (
                        <span className="historial__pendiente">Pendiente</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="detalle-columna detalle-columna--lateral">
          <article className="plan-ia">
            <header className="plan-ia__cabecera">
              <span className="plan-ia__icono"><Icon name="sparkles" size={20} /></span>
              <div>
                <h3>Plan de acción con IA</h3>
                <p>Una ruta concreta para acompañar este caso.</p>
              </div>
            </header>

            {!analisis && !analizando && (
              <div className="plan-ia__inicio">
                <p>
                  Genera una recomendación a partir del riesgo, el promedio, las faltas y la causa
                  registrada. El análisis usa solo datos académicos.
                </p>
                <ul className="plan-ia__pistas">
                  <li><Icon name="check" size={14} /> Recomendación redactada</li>
                  <li><Icon name="check" size={14} /> Acciones priorizadas</li>
                  <li><Icon name="check" size={14} /> Fuente y fecha del análisis</li>
                </ul>
                <button type="button" className="boton boton--primario boton--bloque" onClick={() => void generarAnalisis()}>
                  <Icon name="sparkles" size={17} /> Generar plan con IA
                </button>
                {errorAnalisis && (
                  <p className="mensaje-error" role="alert">
                    <Icon name="alert" size={16} /> {errorAnalisis}
                  </p>
                )}
              </div>
            )}

            {analizando && (
              <div className="plan-ia__cargando">
                <span className="cargando__spinner" />
                <p>Analizando el caso y preparando recomendaciones…</p>
              </div>
            )}

            {analisis && !analizando && (
              <div className="plan-ia__resultado">
                <div className="plan-ia__recomendacion">
                  <span className="plan-ia__etiqueta">Recomendación</span>
                  <p>{analisis.recomendacion}</p>
                </div>
                <div className="plan-ia__acciones">
                  <h4>Pasos sugeridos</h4>
                  <ol>
                    {analisis.acciones.map((accion, indice) => (
                      <li key={accion}>
                        <span>{indice + 1}</span>
                        <p>{accion}</p>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="plan-ia__fuente">
                  <span><Icon name="shield" size={14} /> {analisis.fuente}</span>
                  <span>{analisis.fecha}</span>
                </div>
                <button
                  type="button"
                  className="boton boton--secundario boton--bloque"
                  onClick={() => void generarAnalisis()}
                >
                  <Icon name="refresh" size={16} /> Volver a analizar
                </button>
                {errorAnalisis && (
                  <p className="mensaje-error" role="alert">
                    <Icon name="alert" size={16} /> {errorAnalisis}
                  </p>
                )}
              </div>
            )}
          </article>

          <article className="panel contacto-rapido">
            <header className="panel__cabecera">
              <div>
                <h3>Contacto rápido</h3>
                <p>Da el primer paso hoy.</p>
              </div>
            </header>
            <a href={`tel:${estudiante.telefono}`} className="contacto-rapido__fila">
              <span><Icon name="phone" size={17} /></span>
              <div><strong>Llamar</strong><small>{estudiante.telefono || 'Sin teléfono'}</small></div>
              <Icon name="arrowRight" size={15} />
            </a>
            <a href={`mailto:${estudiante.email}`} className="contacto-rapido__fila">
              <span><Icon name="mail" size={17} /></span>
              <div><strong>Enviar correo</strong><small>{estudiante.email}</small></div>
              <Icon name="arrowRight" size={15} />
            </a>
            <Link to={`/chat/${estudiante.id}`} className="contacto-rapido__fila">
              <span><Icon name="chat" size={17} /></span>
              <div><strong>Abrir chat</strong><small>Conversación interna</small></div>
              <Icon name="arrowRight" size={15} />
            </Link>
          </article>
        </aside>
      </div>
    </div>
  )
}
