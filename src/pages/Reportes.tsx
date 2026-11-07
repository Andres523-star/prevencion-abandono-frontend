import { useEffect, useState } from 'react'
import { DonutRiesgo, GraficaCarreras, GraficaCategorias, GraficaSemestres, LeyendaRiesgo } from '../components/Graficas'
import { Icon } from '../components/Icon'
import { Cargando, Vacio } from '../components/Ui'
import { useToast } from '../components/Toast'
import { mensajeError, reportesApi } from '../services/api'
import type { Reporte } from '../types'
import { CARRERAS, CATEGORIAS, COLOR_RIESGO, SEMESTRES } from '../utils/format'

export function Reportes() {
  const { mostrarToast } = useToast()
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [carrera, setCarrera] = useState('')
  const [semestre, setSemestre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setCargando(true)
      setError('')
      try {
        const datos = await reportesApi.obtener({
          carrera: carrera || undefined,
          semestre: semestre ? Number(semestre) : undefined,
          categoria: categoria || undefined,
        })
        if (activo) setReporte(datos)
      } catch (err) {
        if (activo) setError(mensajeError(err))
      } finally {
        if (activo) setCargando(false)
      }
    }
    void cargar()
    return () => {
      activo = false
    }
  }, [carrera, semestre, categoria])

  const filtrosActivos = Boolean(carrera || semestre || categoria)
  const limpiar = () => {
    setCarrera('')
    setSemestre('')
    setCategoria('')
  }

  const descargarCsv = () => {
    if (!reporte) return
    const encabezado = ['Programa', 'Total', 'Riesgo alto', 'Riesgo medio', 'Riesgo bajo', 'Retirados', 'Aplazados']
    const filas = reporte.porCarrera.map((fila) => [
      fila.carrera,
      fila.total,
      fila.alto,
      fila.medio,
      fila.bajo,
      fila.retirados,
      fila.aplazados,
    ])
    const contenido = [encabezado, ...filas].map((fila) => fila.join(',')).join('\n')
    const blob = new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'reporte-permanencia.csv'
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    URL.revokeObjectURL(url)
    mostrarToast('Reporte descargado en formato CSV.', 'info')
  }

  if (cargando && !reporte) return <Cargando texto="Calculando las estadísticas…" />

  if (error && !reporte) {
    return (
      <Vacio icono="alert" titulo="No se pudieron cargar las estadísticas" texto={error}>
        <button type="button" className="boton boton--primario" onClick={() => setCarrera('')}>
          Reintentar
        </button>
      </Vacio>
    )
  }

  if (!reporte) return null

  const sinDatos = reporte.totalEstudiantes === 0
  const porcentajeAlto = reporte.totalEstudiantes
    ? Math.round((reporte.riesgoAlto / reporte.totalEstudiantes) * 100)
    : 0

  return (
    <div className="pagina">
      <section className="pagina__cabecera">
        <div>
          <h2>Estadísticas de permanencia</h2>
          <p>Explora los datos por programa, semestre y causa para enfocar tus acciones.</p>
        </div>
        <div className="pagina__acciones">
          <button type="button" className="boton boton--secundario" onClick={descargarCsv}>
            <Icon name="download" size={17} /> Descargar CSV
          </button>
        </div>
      </section>

      <section className="filtros filtros--reportes" aria-label="Filtros de estadísticas">
        <div className="filtros__selects">
          <label className="filtro-select">
            <Icon name="cap" size={16} />
            <select value={carrera} onChange={(evento) => setCarrera(evento.target.value)} aria-label="Programa">
              <option value="">Todos los programas</option>
              {CARRERAS.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          <label className="filtro-select">
            <Icon name="book" size={16} />
            <select value={semestre} onChange={(evento) => setSemestre(evento.target.value)} aria-label="Semestre">
              <option value="">Todos los semestres</option>
              {SEMESTRES.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}° semestre</option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          <label className="filtro-select">
            <Icon name="heart" size={16} />
            <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)} aria-label="Causa">
              <option value="">Todas las causas</option>
              {CATEGORIAS.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          {filtrosActivos && (
            <button type="button" className="boton-texto filtros__limpiar" onClick={limpiar}>
              <Icon name="close" size={14} /> Limpiar filtros
            </button>
          )}
        </div>
        <span className={`actualizacion${cargando ? ' actualizacion--activa' : ''}`}>
          {cargando ? 'Actualizando…' : `Mostrando ${reporte.totalEstudiantes} estudiantes`}
        </span>
      </section>

      {sinDatos ? (
        <Vacio
          icono="chart"
          titulo="No hay datos con estos filtros"
          texto="Prueba con otro programa, semestre o causa para ver las estadísticas."
        >
          <button type="button" className="boton boton--primario" onClick={limpiar}>
            Ver todos los datos
          </button>
        </Vacio>
      ) : (
        <>
          <section className="cifras">
            <div className="cifra">
              <span className="cifra__icono cifra__icono--verde"><Icon name="users" size={18} /></span>
              <div><span>Total analizado</span><strong>{reporte.totalEstudiantes}</strong></div>
            </div>
            <div className="cifra">
              <span className="cifra__icono cifra__icono--rojo"><Icon name="alert" size={18} /></span>
              <div><span>Riesgo alto</span><strong>{reporte.riesgoAlto} <small>({porcentajeAlto}%)</small></strong></div>
            </div>
            <div className="cifra">
              <span className="cifra__icono cifra__icono--ambar"><Icon name="activity" size={18} /></span>
              <div><span>Riesgo medio</span><strong>{reporte.riesgoMedio}</strong></div>
            </div>
            <div className="cifra">
              <span className="cifra__icono cifra__icono--azul"><Icon name="trend" size={18} /></span>
              <div><span>Deserción</span><strong>{reporte.porcentajeDesercion}%</strong></div>
            </div>
            <div className="cifra">
              <span className="cifra__icono cifra__icono--neutro"><Icon name="book" size={18} /></span>
              <div><span>Promedio general</span><strong>{reporte.promedioGeneral}</strong></div>
            </div>
          </section>

          <div className="panel-grid panel-grid--dos-uno">
            <article className="panel">
              <header className="panel__cabecera">
                <div>
                  <h3>Riesgo por semestre</h3>
                  <p>Identifica los momentos de la carrera con más alertas.</p>
                </div>
                <LeyendaRiesgo />
              </header>
              <div className="grafica grafica--reporte">
                <GraficaSemestres datos={reporte.porSemestre} />
              </div>
            </article>
            <article className="panel">
              <header className="panel__cabecera">
                <div>
                  <h3>Composición del riesgo</h3>
                  <p>Proporción de estudiantes en cada nivel.</p>
                </div>
              </header>
              <DonutRiesgo alto={reporte.riesgoAlto} medio={reporte.riesgoMedio} bajo={reporte.riesgoBajo} />
            </article>
          </div>

          <div className="panel-grid">
            <article className="panel">
              <header className="panel__cabecera">
                <div>
                  <h3>Causas de riesgo</h3>
                  <p>Qué está pesando más en la decisión de continuar.</p>
                </div>
              </header>
              <div className="grafica grafica--reporte">
                <GraficaCategorias datos={reporte.porCategoria} />
              </div>
            </article>
            <article className="panel">
              <header className="panel__cabecera">
                <div>
                  <h3>Riesgo por programa</h3>
                  <p>Comparación entre los seis programas de la facultad.</p>
                </div>
                <LeyendaRiesgo />
              </header>
              <div className="grafica grafica--reporte">
                <GraficaCarreras datos={reporte.porCarrera} />
              </div>
            </article>
          </div>

          <section className="insight">
            <span className="insight__icono"><Icon name="sparkles" size={22} /></span>
            <div className="insight__texto">
              <span className="insight__etiqueta">Lectura de los datos</span>
              <p>{reporte.insight}</p>
            </div>
          </section>

          <article className="panel panel--tabla">
            <header className="panel__cabecera panel__cabecera--tabla">
              <div>
                <h3>Detalle por programa</h3>
                <p>Cifras absolutas para tomar decisiones con contexto.</p>
              </div>
              <span className="panel__etiqueta">Actualizado ahora</span>
            </header>
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Programa</th>
                    <th className="tabla__numero">Total</th>
                    <th className="tabla__numero">Alto</th>
                    <th className="tabla__numero">Medio</th>
                    <th className="tabla__numero">Bajo</th>
                    <th>Deserción</th>
                    <th className="tabla__numero">Aplazados</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.porCarrera.map((fila) => {
                    const desercion = fila.total ? Math.round((fila.retirados / fila.total) * 1000) / 10 : 0
                    return (
                      <tr key={fila.carrera}>
                        <td><strong>{fila.carrera}</strong></td>
                        <td className="tabla__numero">{fila.total}</td>
                        <td className="tabla__numero"><span style={{ color: COLOR_RIESGO.ALTO, fontWeight: 700 }}>{fila.alto}</span></td>
                        <td className="tabla__numero"><span style={{ color: COLOR_RIESGO.MEDIO, fontWeight: 700 }}>{fila.medio}</span></td>
                        <td className="tabla__numero"><span style={{ color: COLOR_RIESGO.BAJO, fontWeight: 700 }}>{fila.bajo}</span></td>
                        <td>
                          <div className="celda-desercion">
                            <span className="barra-mini">
                              <i style={{ width: `${Math.min(100, desercion * 4)}%`, background: COLOR_RIESGO.ALTO }} />
                            </span>
                            <span>{desercion}%</span>
                          </div>
                        </td>
                        <td className="tabla__numero">{fila.aplazados}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </div>
  )
}
