import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  DonutRiesgo,
  GraficaCarreras,
  GraficaCategorias,
  GraficaSemestres,
  LeyendaRiesgo,
  type SeleccionGrafica,
} from '../components/Graficas'
import { Icon, type IconName } from '../components/Icon'
import { ModalEstudiantes } from '../components/ModalEstudiantes'
import { Avatar, Cargando, RiesgoBadge, Vacio } from '../components/Ui'
import { catalogosApi, descargasApi, estudiantesApi, mensajeError, reportesApi } from '../services/api'
import { useToast } from '../components/Toast'
import type {
  Catalogo,
  Estudiante,
  FiltrosEstudiante,
  FiltrosReporte,
  NivelRiesgo,
  Reporte,
} from '../types'
import { COLOR_RIESGO, hace, nombreCompleto } from '../utils/format'

interface TarjetaProps {
  icono: IconName
  etiqueta: string
  valor: string
  detalle: string
  tono: 'verde' | 'rojo' | 'ambar' | 'azul'
  onClick?: () => void
}

function TarjetaResumen({ icono, etiqueta, valor, detalle, tono, onClick }: TarjetaProps) {
  return (
    <button
      type="button"
      className={`tarjeta-resumen tarjeta-resumen--${tono}${onClick ? ' tarjeta-resumen--clic' : ''}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="tarjeta-resumen__cabecera">
        <span className="tarjeta-resumen__icono">
          <Icon name={icono} size={20} />
        </span>
        <span className="tarjeta-resumen__etiqueta">{etiqueta}</span>
      </div>
      <strong className="tarjeta-resumen__valor">{valor}</strong>
      <p className="tarjeta-resumen__detalle">{detalle}</p>
      {onClick && (
        <span className="tarjeta-resumen__pista">
          Ver estudiantes <Icon name="arrowRight" size={13} />
        </span>
      )}
    </button>
  )
}

interface ModalAbierto {
  titulo: string
  filtros: FiltrosEstudiante
}

type DimensionComparacion =
  | 'SEDE'
  | 'PROGRAMA'
  | 'FACULTAD'
  | 'SEMESTRE'
  | 'GRUPO'
  | 'CAUSA'
  | 'RIESGO'

const DIMENSIONES_RECTOR: Array<{ valor: DimensionComparacion; etiqueta: string; icono: IconName }> = [
  { valor: 'SEDE', etiqueta: 'Sede', icono: 'mapPin' },
  { valor: 'PROGRAMA', etiqueta: 'Programa', icono: 'cap' },
  { valor: 'FACULTAD', etiqueta: 'Facultad', icono: 'book' },
  { valor: 'SEMESTRE', etiqueta: 'Semestre', icono: 'calendar' },
  { valor: 'GRUPO', etiqueta: 'Grupo', icono: 'users' },
  { valor: 'CAUSA', etiqueta: 'Causa', icono: 'heart' },
  { valor: 'RIESGO', etiqueta: 'Riesgo', icono: 'alert' },
]

const DIMENSIONES_DECANO: Array<{ valor: DimensionComparacion; etiqueta: string; icono: IconName }> = [
  { valor: 'PROGRAMA', etiqueta: 'Programa', icono: 'cap' },
  { valor: 'FACULTAD', etiqueta: 'Facultad', icono: 'book' },
  { valor: 'SEMESTRE', etiqueta: 'Semestre', icono: 'calendar' },
  { valor: 'GRUPO', etiqueta: 'Grupo', icono: 'users' },
  { valor: 'CAUSA', etiqueta: 'Causa', icono: 'heart' },
  { valor: 'RIESGO', etiqueta: 'Riesgo', icono: 'alert' },
]

const ETIQUETA_RIESGO: Record<string, string> = {
  ALTO: 'Riesgo alto',
  MEDIO: 'Riesgo medio',
  BAJO: 'Riesgo bajo',
}

function filtrosDe(dimension: DimensionComparacion, valor: string): FiltrosReporte {
  switch (dimension) {
    case 'SEDE':
      return { sede: valor }
    case 'PROGRAMA':
      return { carrera: valor }
    case 'FACULTAD':
      return { facultad: valor }
    case 'SEMESTRE':
      return { semestre: Number(valor) }
    case 'GRUPO':
      return { grupo: valor }
    case 'CAUSA':
      return { categoria: valor }
    case 'RIESGO':
      return { riesgo: valor as NivelRiesgo }
    default:
      return {}
  }
}

function nombreDeValor(dimension: DimensionComparacion, valor: string): string {
  if (dimension === 'SEMESTRE') return `${valor}° semestre`
  if (dimension === 'GRUPO') return `Grupo ${valor}`
  if (dimension === 'RIESGO') return ETIQUETA_RIESGO[valor] ?? valor
  return valor
}

/** Comparador dinámico: elige una dimensión y agrega tantos elementos como quieras con "+". */
function Comparador({
  esRector,
  opciones,
  onAbrir,
}: {
  esRector: boolean
  opciones: Record<DimensionComparacion, string[]>
  onAbrir: (titulo: string, filtros: FiltrosEstudiante) => void
}) {
  const dimensiones = esRector ? DIMENSIONES_RECTOR : DIMENSIONES_DECANO
  const [dimension, setDimension] = useState<DimensionComparacion>(esRector ? 'SEDE' : 'PROGRAMA')
  const [selecciones, setSelecciones] = useState<string[]>(() =>
    valoresIniciales(esRector ? 'SEDE' : 'PROGRAMA', opciones),
  )
  const [datos, setDatos] = useState<Record<string, Reporte | null>>({})
  const [cargando, setCargando] = useState(false)

  const disponibles = opciones[dimension] ?? []
  const etiquetaDimension = dimensiones.find((item) => item.valor === dimension)?.etiqueta ?? 'Elemento'
  const puedeAgregar = selecciones.length < disponibles.length

  useEffect(() => {
    let activo = true
    setCargando(true)
    Promise.all(
      selecciones.map(async (valor) => {
        try {
          const reporte = await reportesApi.obtener(filtrosDe(dimension, valor))
          return [valor, reporte] as const
        } catch {
          return [valor, null] as const
        }
      }),
    )
      .then((pares) => {
        if (activo) setDatos(Object.fromEntries(pares))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [dimension, selecciones])

  const cambiarDimension = (nueva: DimensionComparacion) => {
    setDimension(nueva)
    setSelecciones(valoresIniciales(nueva, opciones))
    setDatos({})
  }

  const cambiarSeleccion = (indice: number, valor: string) => {
    setSelecciones((actuales) => actuales.map((item, i) => (i === indice ? valor : item)))
  }

  const agregarSeleccion = () => {
    const siguiente = disponibles.find((opcion) => !selecciones.includes(opcion))
    if (siguiente) setSelecciones((actuales) => [...actuales, siguiente])
  }

  const quitarSeleccion = (indice: number) => {
    setSelecciones((actuales) => actuales.filter((_, i) => i !== indice))
  }

  const columna = (valor: string, nombre: string, reporte: Reporte | null) => {
    const total = reporte?.totalEstudiantes ?? 0
    const parte = (valorRiesgo: number) => (total === 0 ? 0 : Math.round((valorRiesgo / total) * 1000) / 10)
    const desercion = total === 0 ? 0 : Math.round(((reporte?.retirados ?? 0) / total) * 1000) / 10
    const abrirRiesgo = (nivel: NivelRiesgo) => {
      onAbrir(`${nombre} · Riesgo ${nivel.toLowerCase()}`, {
        ...filtrosDe(dimension, valor),
        riesgo: nivel,
      })
    }
    return (
      <div
        className="comparador__columna comparador__columna--clic"
        key={nombre}
        role="button"
        tabIndex={0}
        onClick={() => onAbrir(nombre, filtrosDe(dimension, valor))}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault()
            onAbrir(nombre, filtrosDe(dimension, valor))
          }
        }}
        title={`Ver estudiantes de ${nombre}`}
      >
        <strong>{nombre}</strong>
        <span className="comparador__total">{total.toLocaleString('es-CO')} estudiantes</span>
        <div className="comparador__barra">
          <i
            style={{ width: `${parte(reporte?.riesgoAlto ?? 0)}%`, background: COLOR_RIESGO.ALTO }}
            onClick={(evento) => {
              evento.stopPropagation()
              abrirRiesgo('ALTO')
            }}
            title="Ver riesgo alto"
          />
          <i
            style={{ width: `${parte(reporte?.riesgoMedio ?? 0)}%`, background: COLOR_RIESGO.MEDIO }}
            onClick={(evento) => {
              evento.stopPropagation()
              abrirRiesgo('MEDIO')
            }}
            title="Ver riesgo medio"
          />
          <i
            style={{ width: `${parte(reporte?.riesgoBajo ?? 0)}%`, background: COLOR_RIESGO.BAJO }}
            onClick={(evento) => {
              evento.stopPropagation()
              abrirRiesgo('BAJO')
            }}
            title="Ver riesgo bajo"
          />
        </div>
        <div className="comparador__cifras">
          <span onClick={(evento) => { evento.stopPropagation(); abrirRiesgo('ALTO') }}>
            <i style={{ background: COLOR_RIESGO.ALTO }} /> Alto <strong>{reporte?.riesgoAlto ?? 0}</strong>
          </span>
          <span onClick={(evento) => { evento.stopPropagation(); abrirRiesgo('MEDIO') }}>
            <i style={{ background: COLOR_RIESGO.MEDIO }} /> Medio <strong>{reporte?.riesgoMedio ?? 0}</strong>
          </span>
          <span onClick={(evento) => { evento.stopPropagation(); abrirRiesgo('BAJO') }}>
            <i style={{ background: COLOR_RIESGO.BAJO }} /> Bajo <strong>{reporte?.riesgoBajo ?? 0}</strong>
          </span>
        </div>
        <div className="comparador__extra">
          <span>Promedio <strong>{reporte?.promedioGeneral ?? 0}</strong></span>
          <span>Deserción <strong>{desercion}%</strong></span>
          <span>Faltas <strong>{reporte?.totalFaltas ?? 0}</strong></span>
        </div>
        <span className="comparador__pista">
          Ver estudiantes <Icon name="arrowRight" size={12} />
        </span>
      </div>
    )
  }

  return (
    <article className="panel panel--comparador">
      <header className="panel__cabecera">
        <div>
          <h3>Comparador de datos</h3>
          <p>
            Elige qué comparar y usa el botón <strong>+</strong> para agregar más elementos.
          </p>
        </div>
        {cargando && <span className="panel__etiqueta">Calculando…</span>}
      </header>

      <div className="comparador__dimensiones" role="tablist" aria-label="Dimensión de comparación">
        {dimensiones.map((item) => (
          <button
            key={item.valor}
            type="button"
            role="tab"
            aria-selected={dimension === item.valor}
            className={`comparador__dimension${dimension === item.valor ? ' comparador__dimension--activa' : ''}`}
            onClick={() => cambiarDimension(item.valor)}
          >
            <Icon name={item.icono} size={15} /> {item.etiqueta}
          </button>
        ))}
      </div>

      <div className="comparador__selectores comparador__selectores--multi">
        {selecciones.map((valor, indice) => (
          <div className="comparador__selector-fila" key={`${dimension}-${indice}`}>
            <label className="filtro-select">
              <Icon name={dimensiones.find((item) => item.valor === dimension)?.icono ?? 'filter'} size={16} />
              <select
                value={valor}
                onChange={(evento) => cambiarSeleccion(indice, evento.target.value)}
                aria-label={`${etiquetaDimension} ${indice + 1}`}
              >
                {disponibles.map((opcion) => (
                  <option key={opcion} value={opcion}>{nombreDeValor(dimension, opcion)}</option>
                ))}
              </select>
              <Icon name="chevronDown" size={14} />
            </label>
            {selecciones.length > 1 && (
              <button
                type="button"
                className="comparador__quitar"
                onClick={() => quitarSeleccion(indice)}
                aria-label={`Quitar ${nombreDeValor(dimension, valor)}`}
              >
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="comparador__agregar"
          onClick={agregarSeleccion}
          disabled={!puedeAgregar}
          title={`Agregar otro ${etiquetaDimension.toLowerCase()}`}
        >
          <Icon name="plus" size={17} /> Agregar {etiquetaDimension.toLowerCase()}
        </button>
      </div>

      {disponibles.length === 0 ? (
        <p className="comparador__vacio">No hay opciones disponibles para esta dimensión.</p>
      ) : (
        <div className="comparador comparador--multiple">
          {selecciones.map((valor) =>
            columna(valor, nombreDeValor(dimension, valor), datos[valor] ?? null),
          )}
        </div>
      )}
    </article>
  )
}

function valoresIniciales(
  dimension: DimensionComparacion,
  opciones: Record<DimensionComparacion, string[]>,
): string[] {
  const disponibles = opciones[dimension] ?? []
  if (disponibles.length === 0) return ['']
  if (dimension === 'SEDE') {
    const preferidas = ['Pasto', 'Bogotá'].filter((sede) => disponibles.includes(sede))
    const resto = disponibles.filter((sede) => !preferidas.includes(sede))
    return [...preferidas, ...resto].slice(0, 2)
  }
  return disponibles.slice(0, 2)
}

export function Dashboard() {
  const { sesion } = useAuth()
  const { mostrarToast } = useToast()
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null)
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [prioritarios, setPrioritarios] = useState<Estudiante[]>([])
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState('')
  const [sede, setSede] = useState('')
  const [facultad, setFacultad] = useState('')
  const [programa, setPrograma] = useState('')
  const [semestre, setSemestre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [riesgo, setRiesgo] = useState('')
  const [grupo, setGrupo] = useState('')
  const [seleccion, setSeleccion] = useState<SeleccionGrafica | null>(null)
  const [modal, setModal] = useState<ModalAbierto | null>(null)

  useEffect(() => {
    let vigente = true
    catalogosApi
      .obtener()
      .then((datos) => {
        if (vigente) setCatalogo(datos)
      })
      .catch(() => {
        if (vigente) setCatalogo(null)
      })
    return () => {
      vigente = false
    }
  }, [])

  const filtrosBase: FiltrosEstudiante = {
    sede: sede || undefined,
    facultad: facultad || undefined,
    carrera: programa || undefined,
    semestre: semestre ? Number(semestre) : undefined,
    categoria: categoria || undefined,
    riesgo: (riesgo as NivelRiesgo) || undefined,
    grupo: grupo || undefined,
  }

  useEffect(() => {
    let activo = true
    setActualizando(true)
    setError('')
    const filtros: FiltrosReporte = {
      sede: sede || undefined,
      facultad: facultad || undefined,
      carrera: programa || undefined,
      semestre: semestre ? Number(semestre) : undefined,
      categoria: categoria || undefined,
      riesgo: (riesgo as NivelRiesgo) || undefined,
      grupo: grupo || undefined,
    }
    Promise.all([
      reportesApi.obtener(filtros),
      estudiantesApi.listar({ ...filtros, riesgo: 'ALTO', limit: 5 }),
    ])
      .then(([datosReporte, casos]) => {
        if (!activo) return
        setReporte(datosReporte)
        setPrioritarios(casos)
      })
      .catch((err) => {
        if (activo) setError(mensajeError(err))
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
          setActualizando(false)
        }
      })
    return () => {
      activo = false
    }
  }, [sede, facultad, programa, semestre, categoria, riesgo, grupo])

  const abrirLista = (titulo: string, extra: FiltrosEstudiante = {}) => {
    setModal({ titulo, filtros: { ...filtrosBase, ...extra } })
  }

  const limpiar = () => {
    setSede('')
    setFacultad('')
    setPrograma('')
    setSemestre('')
    setCategoria('')
    setRiesgo('')
    setGrupo('')
    setSeleccion(null)
  }

  const descargar = async (tipo: 'csv' | 'zip') => {
    try {
      const filtros = {
        sede: sede || undefined,
        facultad: facultad || undefined,
        carrera: programa || undefined,
        semestre: semestre ? Number(semestre) : undefined,
        grupo: grupo || undefined,
        riesgo: (riesgo as NivelRiesgo) || undefined,
      }
      if (tipo === 'zip') await descargasApi.todo(filtros)
      else await descargasApi.estudiantes(filtros)
      mostrarToast(tipo === 'zip' ? 'Descargamos el paquete completo.' : 'Descargamos el CSV de estudiantes.')
    } catch (err) {
      mostrarToast(mensajeError(err), 'error')
    }
  }

  if (cargando) return <Cargando texto="Preparando el panel de permanencia…" />

  if (error || !reporte) {
    return (
      <Vacio icono="alert" titulo="No se pudo cargar el panel" texto={error}>
        <button type="button" className="boton boton--primario" onClick={() => setSede(sede)}>
          <Icon name="refresh" size={16} /> Reintentar
        </button>
      </Vacio>
    )
  }

  const total = reporte.totalEstudiantes
  const porcentajeAlto = total ? Math.round((reporte.riesgoAlto / total) * 100) : 0
  const porcentajeMedio = total ? Math.round((reporte.riesgoMedio / total) * 100) : 0
  const primerCaso = prioritarios[0]
  const filtrosActivos = Boolean(sede || facultad || programa || semestre || categoria || riesgo || grupo)
  const esRector = sesion?.rol === 'RECTOR'
  const esDecano = sesion?.rol === 'DECANO'
  const mostrarFacultad =
    sesion?.rol !== 'PROFESOR' && sesion?.rol !== 'JEFE_PROGRAMA' && (catalogo?.facultades.length ?? 0) > 1
  const sedeFija = catalogo?.sedeFija ?? null
  const programaFijo = catalogo?.programaFijo ?? null

  const abrirRiesgo = (nivel: NivelRiesgo) => {
    setSeleccion({ riesgo: nivel })
    abrirLista(`Riesgo ${nivel.toLowerCase()}`, {
      riesgo: nivel,
      semestre: undefined,
      carrera: undefined,
      categoria: undefined,
    })
  }

  return (
    <div className="pagina pagina--panel">
      <section className="bienvenida">
        <div className="bienvenida__texto">
          <span className="bienvenida__saludo">Hola, {sesion?.nombre ?? 'profe'} 👋</span>
          <h2>Hoy puedes cambiar el rumbo de una historia.</h2>
          <p>
            {total > 0 ? (
              <>
                Hay <strong>{reporte.riesgoAlto.toLocaleString('es-CO')} estudiantes en riesgo alto</strong> y{' '}
                <strong>{reporte.riesgoMedio.toLocaleString('es-CO')} en riesgo medio</strong>. La causa
                principal es <strong>{reporte.categoriaPrincipal.toLowerCase()}</strong>.
              </>
            ) : (
              <>No hay estudiantes con los filtros seleccionados.</>
            )}
          </p>
          <div className="bienvenida__acciones">
            <button
              type="button"
              className="boton boton--primario"
              onClick={() => abrirLista('Casos prioritarios', { riesgo: 'ALTO' })}
            >
              Ver casos prioritarios <Icon name="arrowRight" size={17} />
            </button>
            <Link to="/reportes" className="boton boton--secundario">
              Explorar estadísticas
            </Link>
            <button type="button" className="boton boton--secundario" onClick={() => void descargar('csv')}>
              <Icon name="download" size={16} /> Descargar CSV
            </button>
            <button type="button" className="boton boton--secundario" onClick={() => void descargar('zip')}>
              <Icon name="download" size={16} /> Descargar todo (.zip)
            </button>
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

      <section className="filtros filtros--panel" aria-label="Filtros del panel">
        <div className="filtros__selects">
          {esDecano ? null : sedeFija ? (
            <span className="filtro-fijo">
              <Icon name="mapPin" size={16} /> Sede: {sedeFija}
            </span>
          ) : (
            <label className="filtro-select">
              <Icon name="mapPin" size={16} />
              <select value={sede} onChange={(evento) => setSede(evento.target.value)} aria-label="Sede">
                <option value="">
                  {esRector ? 'General · todas las sedes' : 'Todas las sedes'}
                </option>
                {(catalogo?.sedes ?? []).map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
              <Icon name="chevronDown" size={14} />
            </label>
          )}
          {programaFijo ? (
            <span className="filtro-fijo">
              <Icon name="cap" size={16} /> {programaFijo}
            </span>
          ) : (
            <label className="filtro-select">
              <Icon name="cap" size={16} />
              <select value={programa} onChange={(evento) => setPrograma(evento.target.value)} aria-label="Programa">
                <option value="">Todos los programas</option>
                {(catalogo?.programas ?? []).map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
              <Icon name="chevronDown" size={14} />
            </label>
          )}
          {mostrarFacultad && (
            <label className="filtro-select">
              <Icon name="book" size={16} />
              <select value={facultad} onChange={(evento) => setFacultad(evento.target.value)} aria-label="Facultad">
                <option value="">Todas las facultades</option>
                {(catalogo?.facultades ?? []).map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
              <Icon name="chevronDown" size={14} />
            </label>
          )}
          <label className="filtro-select">
            <Icon name="book" size={16} />
            <select value={semestre} onChange={(evento) => setSemestre(evento.target.value)} aria-label="Semestre">
              <option value="">Todos los semestres</option>
              {(catalogo?.semestres ?? []).map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}° semestre</option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          <label className="filtro-select">
            <Icon name="users" size={16} />
            <select value={grupo} onChange={(evento) => setGrupo(evento.target.value)} aria-label="Grupo">
              <option value="">Todos los grupos</option>
              {(catalogo?.grupos ?? ['A', 'B']).map((opcion) => (
                <option key={opcion} value={opcion}>Grupo {opcion}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          <label className="filtro-select">
            <Icon name="heart" size={16} />
            <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)} aria-label="Causa">
              <option value="">Todas las causas</option>
              {(catalogo?.categorias ?? []).map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          <label className="filtro-select">
            <Icon name="alert" size={16} />
            <select value={riesgo} onChange={(evento) => setRiesgo(evento.target.value)} aria-label="Riesgo">
              <option value="">Todos los riesgos</option>
              <option value="ALTO">Riesgo alto</option>
              <option value="MEDIO">Riesgo medio</option>
              <option value="BAJO">Riesgo bajo</option>
            </select>
            <Icon name="chevronDown" size={14} />
          </label>
          {filtrosActivos && (
            <button type="button" className="boton-texto filtros__limpiar" onClick={limpiar}>
              <Icon name="close" size={14} /> Limpiar filtros
            </button>
          )}
        </div>
        <span className={`actualizacion${actualizando ? ' actualizacion--activa' : ''}`}>
          {actualizando ? 'Actualizando…' : `Mostrando ${total.toLocaleString('es-CO')} estudiantes`}
        </span>
      </section>

      <section className="tarjetas-resumen" aria-label="Resumen del semestre">
        <TarjetaResumen
          icono="users"
          etiqueta="Estudiantes"
          valor={total.toLocaleString('es-CO')}
          detalle={`${reporte.activos.toLocaleString('es-CO')} activos · ${reporte.aplazados.toLocaleString('es-CO')} aplazados`}
          tono="verde"
          onClick={() => abrirLista('Todos los estudiantes')}
        />
        <TarjetaResumen
          icono="alert"
          etiqueta="Riesgo alto"
          valor={reporte.riesgoAlto.toLocaleString('es-CO')}
          detalle={`${porcentajeAlto}% del total requiere atención`}
          tono="rojo"
          onClick={() => abrirRiesgo('ALTO')}
        />
        <TarjetaResumen
          icono="activity"
          etiqueta="Riesgo medio"
          valor={reporte.riesgoMedio.toLocaleString('es-CO')}
          detalle={`${porcentajeMedio}% conviene seguir de cerca`}
          tono="ambar"
          onClick={() => abrirRiesgo('MEDIO')}
        />
        <TarjetaResumen
          icono="trend"
          etiqueta="Deserción"
          valor={`${reporte.porcentajeDesercion}%`}
          detalle={`${reporte.retirados.toLocaleString('es-CO')} retirados · promedio ${reporte.promedioGeneral}`}
          tono="azul"
          onClick={() => abrirLista('Estudiantes retirados', { estado: 'RETIRADO' })}
        />
      </section>

      <article className="panel panel--grupos">
        <header className="panel__cabecera">
          <div>
            <h3>Grupos A y B del semestre</h3>
            <p>Cada semestre se divide en dos grupos. Haz clic para filtrar sus estudiantes.</p>
          </div>
          <span className="panel__etiqueta">{reporte.porGrupo.length} grupos</span>
        </header>
        <div className="grupos-resumen">
          {reporte.porGrupo.map((item) => (
            <button
              key={item.grupo}
              type="button"
              className={`grupo-tarjeta${grupo === item.grupo ? ' grupo-tarjeta--activo' : ''}`}
              onClick={() => {
                setGrupo(grupo === item.grupo ? '' : item.grupo)
                if (grupo !== item.grupo) {
                  abrirLista(`Grupo ${item.grupo}`, { grupo: item.grupo })
                }
              }}
            >
              <span className="grupo-tarjeta__letra">{item.grupo}</span>
              <div>
                <strong>{item.total.toLocaleString('es-CO')} estudiantes</strong>
                <span>
                  {item.alto.toLocaleString('es-CO')} en riesgo alto ·{' '}
                  {item.total ? Math.round((item.alto / item.total) * 100) : 0}%
                </span>
              </div>
              <div className="grupo-tarjeta__barra">
                <i style={{ width: `${item.total ? (item.alto / item.total) * 100 : 0}%`, background: COLOR_RIESGO.ALTO }} />
                <i style={{ width: `${item.total ? (item.medio / item.total) * 100 : 0}%`, background: COLOR_RIESGO.MEDIO }} />
                <i style={{ width: `${item.total ? (item.bajo / item.total) * 100 : 0}%`, background: COLOR_RIESGO.BAJO }} />
              </div>
            </button>
          ))}
        </div>
      </article>

      <div className="panel-grid panel-grid--dos-uno">
        <article className="panel">
          <header className="panel__cabecera">
            <div>
              <h3>Riesgo por semestre</h3>
              <p>Haz clic en un segmento para ver sus estudiantes.</p>
            </div>
            <LeyendaRiesgo />
          </header>
          <div className="grafica grafica--semestres">
            <GraficaSemestres
              datos={reporte.porSemestre}
              seleccion={seleccion}
              onSegmento={(nivel, valorSemestre) => {
                setSeleccion({ riesgo: nivel, semestre: valorSemestre })
                abrirLista(`Riesgo ${nivel.toLowerCase()} · ${valorSemestre}° semestre`, {
                  riesgo: nivel,
                  semestre: valorSemestre,
                  carrera: undefined,
                  categoria: undefined,
                })
              }}
            />
          </div>
        </article>

        <article className="panel">
          <header className="panel__cabecera">
            <div>
              <h3>Distribución del riesgo</h3>
              <p>Haz clic en un color para ver esos estudiantes.</p>
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

      <div className="panel-grid panel-grid--dos-uno">
        <article className="panel">
          <header className="panel__cabecera">
            <div>
              <h3>Causas que más pesan</h3>
              <p>Haz clic en una causa para ver sus estudiantes.</p>
            </div>
            <Link to="/reportes" className="enlace-sutil">
              Ver detalle <Icon name="arrowRight" size={14} />
            </Link>
          </header>
          <div className="grafica grafica--categorias">
            <GraficaCategorias
              datos={reporte.porCategoria}
              seleccion={seleccion}
              onCategoria={(valorCategoria) => {
                setSeleccion({ categoria: valorCategoria })
                abrirLista(`Causa: ${valorCategoria}`, {
                  categoria: valorCategoria,
                  riesgo: undefined,
                  semestre: undefined,
                  carrera: undefined,
                })
              }}
            />
          </div>
        </article>

        <article className="panel panel--lista">
          <header className="panel__cabecera">
            <div>
              <h3>Necesitan atención hoy</h3>
              <p>Los casos con mayor puntaje de riesgo.</p>
            </div>
            <button
              type="button"
              className="enlace-sutil"
              onClick={() => abrirLista('Casos prioritarios', { riesgo: 'ALTO' })}
            >
              Ver todos <Icon name="arrowRight" size={14} />
            </button>
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
                    {estudiante.carrera} · {estudiante.sede} · {estudiante.semestre}° semestre
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
              <p>Haz clic en un segmento para ver esos estudiantes.</p>
            </div>
            <LeyendaRiesgo />
          </header>
          <div className="grafica grafica--carreras">
            <GraficaCarreras
              datos={reporte.porCarrera}
              seleccion={seleccion}
              onSegmento={(nivel, valorCarrera) => {
                setSeleccion({ riesgo: nivel, carrera: valorCarrera })
                abrirLista(`${valorCarrera} · Riesgo ${nivel.toLowerCase()}`, {
                  riesgo: nivel,
                  carrera: valorCarrera,
                  semestre: undefined,
                  categoria: undefined,
                })
              }}
            />
          </div>
        </article>

        <article className="panel panel--seguimiento">
          <header className="panel__cabecera">
            <div>
              <h3>Semáforo del semestre</h3>
              <p>Haz clic en un nivel para ver esos casos.</p>
            </div>
          </header>
          <div className="seguimiento">
            <button type="button" className="seguimiento__fila seguimiento__fila--clic" onClick={() => abrirRiesgo('ALTO')}>
              <span className="seguimiento__punto seguimiento__punto--rojo" />
              <div>
                <strong>{reporte.riesgoAlto.toLocaleString('es-CO')} casos críticos</strong>
                <span>Requieren contacto en las próximas 48 horas.</span>
              </div>
              <Icon name="arrowRight" size={15} />
            </button>
            <button type="button" className="seguimiento__fila seguimiento__fila--clic" onClick={() => abrirRiesgo('MEDIO')}>
              <span className="seguimiento__punto seguimiento__punto--ambar" />
              <div>
                <strong>{reporte.riesgoMedio.toLocaleString('es-CO')} en observación</strong>
                <span>Conviene revisar asistencia y promedio esta semana.</span>
              </div>
              <Icon name="arrowRight" size={15} />
            </button>
            <button type="button" className="seguimiento__fila seguimiento__fila--clic" onClick={() => abrirRiesgo('BAJO')}>
              <span className="seguimiento__punto seguimiento__punto--verde" />
              <div>
                <strong>{reporte.riesgoBajo.toLocaleString('es-CO')} estables</strong>
                <span>Mantener el vínculo y reconocer sus avances.</span>
              </div>
              <Icon name="arrowRight" size={15} />
            </button>
            <div className="seguimiento__pie">
              <Icon name="clock" size={15} />
              <span>Actualizado {hace(new Date().toISOString())}</span>
            </div>
          </div>
        </article>
      </div>

      {(esRector || esDecano) && catalogo && (
        <Comparador
          esRector={esRector}
          opciones={{
            SEDE: catalogo.sedes,
            PROGRAMA: catalogo.programas,
            FACULTAD: catalogo.facultades,
            SEMESTRE: catalogo.semestres.map(String),
            GRUPO: catalogo.grupos,
            CAUSA: catalogo.categorias,
            RIESGO: ['ALTO', 'MEDIO', 'BAJO'],
          }}
          onAbrir={abrirLista}
        />
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
