import { useEffect, useState } from 'react'
import {
  DonutRiesgo,
  GraficaCarreras,
  GraficaCategorias,
  GraficaSemestres,
  LeyendaRiesgo,
  type SeleccionGrafica,
} from '../components/Graficas'
import { Icon } from '../components/Icon'
import { ModalEstudiantes } from '../components/ModalEstudiantes'
import { Cargando, Vacio } from '../components/Ui'
import { useToast } from '../components/Toast'
import { useAuth } from '../auth/AuthContext'
import { descargasApi, mensajeError, reportesApi } from '../services/api'
import type { FiltrosEstudiante, NivelRiesgo, Reporte } from '../types'
import { COLOR_RIESGO } from '../utils/format'
import { EstadisticasEstudiante } from './EstadisticasEstudiante'

interface ModalAbierto {
  titulo: string
  filtros: FiltrosEstudiante
}

/** El rol Estudiante ve su propia versión de Estadísticas. */
export function Reportes() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'ESTUDIANTE') return <EstadisticasEstudiante />
  return <ReportesInstitucionales />
}

function ReportesInstitucionales() {
  const { mostrarToast } = useToast()
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [refrescar, setRefrescar] = useState(0)
  const [seleccion, setSeleccion] = useState<SeleccionGrafica | null>(null)
  const [modal, setModal] = useState<ModalAbierto | null>(null)
  const [grupo, setGrupo] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true)
    setError('')
    reportesApi
      .obtener({ grupo: grupo || undefined })
      .then((datos) => {
        if (activo) setReporte(datos)
      })
      .catch((err) => {
        if (activo) setError(mensajeError(err))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [refrescar, grupo])

  const descargarCsv = async () => {
    try {
      await descargasApi.reporte({ grupo: grupo || undefined })
      mostrarToast('Reporte descargado en formato CSV.', 'info')
    } catch (err) {
      mostrarToast(mensajeError(err), 'error')
    }
  }

  if (cargando && !reporte) return <Cargando texto="Calculando las estadísticas…" />

  if (error && !reporte) {
    return (
      <Vacio icono="alert" titulo="No se pudieron cargar las estadísticas" texto={error}>
        <button type="button" className="boton boton--primario" onClick={() => setRefrescar((valor) => valor + 1)}>
          <Icon name="refresh" size={16} /> Reintentar
        </button>
      </Vacio>
    )
  }

  if (!reporte) return null

  const sinDatos = reporte.totalEstudiantes === 0
  const porcentajeAlto = reporte.totalEstudiantes
    ? Math.round((reporte.riesgoAlto / reporte.totalEstudiantes) * 100)
    : 0

  const abrirLista = (titulo: string, filtros: FiltrosEstudiante = {}) =>
    setModal({ titulo, filtros: { grupo: grupo || undefined, ...filtros } })

  const abrirRiesgo = (nivel: NivelRiesgo) => {
    setSeleccion({ riesgo: nivel })
    abrirLista(`Riesgo ${nivel.toLowerCase()}`, { riesgo: nivel })
  }

  const abrirPrograma = (carrera: string, nivel?: NivelRiesgo) => {
    setSeleccion({ carrera, riesgo: nivel })
    abrirLista(
      `${carrera}${nivel ? ` · Riesgo ${nivel.toLowerCase()}` : ''}`,
      { carrera, riesgo: nivel },
    )
  }

  return (
    <div className="pagina">
      <section className="pagina__cabecera">
        <div>
          <h2>Estadísticas de permanencia</h2>
          <p>Los filtros viven en el panel; aquí puedes explorar tocando cada cifra o gráfica.</p>
        </div>
        <div className="pagina__acciones">
          <label className="filtro-select">
            <Icon name="users" size={16} />
            <select value={grupo} onChange={(evento) => setGrupo(evento.target.value)} aria-label="Grupo">
              <option value="">Todos los grupos</option>
              <option value="A">Grupo A</option>
              <option value="B">Grupo B</option>
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => setRefrescar((valor) => valor + 1)}
          >
            <Icon name="refresh" size={17} /> Actualizar
          </button>
          <button type="button" className="boton boton--secundario" onClick={() => void descargarCsv()}>
            <Icon name="download" size={17} /> Descargar CSV
          </button>
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => void descargasApi.todo({ grupo: grupo || undefined })}
          >
            <Icon name="download" size={17} /> Descargar todo (.zip)
          </button>
        </div>
      </section>

      {sinDatos ? (
        <Vacio
          icono="chart"
          titulo="No hay datos para tu rol"
          texto="No encontramos estudiantes en el alcance de tu cuenta."
        />
      ) : (
        <>
          <section className="cifras">
            <button type="button" className="cifra cifra--clic" onClick={() => abrirLista('Todos los estudiantes')}>
              <span className="cifra__icono cifra__icono--verde"><Icon name="users" size={18} /></span>
              <div><span>Total analizado</span><strong>{reporte.totalEstudiantes.toLocaleString('es-CO')}</strong></div>
            </button>
            <button type="button" className="cifra cifra--clic" onClick={() => abrirRiesgo('ALTO')}>
              <span className="cifra__icono cifra__icono--rojo"><Icon name="alert" size={18} /></span>
              <div><span>Riesgo alto</span><strong>{reporte.riesgoAlto.toLocaleString('es-CO')} <small>({porcentajeAlto}%)</small></strong></div>
            </button>
            <button type="button" className="cifra cifra--clic" onClick={() => abrirRiesgo('MEDIO')}>
              <span className="cifra__icono cifra__icono--ambar"><Icon name="activity" size={18} /></span>
              <div><span>Riesgo medio</span><strong>{reporte.riesgoMedio.toLocaleString('es-CO')}</strong></div>
            </button>
            <button
              type="button"
              className="cifra cifra--clic"
              onClick={() => abrirLista('Estudiantes retirados', { estado: 'RETIRADO' })}
            >
              <span className="cifra__icono cifra__icono--azul"><Icon name="trend" size={18} /></span>
              <div><span>Deserción</span><strong>{reporte.porcentajeDesercion}%</strong></div>
            </button>
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
                  <p>Haz clic en un segmento para abrir sus estudiantes.</p>
                </div>
                <LeyendaRiesgo />
              </header>
              <div className="grafica grafica--reporte">
                <GraficaSemestres
                  datos={reporte.porSemestre}
                  seleccion={seleccion}
                  onSegmento={(nivel, valorSemestre) => {
                    setSeleccion({ riesgo: nivel, semestre: valorSemestre })
                    abrirLista(`Riesgo ${nivel.toLowerCase()} · ${valorSemestre}° semestre`, {
                      riesgo: nivel,
                      semestre: valorSemestre,
                    })
                  }}
                />
              </div>
            </article>
            <article className="panel">
              <header className="panel__cabecera">
                <div>
                  <h3>Composición del riesgo</h3>
                  <p>Haz clic en un color para ver el detalle.</p>
                </div>
              </header>
              <DonutRiesgo
                alto={reporte.riesgoAlto}
                medio={reporte.riesgoMedio}
                bajo={reporte.riesgoBajo}
                riesgoActivo={seleccion?.riesgo ?? null}
                onRiesgo={abrirRiesgo}
              />
            </article>
          </div>

          <div className="panel-grid">
            <article className="panel">
              <header className="panel__cabecera">
                <div>
                  <h3>Causas de riesgo</h3>
                  <p>Haz clic en una causa para abrir sus estudiantes.</p>
                </div>
              </header>
              <div className="grafica grafica--reporte">
                <GraficaCategorias
                  datos={reporte.porCategoria}
                  seleccion={seleccion}
                  onCategoria={(valorCategoria) => {
                    setSeleccion({ categoria: valorCategoria })
                    abrirLista(`Causa: ${valorCategoria}`, { categoria: valorCategoria })
                  }}
                />
              </div>
            </article>
            <article className="panel">
              <header className="panel__cabecera">
                <div>
                  <h3>Riesgo por programa</h3>
                  <p>Haz clic en un segmento para ver sus estudiantes.</p>
                </div>
                <LeyendaRiesgo />
              </header>
              <div className="grafica grafica--reporte">
                <GraficaCarreras
                  datos={reporte.porCarrera}
                  seleccion={seleccion}
                  onSegmento={(nivel, valorCarrera) => {
                    setSeleccion({ riesgo: nivel, carrera: valorCarrera })
                    abrirLista(`${valorCarrera} · Riesgo ${nivel.toLowerCase()}`, {
                      riesgo: nivel,
                      carrera: valorCarrera,
                    })
                  }}
                />
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
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reporte.porCarrera.map((fila) => {
                    const desercion = fila.total ? Math.round((fila.retirados / fila.total) * 1000) / 10 : 0
                    return (
                      <tr
                        key={fila.carrera}
                        className="tabla__fila--clicable"
                        onClick={() => abrirPrograma(fila.carrera)}
                        tabIndex={0}
                        onKeyDown={(evento) => {
                          if (evento.key === 'Enter' || evento.key === ' ') {
                            evento.preventDefault()
                            abrirPrograma(fila.carrera)
                          }
                        }}
                      >
                        <td><strong>{fila.carrera}</strong></td>
                        <td className="tabla__numero">{fila.total.toLocaleString('es-CO')}</td>
                        <td className="tabla__numero">
                          <button
                            type="button"
                            className="celda-riesgo"
                            style={{ color: COLOR_RIESGO.ALTO }}
                            onClick={(evento) => {
                              evento.stopPropagation()
                              abrirPrograma(fila.carrera, 'ALTO')
                            }}
                            title={`Ver estudiantes en riesgo alto de ${fila.carrera}`}
                          >
                            {fila.alto.toLocaleString('es-CO')}
                          </button>
                        </td>
                        <td className="tabla__numero">
                          <button
                            type="button"
                            className="celda-riesgo"
                            style={{ color: COLOR_RIESGO.MEDIO }}
                            onClick={(evento) => {
                              evento.stopPropagation()
                              abrirPrograma(fila.carrera, 'MEDIO')
                            }}
                            title={`Ver estudiantes en riesgo medio de ${fila.carrera}`}
                          >
                            {fila.medio.toLocaleString('es-CO')}
                          </button>
                        </td>
                        <td className="tabla__numero">
                          <button
                            type="button"
                            className="celda-riesgo"
                            style={{ color: COLOR_RIESGO.BAJO }}
                            onClick={(evento) => {
                              evento.stopPropagation()
                              abrirPrograma(fila.carrera, 'BAJO')
                            }}
                            title={`Ver estudiantes en riesgo bajo de ${fila.carrera}`}
                          >
                            {fila.bajo.toLocaleString('es-CO')}
                          </button>
                        </td>
                        <td>
                          <div className="celda-desercion">
                            <span className="barra-mini">
                              <i style={{ width: `${Math.min(100, desercion * 4)}%`, background: COLOR_RIESGO.ALTO }} />
                            </span>
                            <span>{desercion}%</span>
                          </div>
                        </td>
                        <td className="tabla__numero">{fila.aplazados.toLocaleString('es-CO')}</td>
                        <td>
                          <span className="boton-texto">
                            Ver estudiantes <Icon name="arrowRight" size={13} />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel panel--tabla">
            <header className="panel__cabecera panel__cabecera--tabla">
              <div>
                <h3>Detalle por grupo</h3>
                <p>Cada semestre tiene dos grupos (A y B); así se ve su comportamiento.</p>
              </div>
              <span className="panel__etiqueta">{grupo ? `Grupo ${grupo}` : 'Todos los grupos'}</span>
            </header>
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th className="tabla__numero">Total</th>
                    <th className="tabla__numero">Alto</th>
                    <th className="tabla__numero">Medio</th>
                    <th className="tabla__numero">Bajo</th>
                    <th>Deserción</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reporte.porGrupo.map((fila) => {
                    const desercion = fila.total ? Math.round((fila.retirados / fila.total) * 1000) / 10 : 0
                    return (
                      <tr key={fila.grupo}>
                        <td><strong>Grupo {fila.grupo}</strong></td>
                        <td className="tabla__numero">{fila.total.toLocaleString('es-CO')}</td>
                        <td className="tabla__numero"><span style={{ color: COLOR_RIESGO.ALTO, fontWeight: 700 }}>{fila.alto.toLocaleString('es-CO')}</span></td>
                        <td className="tabla__numero"><span style={{ color: COLOR_RIESGO.MEDIO, fontWeight: 700 }}>{fila.medio.toLocaleString('es-CO')}</span></td>
                        <td className="tabla__numero"><span style={{ color: COLOR_RIESGO.BAJO, fontWeight: 700 }}>{fila.bajo.toLocaleString('es-CO')}</span></td>
                        <td>{desercion}%</td>
                        <td>
                          <button
                            type="button"
                            className="boton-texto"
                            onClick={() => {
                              setGrupo(fila.grupo)
                              abrirLista(`Grupo ${fila.grupo}`, { grupo: fila.grupo })
                            }}
                          >
                            Ver estudiantes <Icon name="arrowRight" size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}

      <ModalEstudiantes
        abierto={modal !== null}
        titulo={modal?.titulo ?? ''}
        filtros={modal?.filtros ?? {}}
        onCerrar={() => setModal(null)}
      />
    </div>
  )
}
