import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FormularioEstudiante } from '../components/FormularioEstudiante'
import { Icon } from '../components/Icon'
import { Avatar, Cargando, EstadoBadge, RiesgoBadge, Vacio } from '../components/Ui'
import { estudiantesApi, mensajeError } from '../services/api'
import type { Estudiante } from '../types'
import {
  CARRERAS,
  CATEGORIAS,
  COLOR_CATEGORIA,
  RIESGOS,
  SEMESTRES,
  nombreCompleto,
} from '../utils/format'

const POR_PAGINA = 10

export function Estudiantes() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [carrera, setCarrera] = useState(() => searchParams.get('carrera') ?? '')
  const [semestre, setSemestre] = useState(() => searchParams.get('semestre') ?? '')
  const [categoria, setCategoria] = useState(() => searchParams.get('categoria') ?? '')
  const [riesgo, setRiesgo] = useState(() => searchParams.get('riesgo') ?? '')
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [pagina, setPagina] = useState(1)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [refresco, setRefresco] = useState(0)

  const paramsString = searchParams.toString()

  useEffect(() => {
    const params = new URLSearchParams(paramsString)
    setSearch(params.get('search') ?? '')
    setCarrera(params.get('carrera') ?? '')
    setSemestre(params.get('semestre') ?? '')
    setCategoria(params.get('categoria') ?? '')
    setRiesgo(params.get('riesgo') ?? '')
  }, [paramsString])

  useEffect(() => {
    let activo = true
    const temporizador = window.setTimeout(
      async () => {
        setCargando(true)
        setError('')
        try {
          const datos = await estudiantesApi.listar({
            search: search.trim() || undefined,
            carrera: carrera || undefined,
            semestre: semestre ? Number(semestre) : undefined,
            categoria: categoria || undefined,
            riesgo: riesgo ? (riesgo as Estudiante['riesgoActual']) : undefined,
          })
          if (activo) {
            setEstudiantes(datos)
            setPagina(1)
          }
        } catch (err) {
          if (activo) setError(mensajeError(err))
        } finally {
          if (activo) setCargando(false)
        }
      },
      search.trim() ? 320 : 0,
    )
    return () => {
      activo = false
      window.clearTimeout(temporizador)
    }
  }, [search, carrera, semestre, categoria, riesgo, refresco])

  const totalPaginas = Math.max(1, Math.ceil(estudiantes.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = useMemo(
    () => estudiantes.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA),
    [estudiantes, paginaActual],
  )

  const filtrosActivos = Boolean(search || carrera || semestre || categoria || riesgo)

  const limpiarFiltros = () => {
    setSearch('')
    setCarrera('')
    setSemestre('')
    setCategoria('')
    setRiesgo('')
    setPagina(1)
  }

  const alCrear = () => {
    setRefresco((valor) => valor + 1)
  }

  return (
    <div className="pagina">
      <section className="pagina__cabecera">
        <div>
          <h2>Estudiantes acompañados</h2>
          <p>Filtra por programa, semestre, causa o nivel de riesgo para decidir por dónde empezar.</p>
        </div>
        <div className="pagina__acciones">
          <button type="button" className="boton boton--primario" onClick={() => setModalAbierto(true)}>
            <Icon name="plus" size={17} /> Nuevo estudiante
          </button>
        </div>
      </section>

      <section className="filtros" aria-label="Filtros de estudiantes">
        <div className="buscador">
          <Icon name="search" size={18} />
          <input
            value={search}
            onChange={(evento) => setSearch(evento.target.value)}
            placeholder="Buscar por nombre, cédula, programa o causa…"
            aria-label="Buscar estudiantes"
          />
          {search && (
            <button type="button" className="buscador__limpiar" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
              <Icon name="close" size={15} />
            </button>
          )}
        </div>

        <div className="filtros__selects">
          <label className="filtro-select">
            <Icon name="cap" size={16} />
            <select value={carrera} onChange={(evento) => setCarrera(evento.target.value)} aria-label="Programa">
              <option value="">Todos los programas</option>
              {CARRERAS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>

          <label className="filtro-select">
            <Icon name="book" size={16} />
            <select value={semestre} onChange={(evento) => setSemestre(evento.target.value)} aria-label="Semestre">
              <option value="">Todos los semestres</option>
              {SEMESTRES.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}° semestre
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>

          <label className="filtro-select">
            <Icon name="heart" size={16} />
            <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)} aria-label="Causa">
              <option value="">Todas las causas</option>
              {CATEGORIAS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>

          <label className="filtro-select">
            <Icon name="alert" size={16} />
            <select value={riesgo} onChange={(evento) => setRiesgo(evento.target.value)} aria-label="Riesgo">
              <option value="">Todos los riesgos</option>
              {RIESGOS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  Riesgo {opcion.toLowerCase()}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>

          {filtrosActivos && (
            <button type="button" className="boton-texto filtros__limpiar" onClick={limpiarFiltros}>
              <Icon name="close" size={14} /> Limpiar filtros
            </button>
          )}
        </div>
      </section>

      <section className="panel panel--tabla" aria-busy={cargando}>
        <header className="panel__cabecera panel__cabecera--tabla">
          <div>
            <h3>Directorio de estudiantes</h3>
            <p>
              {cargando ? 'Buscando…' : `${estudiantes.length.toLocaleString('es-CO')} estudiantes encontrados`}
            </p>
          </div>
          <span className="panel__etiqueta">Ordenados por riesgo</span>
        </header>

        {error ? (
          <Vacio icono="alert" titulo="No se pudo cargar el directorio" texto={error}>
            <button type="button" className="boton boton--primario" onClick={() => setRefresco((v) => v + 1)}>
              <Icon name="refresh" size={16} /> Reintentar
            </button>
          </Vacio>
        ) : cargando ? (
          <Cargando texto="Buscando estudiantes…" />
        ) : estudiantes.length === 0 ? (
          <Vacio
            icono="search"
            titulo="No encontramos coincidencias"
            texto="Prueba con otro nombre o quita algunos filtros para ampliar la búsqueda."
          >
            <button type="button" className="boton boton--secundario" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          </Vacio>
        ) : (
          <>
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Programa</th>
                    <th>Causa principal</th>
                    <th className="tabla__numero">Promedio</th>
                    <th className="tabla__numero">Faltas</th>
                    <th>Riesgo</th>
                    <th>Estado</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((estudiante) => (
                    <tr key={estudiante.id}>
                      <td>
                        <Link to={`/estudiantes/${estudiante.id}`} className="celda-estudiante">
                          <Avatar
                            nombre={estudiante.nombre}
                            apellido={estudiante.apellido}
                            tamano="sm"
                            riesgo={estudiante.riesgoActual}
                          />
                          <span>
                            <strong>{nombreCompleto(estudiante)}</strong>
                            <small>C.C. {estudiante.cedula}</small>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span className="celda-programa">
                          <strong>{estudiante.carrera}</strong>
                          <small>{estudiante.semestre}° semestre</small>
                        </span>
                      </td>
                      <td>
                        <span className="chip-causa">
                          <i style={{ background: COLOR_CATEGORIA[estudiante.categoria] ?? '#145c4e' }} />
                          {estudiante.categoria}
                        </span>
                      </td>
                      <td className="tabla__numero">
                        <span className="valor-promedio">{estudiante.promedio.toFixed(1)}</span>
                      </td>
                      <td className="tabla__numero">{estudiante.faltas}</td>
                      <td>
                        <div className="celda-riesgo">
                          <RiesgoBadge riesgo={estudiante.riesgoActual} compacto />
                          <small>{estudiante.riesgoScore}/100</small>
                        </div>
                      </td>
                      <td>
                        <EstadoBadge estado={estudiante.estado} />
                      </td>
                      <td>
                        <div className="acciones-tabla">
                          <Link
                            to={`/estudiantes/${estudiante.id}`}
                            className="boton-icono"
                            title="Ver ficha"
                            aria-label={`Ver ficha de ${nombreCompleto(estudiante)}`}
                          >
                            <Icon name="eye" size={17} />
                          </Link>
                          <Link
                            to={`/chat/${estudiante.id}`}
                            className="boton-icono"
                            title="Abrir chat"
                            aria-label={`Abrir chat con ${nombreCompleto(estudiante)}`}
                          >
                            <Icon name="message" size={17} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="paginacion">
              <span>
                Mostrando {(paginaActual - 1) * POR_PAGINA + 1}–
                {Math.min(paginaActual * POR_PAGINA, estudiantes.length)} de {estudiantes.length}
              </span>
              <div className="paginacion__botones">
                <button
                  type="button"
                  className="boton boton--secundario boton--compacto"
                  onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
                  disabled={paginaActual === 1}
                >
                  <Icon name="arrowLeft" size={15} /> Anterior
                </button>
                <span className="paginacion__pagina">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  className="boton boton--secundario boton--compacto"
                  onClick={() => setPagina((valor) => Math.min(totalPaginas, valor + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente <Icon name="arrowRight" size={15} />
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      <FormularioEstudiante
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCreado={alCrear}
      />
    </div>
  )
}
