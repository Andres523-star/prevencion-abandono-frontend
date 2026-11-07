import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DonutRiesgo, GraficaCarreras, GraficaCategorias, GraficaSemestres, LeyendaRiesgo } from '../components/Graficas'
import { Icon, type IconName } from '../components/Icon'
import { Avatar, Cargando, RiesgoBadge, Vacio } from '../components/Ui'
import { estudiantesApi, mensajeError, reportesApi } from '../services/api'
import type { Estudiante, Reporte } from '../types'
import { hace, nombreCompleto } from '../utils/format'

interface TarjetaProps {
  icono: IconName
  etiqueta: string
  valor: string
  detalle: string
  tono: 'verde' | 'rojo' | 'ambar' | 'azul'
}

function TarjetaResumen({ icono, etiqueta, valor, detalle, tono }: TarjetaProps) {
  return (
    <article className={`tarjeta-resumen tarjeta-resumen--${tono}`}>
      <div className="tarjeta-resumen__cabecera">
        <span className="tarjeta-resumen__icono">
          <Icon name={icono} size={20} />
        </span>
        <span className="tarjeta-resumen__etiqueta">{etiqueta}</span>
      </div>
      <strong className="tarjeta-resumen__valor">{valor}</strong>
      <p className="tarjeta-resumen__detalle">{detalle}</p>
    </article>
  )
}

