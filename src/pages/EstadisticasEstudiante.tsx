import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../auth/AuthContext'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { Avatar, BarraProgreso, Cargando, EstadoBadge, Modal, RiesgoBadge, Vacio } from '../components/Ui'
import { descargasApi, justificacionesApi, mensajeError, perfilApi } from '../services/api'
import type { JustificacionNueva, NotaMateria, PerfilEstudiante, PeriodoAcademico } from '../types'
import { COLOR_RIESGO, fechaCorta } from '../utils/format'

const ESTILO_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #e2e8e2',
  boxShadow: '0 12px 30px rgba(16, 43, 36, 0.12)',
  fontSize: 12,
  padding: '8px 12px',
  background: '#ffffff',
}

const ESTILO_EJE = { fontSize: 12.5, fill: '#4f635a', fontWeight: 600 }
const ESTILO_ETIQUETA = { fontSize: 12, fontWeight: 800, fill: '#374a42' }

function colorNota(nota: number): string {
  if (nota < 3) return COLOR_RIESGO.ALTO
  if (nota < 3.8) return COLOR_RIESGO.MEDIO
  return COLOR_RIESGO.BAJO
}

interface RegistroMateria {
  materia: NotaMateria
  periodo: PeriodoAcademico
}

type PanelAmpliado = 'notas' | 'riesgo' | 'faltas' | null

function pendientes(materia: NotaMateria): number {
  return Math.max(0, materia.faltas - materia.faltasJustificadas)
}

