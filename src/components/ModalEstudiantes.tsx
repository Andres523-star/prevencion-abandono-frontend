import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { estudiantesApi, mensajeError } from '../services/api'
import type { Estudiante, FiltrosEstudiante } from '../types'
import { nombreCompleto } from '../utils/format'
import { Icon } from './Icon'
import { Avatar, Cargando, Modal, RiesgoBadge, Vacio } from './Ui'

interface Props {
  abierto: boolean
  titulo: string
  descripcion?: string
  filtros: FiltrosEstudiante
  onCerrar: () => void
}

/** Lista de estudiantes que se abre al hacer clic en una tarjeta o en una gráfica. */
const TAMANO_PAGINA = 200

export function ModalEstudiantes({ abierto, titulo, descripcion, filtros, onCerrar }: Props) {
  const [lista, setLista] = useState<Estudiante[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [visibles, setVisibles] = useState(TAMANO_PAGINA)

  const { search, carrera, sede, facultad, semestre, categoria, riesgo, estado } = filtros

  useEffect(() => {
    if (!abierto) return
    let vigente = true
    setCargando(true)
    setError('')
    setVisibles(TAMANO_PAGINA)
    estudiantesApi
      .listar({ search, carrera, sede, facultad, semestre, categoria, riesgo, estado, limit: 500 })
      .then((datos) => {
        if (vigente) setLista(datos)
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
  }, [abierto, search, carrera, sede, facultad, semestre, categoria, riesgo, estado])

  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      descripcion={descripcion ?? (cargando ? 'Buscando estudiantes…' : `${lista.length} estudiantes encontrados${lista.length >= 500 ? ' · muestra de mayor riesgo' : ''}`)}
      onCerrar={onCerrar}
      ancho="amplio"
      pie={
        <div className="modal__pie-resumen">
          <Icon name="users" size={16} />
          <span>
            {lista.length.toLocaleString('es-CO')} fichas priorizadas por riesgo
            {lista.length >= 500 ? ' · muestra máxima de 500 sobre el total filtrado' : ''}
          </span>
        </div>
      }
    >
      {cargando ? (
        <Cargando texto="Cargando estudiantes…" />
      ) : error ? (
        <Vacio icono="alert" titulo="No se pudo cargar la lista" texto={error} />
      ) : lista.length === 0 ? (
        <Vacio
          icono="search"
          titulo="No hay estudiantes con estos criterios"
          texto="Prueba con otro semestre, causa o nivel de riesgo."
        />
      ) : (
        <div className="lista-prioritarios lista-prioritarios--modal">
          {lista.slice(0, visibles).map((estudiante) => (
            <Link
              key={estudiante.id}
              to={`/estudiantes/${estudiante.id}`}
              className="fila-prioritaria"
              onClick={onCerrar}
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
          {lista.length > visibles && (
            <button
              type="button"
              className="boton boton--secundario modal__mas"
              onClick={() => setVisibles((actuales) => actuales + TAMANO_PAGINA)}
            >
              Mostrar más ({(lista.length - visibles).toLocaleString('es-CO')} restantes)
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}