export function Dashboard() {
  const { sesion } = useAuth()
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [prioritarios, setPrioritarios] = useState<Estudiante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargar = async () => {
    setCargando(true)
    setError('')
    try {
      const [datosReporte, casos] = await Promise.all([
        reportesApi.obtener(),
        estudiantesApi.listar({ riesgo: 'ALTO', limit: 5 }),
      ])
      setReporte(datosReporte)
      setPrioritarios(casos)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  if (cargando) return <Cargando texto="Preparando el panel de permanencia…" />

  if (error || !reporte) {
    return (
      <Vacio icono="alert" titulo="No se pudo cargar el panel" texto={error}>
        <button type="button" className="boton boton--primario" onClick={() => void cargar()}>
          <Icon name="refresh" size={16} /> Reintentar
        </button>
      </Vacio>
    )
  }

  const porcentajeAlto = Math.round((reporte.riesgoAlto / reporte.totalEstudiantes) * 100)
  const porcentajeMedio = Math.round((reporte.riesgoMedio / reporte.totalEstudiantes) * 100)
  const primerCaso = prioritarios[0]

  return (
    <div className="pagina pagina--panel">
      <section className="bienvenida">
        <div className="bienvenida__texto">
          <span className="bienvenida__saludo">Hola, {sesion?.nombre ?? 'profe'} 👋</span>
          <h2>Hoy puedes cambiar el rumbo de una historia.</h2>
          <p>
            Hay <strong>{reporte.riesgoAlto} estudiantes en riesgo alto</strong> y{' '}
            <strong>{reporte.riesgoMedio} en riesgo medio</strong>. La causa principal este semestre
            es <strong>{reporte.categoriaPrincipal.toLowerCase()}</strong>.
          </p>
          <div className="bienvenida__acciones">
            <Link to="/estudiantes?riesgo=ALTO" className="boton boton--primario">
              Ver casos prioritarios <Icon name="arrowRight" size={17} />
            </Link>
            <Link to="/reportes" className="boton boton--secundario">
              Explorar estadísticas
            </Link>
          </div>
        </div>
        <div className="bienvenida__sello" aria-hidden="true">
          <div className="bienvenida__sello-anillo">
            <span>{porcentajeAlto}%</span>
            <small>en riesgo alto</small>
          </div>
          <p>La alerta temprana es una oportunidad, no una sentencia.</p>
        </div>
      </section>

      <section className="tarjetas-resumen" aria-label="Resumen del semestre">
        <TarjetaResumen
          icono="users"
          etiqueta="Estudiantes"
          valor={reporte.totalEstudiantes.toLocaleString('es-CO')}
          detalle={`${reporte.activos} activos · ${reporte.aplazados} aplazados`}
          tono="verde"
        />
        <TarjetaResumen
          icono="alert"
          etiqueta="Riesgo alto"
          valor={reporte.riesgoAlto.toLocaleString('es-CO')}
          detalle={`${porcentajeAlto}% del total requiere atención`}
          tono="rojo"
        />
        <TarjetaResumen
          icono="activity"
          etiqueta="Riesgo medio"
          valor={reporte.riesgoMedio.toLocaleString('es-CO')}
          detalle={`${porcentajeMedio}% conviene seguir de cerca`}
          tono="ambar"
        />
        <TarjetaResumen
          icono="trend"
          etiqueta="Deserción"
          valor={`${reporte.porcentajeDesercion}%`}
          detalle={`${reporte.retirados} retirados · promedio ${reporte.promedioGeneral}`}
          tono="azul"
        />
      </section>

      <div className="panel-grid panel-grid--dos-uno">
        <article className="panel">
          <header className="panel__cabecera">
            <div>
              <h3>Riesgo por semestre</h3>
              <p>Cómo se distribuye el acompañamiento a lo largo de la carrera.</p>
            </div>
            <LeyendaRiesgo />
          </header>
          <div className="grafica grafica--semestres">
            <GraficaSemestres datos={reporte.porSemestre} />
          </div>
        </article>

        <article className="panel">
          <header className="panel__cabecera">
            <div>
              <h3>Distribución del riesgo</h3>
              <p>El pulso general de los 600 estudiantes.</p>
            </div>
          </header>
          <DonutRiesgo alto={reporte.riesgoAlto} medio={reporte.riesgoMedio} bajo={reporte.riesgoBajo} />
        </article>
      </div>

      <div className="panel-grid panel-grid--dos-uno">
        <article className="panel">
          <header className="panel__cabecera">
            <div>
              <h3>Causas que más pesan</h3>
              <p>El contexto detrás de cada alerta de permanencia.</p>
            </div>
            <Link to="/reportes" className="enlace-sutil">
              Ver detalle <Icon name="arrowRight" size={14} />
            </Link>
          </header>
          <div className="grafica grafica--categorias">
            <GraficaCategorias datos={reporte.porCategoria} />
          </div>
        </article>

        <article className="panel panel--lista">
          <header className="panel__cabecera">
            <div>
              <h3>Necesitan atención hoy</h3>
              <p>Los casos con mayor puntaje de riesgo.</p>
            </div>
            <Link to="/estudiantes?riesgo=ALTO" className="enlace-sutil">
              Ver todos <Icon name="arrowRight" size={14} />
            </Link>
          </header>
          <div className="lista-prioritarios">
            {prioritarios.map((estudiante) => (
              <Link
                key={estudiante.id}
                to={`/estudiantes/${estudiante.id}`}
                className="fila-prioritaria"
              >
                <Avatar
                  nombre={estudiante.nombre}
                  apellido={estudiante.apellido}
                  tamano="sm"
                  riesgo={estudiante.riesgoActual}
                />
                <div className="fila-prioritaria__datos">
                  <strong>{nombreCompleto(estudiante)}</strong>
                  <span>
                    {estudiante.carrera} · {estudiante.semestre}° semestre
                  </span>
                </div>
                <div className="fila-prioritaria__meta">
                  <RiesgoBadge riesgo={estudiante.riesgoActual} compacto />
                  <small>{estudiante.riesgoScore}/100</small>
                </div>
                <Icon name="arrowRight" size={16} className="fila-prioritaria__flecha" />
              </Link>
            ))}
          </div>
        </article>
      </div>

      <section className="insight">
        <span className="insight__icono">
          <Icon name="sparkles" size={22} />
        </span>
        <div className="insight__texto">
          <span className="insight__etiqueta">Recomendación de permanencia</span>
          <p>{reporte.insight}</p>
        </div>
        {primerCaso && (
          <Link to={`/estudiantes/${primerCaso.id}`} className="boton boton--claro">
            Revisar caso prioritario <Icon name="arrowRight" size={16} />
          </Link>
        )}
      </section>

      <div className="panel-grid panel-grid--dos-uno">
        <article className="panel">
          <header className="panel__cabecera">
            <div>
              <h3>Riesgo por programa</h3>
              <p>Dónde se concentra la alerta temprana en la universidad.</p>
            </div>
            <LeyendaRiesgo />
          </header>
          <div className="grafica grafica--carreras">
            <GraficaCarreras datos={reporte.porCarrera} />
          </div>
        </article>

        <article className="panel panel--seguimiento">
          <header className="panel__cabecera">
            <div>
              <h3>Semáforo del semestre</h3>
              <p>Un resumen rápido para priorizar la semana.</p>
            </div>
          </header>
          <div className="seguimiento">
            <div className="seguimiento__fila">
              <span className="seguimiento__punto seguimiento__punto--rojo" />
              <div>
                <strong>{reporte.riesgoAlto} casos críticos</strong>
                <span>Requieren contacto en las próximas 48 horas.</span>
              </div>
            </div>
            <div className="seguimiento__fila">
              <span className="seguimiento__punto seguimiento__punto--ambar" />
              <div>
                <strong>{reporte.riesgoMedio} en observación</strong>
                <span>Conviene revisar asistencia y promedio esta semana.</span>
              </div>
            </div>
            <div className="seguimiento__fila">
              <span className="seguimiento__punto seguimiento__punto--verde" />
              <div>
                <strong>{reporte.riesgoBajo} estables</strong>
                <span>Mantener el vínculo y reconocer sus avances.</span>
              </div>
            </div>
            <div className="seguimiento__pie">
              <Icon name="clock" size={15} />
              <span>Actualizado {hace(new Date().toISOString())}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