/** Estadísticas personales del rol Estudiante, con detalle interactivo y justificación de faltas. */
export function EstadisticasEstudiante() {
  const { sesion } = useAuth()
  const { mostrarToast } = useToast()
  const estudianteId = sesion?.estudianteId ?? null
  const [perfil, setPerfil] = useState<PerfilEstudiante | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [detalle, setDetalle] = useState<PeriodoAcademico | null>(null)
  const [justificar, setJustificar] = useState<{ periodo: PeriodoAcademico; materia: NotaMateria } | null>(
    null,
  )
  const [correo, setCorreo] = useState('')
  const [recordatorio, setRecordatorio] = useState('Recuerda agregar la foto de evidencia.')
  const [enviando, setEnviando] = useState(false)
  const [materiaDetalle, setMateriaDetalle] = useState<{
    nombre: string
    registros: RegistroMateria[]
  } | null>(null)
  const [ampliada, setAmpliada] = useState<PanelAmpliado>(null)

  const cargar = () => {
    if (estudianteId === null) {
      setCargando(false)
      return Promise.resolve()
    }
    return perfilApi
      .obtener(estudianteId)
      .then((datos) => {
        setPerfil(datos)
        // Si el detalle está abierto, se refresca para que la falta justificada
        // aparezca de inmediato sin cerrar el modal.
        setDetalle((actual) =>
          actual ? datos.periodos.find((p) => p.periodo === actual.periodo) ?? actual : actual,
        )
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    let vigente = true
    if (estudianteId === null) {
      setCargando(false)
      return undefined
    }
    perfilApi
      .obtener(estudianteId)
      .then((datos) => {
        if (vigente) setPerfil(datos)
      })
      .catch((err) => {
        if (vigente) setError(mensajeError(err))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    justificacionesApi
      .correo()
      .then((datos) => {
        if (!vigente) return
        setCorreo(datos.correo)
        setRecordatorio(datos.recordatorio)
      })
      .catch(() => undefined)
    return () => {
      vigente = false
    }
  }, [estudianteId])

  if (cargando) return <Cargando texto="Preparando tus estadísticas…" />

  if (error || !perfil) {
    return (
      <Vacio icono="alert" titulo="No pudimos cargar tus estadísticas" texto={error}>
        <Link to="/historial" className="boton boton--secundario">
          <Icon name="clock" size={16} /> Ver mi historial
        </Link>
      </Vacio>
    )
  }

  const color = COLOR_RIESGO[perfil.riesgoActual]
  const mejoraPromedio = Math.round((perfil.actual.promedio - perfil.inicio.promedio) * 10) / 10
  const mejoraRiesgo = perfil.inicio.riesgoScore - perfil.actual.riesgoScore
  const datos = perfil.periodos.map((periodo) => ({
    periodo: periodo.periodo,
    promedio: periodo.promedio,
    riesgo: periodo.riesgoScore,
    faltas: periodo.faltas,
    justificadas: periodo.materias.reduce((total, materia) => total + materia.faltasJustificadas, 0),
  }))

  // Comparación por colores: cada barra toma el color de la nota y abre su período.
  const datosComparacion = [
    {
      nombre: 'Al inicio',
      periodo: perfil.inicio.periodo,
      promedio: perfil.inicio.promedio,
      color: colorNota(perfil.inicio.promedio),
    },
    {
      nombre: 'Hoy',
      periodo: perfil.actual.periodo,
      promedio: perfil.actual.promedio,
      color: colorNota(perfil.actual.promedio),
    },
  ]

  const datosMateria =
    materiaDetalle?.registros.map((registro) => ({
      periodo: registro.periodo.periodo,
      nota: registro.materia.nota,
      faltas: registro.materia.faltas,
      justificadas: registro.materia.faltasJustificadas,
    })) ?? []

  const abrirPorClave = (clave?: string) => {
    const encontrado = perfil.periodos.find((p) => p.periodo === clave)
    if (encontrado) setDetalle(encontrado)
  }

  const abrirMateria = (nombre: string) => {
    const registros: RegistroMateria[] = []
    perfil.periodos.forEach((periodo) => {
      const materia = periodo.materias.find((item) => item.nombre === nombre)
      if (materia) registros.push({ materia, periodo })
    })
    if (registros.length > 0) setMateriaDetalle({ nombre, registros })
  }

  const alternarAmpliada = (panel: Exclude<PanelAmpliado, null>) => {
    setAmpliada((actual) => (actual === panel ? null : panel))
  }

  const leerPunto = (estado: unknown): string | undefined => {
    const payload = (estado as { activePayload?: Array<{ payload?: { periodo?: string } }> })
      ?.activePayload
    return payload?.[0]?.payload?.periodo
  }

  const abrirJustificacion = (periodo: PeriodoAcademico, materia: NotaMateria) => {
    setJustificar({ periodo, materia })
  }

  const descargarFicha = async () => {
    try {
      await descargasApi.fichaHtml(perfil.estudianteId)
      mostrarToast('Descargamos tu historial en un documento imprimible.')
    } catch (err) {
      mostrarToast(mensajeError(err), 'error')
    }
  }

  const descargarNotas = async () => {
    try {
      await descargasApi.fichaCsv(perfil.estudianteId)
      mostrarToast('Descargamos tus notas y faltas en CSV.')
    } catch (err) {
      mostrarToast(mensajeError(err), 'error')
    }
  }

  return (
    <div className="pagina pagina--estudiante">
      <section className="estudiante-hero" style={{ borderTopColor: color }}>
        <div className="estudiante-hero__persona">
          <Avatar nombre={perfil.nombre} apellido={perfil.apellido} tamano="xl" riesgo={perfil.riesgoActual} />
          <div>
            <div className="ficha-hero__etiquetas">
              <RiesgoBadge riesgo={perfil.riesgoActual} />
              <EstadoBadge estado={perfil.estado} />
              <span className="chip-causa chip-causa--suave">
                <Icon name="cap" size={14} /> {perfil.carrera}
              </span>
              <span className="chip-causa chip-causa--suave">
                <Icon name="users" size={14} /> Grupo {perfil.grupo}
              </span>
            </div>
            <h2>{perfil.nombre} {perfil.apellido}</h2>
            <p>
              {perfil.carrera} · {perfil.semestre}° semestre · Grupo {perfil.grupo} · {perfil.sede} ·
              Ingreso {fechaCorta(perfil.fechaIngreso)}
            </p>
            <div className="ficha-hero__acciones">
              <Link to="/chat" className="boton boton--primario">
                <Icon name="chat" size={17} /> Hablar con mi profesor
              </Link>
              <Link to="/historial" className="boton boton--secundario">
                <Icon name="clock" size={17} /> Ver mi historial
              </Link>
              <button type="button" className="boton boton--secundario" onClick={descargarFicha}>
                <Icon name="download" size={17} /> Descargar mi historial
              </button>
              <button type="button" className="boton boton--secundario" onClick={descargarNotas}>
                <Icon name="download" size={17} /> Descargar notas y faltas
              </button>
            </div>
          </div>
        </div>
        <div className="estudiante-hero__medidor">
          <span>Promedio actual</span>
          <strong style={{ color }}>{perfil.promedioActual.toFixed(1)}</strong>
          <small>de 5.0 · {perfil.faltas} faltas acumuladas</small>
        </div>
      </section>

      <section className="cifras cifras--estudiante">
        <div className="cifra">
          <span className="cifra__icono cifra__icono--verde"><Icon name="trend" size={18} /></span>
          <div>
            <span>Mejora del promedio</span>
            <strong>{mejoraPromedio >= 0 ? '+' : ''}{mejoraPromedio.toFixed(1)}</strong>
          </div>
        </div>
        <div className="cifra">
          <span className="cifra__icono cifra__icono--rojo"><Icon name="activity" size={18} /></span>
          <div>
            <span>Riesgo actual</span>
            <strong>{perfil.riesgoActual}</strong>
          </div>
        </div>
        <div className="cifra">
          <span className="cifra__icono cifra__icono--azul"><Icon name="shield" size={18} /></span>
          <div>
            <span>Puntos de riesgo ganados</span>
            <strong>{mejoraRiesgo}</strong>
          </div>
        </div>
        <div className="cifra">
          <span className="cifra__icono cifra__icono--ambar"><Icon name="book" size={18} /></span>
          <div>
            <span>Períodos cursados</span>
            <strong>{perfil.periodos.length}</strong>
          </div>
        </div>
      </section>

      <article className="panel comparacion-personal">
        <header className="panel__cabecera">
          <div>
            <h3>Cómo empezaste y cómo estás hoy</h3>
            <p>Comparación por colores. Haz clic en un bloque o en una barra para ver ese período.</p>
          </div>
          <span className="panel__etiqueta">Inicio vs. actual</span>
        </header>
        <div className="comparacion-personal__cuerpo">
          <div className="comparacion-personal__grid">
            <button
              type="button"
              className="comparacion-personal__bloque comparacion-personal__bloque--clic"
              style={{ borderTopColor: COLOR_RIESGO[perfil.inicio.riesgo] }}
              onClick={() => abrirPorClave(perfil.inicio.periodo)}
              title={`Ver el detalle de ${perfil.inicio.periodo}`}
            >
              <span className="comparacion-personal__etiqueta">Al inicio</span>
              <strong>{perfil.inicio.periodo}</strong>
              <div className="comparacion-personal__dato">
                <span>Promedio</span>
                <b style={{ color: colorNota(perfil.inicio.promedio) }}>
                  {perfil.inicio.promedio.toFixed(1)}
                </b>
              </div>
              <div className="comparacion-personal__dato">
                <span>Riesgo</span>
                <RiesgoBadge riesgo={perfil.inicio.riesgo} compacto />
              </div>
              <div className="comparacion-personal__dato">
                <span>Faltas</span>
                <b>{perfil.inicio.faltas}</b>
              </div>
              <span className="comparacion-personal__pista">
                Ver período <Icon name="arrowRight" size={12} />
              </span>
            </button>

            <div className="comparacion-personal__flecha" aria-hidden="true">
              <Icon name="arrowRight" size={26} />
              <span>{mejoraPromedio >= 0 ? 'Mejoraste' : 'Nuevo reto'}</span>
            </div>

            <button
              type="button"
              className="comparacion-personal__bloque comparacion-personal__bloque--actual comparacion-personal__bloque--clic"
              style={{ borderTopColor: COLOR_RIESGO[perfil.actual.riesgo] }}
              onClick={() => abrirPorClave(perfil.actual.periodo)}
              title={`Ver el detalle de ${perfil.actual.periodo}`}
            >
              <span className="comparacion-personal__etiqueta">Hoy</span>
              <strong>{perfil.actual.periodo}</strong>
              <div className="comparacion-personal__dato">
                <span>Promedio</span>
                <b style={{ color: colorNota(perfil.actual.promedio) }}>
                  {perfil.actual.promedio.toFixed(1)}
                </b>
              </div>
              <div className="comparacion-personal__dato">
                <span>Riesgo</span>
                <RiesgoBadge riesgo={perfil.actual.riesgo} compacto />
              </div>
              <div className="comparacion-personal__dato">
                <span>Faltas</span>
                <b>{perfil.actual.faltas}</b>
              </div>
              <span className="comparacion-personal__pista">
                Ver período <Icon name="arrowRight" size={12} />
              </span>
            </button>
          </div>

          <div className="comparacion-personal__grafica">
            <div className="grafica grafica--comparacion">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosComparacion}
                  margin={{ top: 24, right: 12, left: -16, bottom: 0 }}
                  barSize={44}
                  onClick={(estado) => {
                    const payload = (
                      estado as { activePayload?: Array<{ payload?: { periodo?: string } }> }
                    )?.activePayload?.[0]?.payload
                    abrirPorClave(payload?.periodo)
                  }}
                >
                  <CartesianGrid vertical={false} stroke="#edf1ec" />
                  <XAxis dataKey="nombre" tickLine={false} axisLine={false} tick={ESTILO_EJE} />
                  <YAxis domain={[0, 5]} tickLine={false} axisLine={false} tick={ESTILO_EJE} />
                  <Tooltip
                    contentStyle={ESTILO_TOOLTIP}
                    cursor={{ fill: 'rgba(20, 92, 78, 0.04)' }}
                    formatter={(valor) => [`${Number(valor).toFixed(1)} / 5.0`, 'Promedio']}
                  />
                  <Bar dataKey="promedio" name="Promedio" radius={[10, 10, 0, 0]} style={{ cursor: 'pointer' }}>
                    {datosComparacion.map((dato) => (
                      <Cell key={dato.nombre} fill={dato.color} />
                    ))}
                    <LabelList
                      dataKey="promedio"
                      position="top"
                      formatter={(valor) => Number(valor).toFixed(1)}
                      style={ESTILO_ETIQUETA}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="comparacion-personal__leyenda">
              <span><i style={{ background: COLOR_RIESGO.BAJO }} /> Bien</span>
              <span><i style={{ background: COLOR_RIESGO.MEDIO }} /> En alerta</span>
              <span><i style={{ background: COLOR_RIESGO.ALTO }} /> En riesgo</span>
            </p>
          </div>
        </div>
        <p className="comparacion-personal__lectura">{perfil.lectura}</p>
      </article>

      <div className="panel-grid">
        <article className={`panel${ampliada === 'notas' ? ' panel--ampliado' : ''}`}>
          <header className="panel__cabecera">
            <div>
              <h3>Evolución de tus notas</h3>
              <p>Haz clic en un punto para ver todas las notas de ese período.</p>
            </div>
            <div className="panel__acciones">
              <span className="panel__etiqueta">Series por período</span>
              <button
                type="button"
                className="enlace-sutil"
                onClick={() => alternarAmpliada('notas')}
                aria-pressed={ampliada === 'notas'}
              >
                <Icon name={ampliada === 'notas' ? 'close' : 'eye'} size={14} />
                {ampliada === 'notas' ? 'Reducir' : 'Ampliar'}
              </button>
            </div>
          </header>
          <div className={`grafica grafica--estudiante${ampliada === 'notas' ? ' grafica--estudiante-ampliada' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={datos}
                margin={{ top: 18, right: 18, left: 0, bottom: 0 }}
                onClick={(estado) => abrirPorClave(leerPunto(estado))}
              >
                <CartesianGrid vertical={false} stroke="#edf1ec" />
                <XAxis dataKey="periodo" tickLine={false} axisLine={false} tick={ESTILO_EJE} />
                <YAxis
                  domain={[0, 5]}
                  tickLine={false}
                  axisLine={false}
                  tick={ESTILO_EJE}
                  width={42}
                  tickFormatter={(valor) => Number(valor).toFixed(1)}
                />
                <Tooltip
                  contentStyle={ESTILO_TOOLTIP}
                  formatter={(valor) => [`${Number(valor).toFixed(1)} / 5.0`, 'Promedio']}
                />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  name="Promedio"
                  stroke="#145c4e"
                  strokeWidth={2.8}
                  dot={{ r: 5, fill: '#145c4e', strokeWidth: 0, cursor: 'pointer' }}
                  activeDot={{ r: 8, cursor: 'pointer' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="grafica__pista">
            <Icon name="eye" size={13} /> Clic en cualquier punto para abrir el detalle del período.
          </p>
        </article>

        <article className={`panel${ampliada === 'riesgo' ? ' panel--ampliado' : ''}`}>
          <header className="panel__cabecera">
            <div>
              <h3>Tu nivel de riesgo</h3>
              <p>Cuanto más baja la línea, mejor es tu situación. Clic en un punto para ver fechas y notas.</p>
            </div>
            <div className="panel__acciones">
              <LeyendaPersonal />
              <button
                type="button"
                className="enlace-sutil"
                onClick={() => alternarAmpliada('riesgo')}
                aria-pressed={ampliada === 'riesgo'}
              >
                <Icon name={ampliada === 'riesgo' ? 'close' : 'eye'} size={14} />
                {ampliada === 'riesgo' ? 'Reducir' : 'Ampliar'}
              </button>
            </div>
          </header>
          <div className={`grafica grafica--estudiante${ampliada === 'riesgo' ? ' grafica--estudiante-ampliada' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={datos}
                margin={{ top: 18, right: 18, left: 0, bottom: 0 }}
                onClick={(estado) => abrirPorClave(leerPunto(estado))}
              >
                <defs>
                  <linearGradient id="gradiente-personal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9553f" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#d9553f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf1ec" />
                <XAxis dataKey="periodo" tickLine={false} axisLine={false} tick={ESTILO_EJE} />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={ESTILO_EJE}
                  width={42}
                />
                <Tooltip
                  contentStyle={ESTILO_TOOLTIP}
                  formatter={(valor) => {
                    const puntaje = Number(valor)
                    const nivel = puntaje >= 70 ? 'Alto' : puntaje >= 40 ? 'Medio' : 'Bajo'
                    return [`${puntaje}/100 · ${nivel}`, 'Puntaje de riesgo']
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="riesgo"
                  name="Puntaje de riesgo"
                  stroke="#d9553f"
                  strokeWidth={2.6}
                  fill="url(#gradiente-personal)"
                  dot={{ r: 5, fill: '#d9553f', strokeWidth: 0, cursor: 'pointer' }}
                  activeDot={{ r: 8, cursor: 'pointer' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="riesgo-escala">
            <span><i style={{ background: COLOR_RIESGO.ALTO }} /> Alto</span>
            <span><i style={{ background: COLOR_RIESGO.MEDIO }} /> Medio</span>
            <span><i style={{ background: COLOR_RIESGO.BAJO }} /> Bajo</span>
          </div>
          <p className="grafica__pista">
            <Icon name="eye" size={13} /> Clic en cualquier punto para abrir el detalle del período.
          </p>
        </article>
      </div>

      <article className={`panel${ampliada === 'faltas' ? ' panel--ampliado' : ''}`}>
        <header className="panel__cabecera">
          <div>
            <h3>Tus faltas por período</h3>
            <p>Compara las faltas reportadas con las que ya justificaste. Clic en un punto para ver el detalle.</p>
          </div>
          <div className="panel__acciones">
            <span className="panel__etiqueta">Faltas y justificadas</span>
            <button
              type="button"
              className="enlace-sutil"
              onClick={() => alternarAmpliada('faltas')}
              aria-pressed={ampliada === 'faltas'}
            >
              <Icon name={ampliada === 'faltas' ? 'close' : 'eye'} size={14} />
              {ampliada === 'faltas' ? 'Reducir' : 'Ampliar'}
            </button>
          </div>
        </header>
        <div className={`grafica grafica--estudiante${ampliada === 'faltas' ? ' grafica--estudiante-ampliada' : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={datos}
              margin={{ top: 18, right: 18, left: 0, bottom: 0 }}
              onClick={(estado) => abrirPorClave(leerPunto(estado))}
            >
              <CartesianGrid vertical={false} stroke="#edf1ec" />
              <XAxis dataKey="periodo" tickLine={false} axisLine={false} tick={ESTILO_EJE} />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={ESTILO_EJE}
                width={42}
                tickFormatter={(valor) => Number(valor).toLocaleString('es-CO')}
              />
              <Tooltip
                contentStyle={ESTILO_TOOLTIP}
                formatter={(valor, nombre) => [Number(valor).toLocaleString('es-CO'), nombre]}
              />
              <Line
                type="monotone"
                dataKey="faltas"
                name="Faltas"
                stroke="#d9553f"
                strokeWidth={2.6}
                dot={{ r: 5, fill: '#d9553f', strokeWidth: 0, cursor: 'pointer' }}
                activeDot={{ r: 8, cursor: 'pointer' }}
              />
              <Line
                type="monotone"
                dataKey="justificadas"
                name="Justificadas"
                stroke="#4f7fb8"
                strokeWidth={2.4}
                dot={{ r: 4, fill: '#4f7fb8', strokeWidth: 0, cursor: 'pointer' }}
                activeDot={{ r: 7, cursor: 'pointer' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="leyenda-riesgo">
          <span><i style={{ background: '#d9553f' }} /> Faltas reportadas</span>
          <span><i style={{ background: '#4f7fb8' }} /> Faltas justificadas</span>
        </div>
      </article>

      <article className="panel">
        <header className="panel__cabecera">
          <div>
            <h3>Tus materias por período</h3>
            <p>Haz clic en un período para ver notas y faltas, y justifica las que tengas pendientes.</p>
          </div>
          <span className="panel__etiqueta">{perfil.periodos.length} períodos</span>
        </header>
        <div className="periodos-grid">
          {perfil.periodos.map((periodo) => (
            <div key={periodo.periodo} className="periodo-card">
              <button
                type="button"
                className="periodo-card__cuerpo periodo-card--clic"
                onClick={() => setDetalle(periodo)}
              >
                <header className="periodo-card__cabecera">
                  <div>
                    <strong>{periodo.periodo}</strong>
                    <span>{periodo.etiqueta}</span>
                    <span className="periodo-card__rango">
                      <Icon name="calendar" size={12} />
                      {fechaCorta(periodo.inicio)} – {fechaCorta(periodo.fin)}
                    </span>
                  </div>
                  <RiesgoBadge riesgo={periodo.riesgo} compacto />
                </header>
                <div className="periodo-card__promedio">
                  <span>Promedio</span>
                  <b style={{ color: colorNota(periodo.promedio) }}>{periodo.promedio.toFixed(1)}</b>
                  <small>{periodo.faltas} faltas</small>
                </div>
                <span className="periodo-card__pista">
                  Ver detalle y faltas <Icon name="arrowRight" size={13} />
                </span>
              </button>
              <div className="materias materias--compactas">
                {periodo.materias.map((materia) => (
                  <button
                    key={`${periodo.periodo}-${materia.nombre}`}
                    type="button"
                    className="materia materia--clic"
                    onClick={() => abrirMateria(materia.nombre)}
                    title={`Ver mis notas de ${materia.nombre}`}
                  >
                    <div className="materia__fila">
                      <span>{materia.nombre}</span>
                      <strong style={{ color: colorNota(materia.nota) }}>
                        {materia.nota.toFixed(1)} <Icon name="eye" size={11} />
                      </strong>
                    </div>
                    <BarraProgreso
                      valor={materia.nota}
                      color={colorNota(materia.nota)}
                      etiqueta={`Nota de ${materia.nombre}: ${materia.nota}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>

      <section className="insight">
        <span className="insight__icono"><Icon name="sparkles" size={22} /></span>
        <div className="insight__texto">
          <span className="insight__etiqueta">Lo que dicen tus datos</span>
          <p>{perfil.lectura}</p>
        </div>
        <Link to="/chat" className="boton boton--claro">
          Hablar con mi profesor <Icon name="arrowRight" size={16} />
        </Link>
      </section>

      <Modal
        abierto={detalle !== null}
        titulo={detalle ? `Detalle de ${detalle.periodo}` : ''}
        descripcion={
          detalle
            ? `${detalle.etiqueta} · ${fechaCorta(detalle.inicio)} a ${fechaCorta(detalle.fin)} · promedio ${detalle.promedio.toFixed(1)} · ${detalle.faltas} faltas`
            : undefined
        }
        onCerrar={() => setDetalle(null)}
        ancho="amplio"
      >
        {detalle && (
          <div className="detalle-periodo">
            <div className="detalle-periodo__cifras">
              <div>
                <span>Promedio</span>
                <strong style={{ color: colorNota(detalle.promedio) }}>{detalle.promedio.toFixed(1)}</strong>
              </div>
              <div>
                <span>Riesgo</span>
                <RiesgoBadge riesgo={detalle.riesgo} />
              </div>
              <div>
                <span>Faltas del período</span>
                <strong>{detalle.faltas}</strong>
              </div>
              <div>
                <span>Puntaje de riesgo</span>
                <strong>{detalle.riesgoScore}/100</strong>
              </div>
            </div>
            <div className="tabla-envoltura">
              <table className="tabla-materias">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Nota</th>
                    <th>Fecha del corte</th>
                    <th>Faltas</th>
                    <th>Justificadas</th>
                    <th>Pendientes</th>
                    <th>Semestre / grupo</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {detalle.materias.map((materia) => {
                    const sinJustificar = pendientes(materia)
                    return (
                      <tr key={`${detalle.periodo}-${materia.nombre}`}>
                        <td>
                          <strong>{materia.nombre}</strong>
                          {materia.homologada && (
                            <span className="chip-causa chip-causa--suave chip-causa--mini">
                              Homologada
                            </span>
                          )}
                        </td>
                        <td>
                          <b style={{ color: colorNota(materia.nota) }}>{materia.nota.toFixed(1)}</b>
                        </td>
                        <td className="celda-fecha">{fechaCorta(materia.fecha)}</td>
                        <td>{materia.faltas}</td>
                        <td>{materia.faltasJustificadas}</td>
                        <td>
                          <span className={sinJustificar > 0 ? 'marca-falta marca-falta--pendiente' : 'marca-falta'}>
                            {sinJustificar}
                          </span>
                        </td>
                        <td>
                          {materia.semestre}.º · Grupo {materia.grupo}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="boton boton--mini"
                            disabled={sinJustificar === 0}
                            onClick={() => abrirJustificacion(detalle, materia)}
                          >
                            <Icon name="file" size={13} />
                            {sinJustificar === 0 ? 'Sin pendientes' : 'Justificar'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="detalle-periodo__nota">
              Las materias homologadas provienen de otro semestre o grupo. Si tienes faltas
              pendientes, puedes justificarlas con una foto del soporte.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        abierto={materiaDetalle !== null}
        titulo={materiaDetalle ? `Mis notas en ${materiaDetalle.nombre}` : ''}
        descripcion={
          materiaDetalle
            ? `${materiaDetalle.registros.length} ${materiaDetalle.registros.length === 1 ? 'período registrado' : 'períodos registrados'} · clic en un punto de la gráfica o en una fila para abrir el período`
            : undefined
        }
        onCerrar={() => setMateriaDetalle(null)}
        ancho="amplio"
      >
        {materiaDetalle && (
          <div className="detalle-materia">
            <div className="detalle-periodo__cifras">
              <div>
                <span>Última nota</span>
                <strong style={{ color: colorNota(materiaDetalle.registros[materiaDetalle.registros.length - 1].materia.nota) }}>
                  {materiaDetalle.registros[materiaDetalle.registros.length - 1].materia.nota.toFixed(1)}
                </strong>
              </div>
              <div>
                <span>Promedio histórico</span>
                <strong>
                  {(
                    materiaDetalle.registros.reduce((total, registro) => total + registro.materia.nota, 0) /
                    materiaDetalle.registros.length
                  ).toFixed(1)}
                </strong>
              </div>
              <div>
                <span>Faltas acumuladas</span>
                <strong>
                  {materiaDetalle.registros.reduce((total, registro) => total + registro.materia.faltas, 0)}
                </strong>
              </div>
              <div>
                <span>Justificadas</span>
                <strong>
                  {materiaDetalle.registros.reduce(
                    (total, registro) => total + registro.materia.faltasJustificadas,
                    0,
                  )}
                </strong>
              </div>
            </div>

            <div className="grafica grafica--materia">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={datosMateria}
                  margin={{ top: 18, right: 20, left: 0, bottom: 0 }}
                  onClick={(estado) => {
                    const periodo = leerPunto(estado)
                    if (periodo) {
                      setMateriaDetalle(null)
                      abrirPorClave(periodo)
                    }
                  }}
                >
                  <CartesianGrid vertical={false} stroke="#edf1ec" />
                  <XAxis dataKey="periodo" tickLine={false} axisLine={false} tick={ESTILO_EJE} />
                  <YAxis
                    domain={[0, 5]}
                    tickLine={false}
                    axisLine={false}
                    tick={ESTILO_EJE}
                    width={42}
                    tickFormatter={(valor) => Number(valor).toFixed(1)}
                  />
                  <Tooltip
                    contentStyle={ESTILO_TOOLTIP}
                    formatter={(valor, nombre) => [
                      nombre === 'Nota' ? `${Number(valor).toFixed(1)} / 5.0` : Number(valor).toLocaleString('es-CO'),
                      nombre,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="nota"
                    name="Nota"
                    stroke="#145c4e"
                    strokeWidth={2.8}
                    dot={{ r: 5, fill: '#145c4e', strokeWidth: 0, cursor: 'pointer' }}
                    activeDot={{ r: 8, cursor: 'pointer' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="tabla-envoltura">
              <table className="tabla-materias">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Fecha del corte</th>
                    <th>Nota</th>
                    <th>Faltas</th>
                    <th>Justificadas</th>
                    <th>Pendientes</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {materiaDetalle.registros.map((registro) => (
                    <tr key={`${registro.periodo.periodo}-${registro.materia.nombre}`}>
                      <td><strong>{registro.periodo.periodo}</strong></td>
                      <td className="celda-fecha">{fechaCorta(registro.materia.fecha)}</td>
                      <td>
                        <b style={{ color: colorNota(registro.materia.nota) }}>
                          {registro.materia.nota.toFixed(1)}
                        </b>
                      </td>
                      <td>{registro.materia.faltas}</td>
                      <td>{registro.materia.faltasJustificadas}</td>
                      <td>{pendientes(registro.materia)}</td>
                      <td>
                        <button
                          type="button"
                          className="boton-texto"
                          onClick={() => {
                            setMateriaDetalle(null)
                            setDetalle(registro.periodo)
                          }}
                        >
                          Ver período <Icon name="arrowRight" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="detalle-periodo__nota">
              Esta es la trazabilidad completa de la materia: cada corte, sus faltas y cuántas
              fueron justificadas. Los puntos de la gráfica abren el período correspondiente.
            </p>
          </div>
        )}
      </Modal>

      <ModalJustificacion
        abierto={justificar !== null}
        periodo={justificar?.periodo ?? null}
        materia={justificar?.materia ?? null}
        correo={correo}
        recordatorio={recordatorio}
        enviando={enviando}
        onCorreo={setCorreo}
        onCerrar={() => setJustificar(null)}
        onEnviar={async (datos) => {
          if (!justificar) return
          setEnviando(true)
          try {
            const radicada = await justificacionesApi.crear(datos)
            mostrarToast(`Justificación radicada: ${radicada.radicado}`)
            setJustificar(null)
            await cargar()
          } catch (err) {
            mostrarToast(mensajeError(err), 'error')
          } finally {
            setEnviando(false)
          }
        }}
      />
    </div>
  )
}

function LeyendaPersonal() {
  return (
    <div className="leyenda-riesgo">
      <span><i style={{ background: COLOR_RIESGO.ALTO }} /> Riesgo</span>
    </div>
  )
}

function ModalJustificacion({
  abierto,
  periodo,
  materia,
  correo,
  recordatorio,
  enviando,
  onCorreo,
  onCerrar,
  onEnviar,
}: {
  abierto: boolean
  periodo: PeriodoAcademico | null
  materia: NotaMateria | null
  correo: string
  recordatorio: string
  enviando: boolean
  onCorreo: (valor: string) => void
  onCerrar: () => void
  onEnviar: (datos: JustificacionNueva) => Promise<void>
}) {
  const [fecha, setFecha] = useState('')
  const [motivo, setMotivo] = useState('Salud')
  const [descripcion, setDescripcion] = useState('')
  const [evidencia, setEvidencia] = useState('')

  useEffect(() => {
    if (!abierto) {
      setFecha('')
      setMotivo('Salud')
      setDescripcion('')
      setEvidencia('')
    }
  }, [abierto])

  const enviar = async () => {
    if (!materia || !periodo) return
    await onEnviar({
      materia: materia.nombre,
      semestre: materia.semestre || periodo.materias[0]?.semestre || 1,
      grupo: materia.grupo || 'A',
      fechaFalta: fecha,
      motivo,
      descripcion,
      evidencia,
      correoDestino: correo,
    })
  }

  return (
    <Modal
      abierto={abierto}
      titulo={materia ? `Justificar falta · ${materia.nombre}` : 'Justificar falta'}
      descripcion="Envía el soporte al correo de bienestar. Recuerda agregar foto de evidencia."
      onCerrar={onCerrar}
      ancho="amplio"
      pie={
        <>
          <button type="button" className="boton boton--secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton boton--primario"
            onClick={enviar}
            disabled={enviando || !fecha || !evidencia}
          >
            <Icon name="send" size={15} />
            {enviando ? 'Enviando…' : 'Enviar justificación'}
          </button>
        </>
      }
    >
      <div className="aviso-evidencia">
        <Icon name="alert" size={17} />
        <span>{recordatorio}</span>
      </div>
      <div className="formulario formulario--justificacion">
        <label className="campo">
          <span>Correo de envío</span>
          <input type="email" value={correo} onChange={(e) => onCorreo(e.target.value)} />
        </label>
        <label className="campo">
          <span>Fecha de la falta</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>
        <label className="campo">
          <span>Motivo</span>
          <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            <option>Salud</option>
            <option>Trámite personal</option>
            <option>Emergencia familiar</option>
            <option>Transporte</option>
            <option>Otra situación</option>
          </select>
        </label>
        <label className="campo campo--ancho">
          <span>Descripción</span>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cuéntanos qué pasó y adjunta la foto del soporte."
          />
        </label>
        <label className="campo campo--ancho campo--archivo">
          <span>Foto de evidencia *</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEvidencia(e.target.files?.[0]?.name ?? '')}
          />
          <small>
            {evidencia
              ? `Adjunto: ${evidencia}`
              : 'Obligatorio: adjunta una foto o captura del soporte.'}
          </small>
        </label>
      </div>
      <p className="justificacion__pie">
        Materia: <strong>{materia?.nombre}</strong> · {materia?.semestre}.º semestre · Grupo{' '}
        {materia?.grupo}. Quedará asociada al período {periodo?.periodo}.
      </p>
    </Modal>
  )
}
