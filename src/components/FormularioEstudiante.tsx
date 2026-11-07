import { useState, type FormEvent } from 'react'
import { estudiantesApi, mensajeError } from '../services/api'
import type { Estudiante, EstadoEstudiante } from '../types'
import { CARRERAS, CATEGORIAS, SEMESTRES } from '../utils/format'
import { Icon } from './Icon'
import { Modal } from './Ui'
import { useToast } from './Toast'

interface FormularioEstudianteProps {
  abierto: boolean
  onCerrar: () => void
  onCreado: (estudiante: Estudiante) => void
}

export function FormularioEstudiante({ abierto, onCerrar, onCreado }: FormularioEstudianteProps) {
  const { mostrarToast } = useToast()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [cedula, setCedula] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [carrera, setCarrera] = useState<string>(CARRERAS[0])
  const [semestre, setSemestre] = useState(1)
  const [categoria, setCategoria] = useState<string>(CATEGORIAS[0])
  const [razon, setRazon] = useState('')
  const [promedio, setPromedio] = useState('3.5')
  const [faltas, setFaltas] = useState('0')
  const [estado, setEstado] = useState<EstadoEstudiante>('ACTIVO')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const limpiar = () => {
    setNombre('')
    setApellido('')
    setCedula('')
    setEmail('')
    setTelefono('')
    setCarrera(CARRERAS[0])
    setSemestre(1)
    setCategoria(CATEGORIAS[0])
    setRazon('')
    setPromedio('3.5')
    setFaltas('0')
    setEstado('ACTIVO')
    setError('')
  }

  const cerrar = () => {
    if (cargando) return
    onCerrar()
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setError('')
    const promedioNumero = Number.parseFloat(promedio)
    const faltasNumero = Number.parseInt(faltas, 10)
    if (Number.isNaN(promedioNumero) || promedioNumero < 0 || promedioNumero > 5) {
      setError('El promedio debe estar entre 0.0 y 5.0.')
      return
    }
    setCargando(true)
    try {
      const creado = await estudiantesApi.crear({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cedula: cedula.trim(),
        carrera,
        semestre,
        email: email.trim(),
        telefono: telefono.trim(),
        categoria,
        razon: razon.trim() || 'Sin razón registrada.',
        promedio: promedioNumero,
        faltas: Number.isNaN(faltasNumero) ? 0 : faltasNumero,
        estado,
      })
      mostrarToast(`${creado.nombre} ${creado.apellido} se agregó al grupo.`)
      limpiar()
      onCreado(creado)
      onCerrar()
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <Modal
      abierto={abierto}
      titulo="Nuevo estudiante"
      descripcion="Registra un caso para hacerle seguimiento dentro de la demo."
      onCerrar={cerrar}
      ancho="amplio"
      pie={
        <>
          <button type="button" className="boton boton--secundario" onClick={cerrar} disabled={cargando}>
            Cancelar
          </button>
          <button type="submit" form="formulario-estudiante" className="boton boton--primario" disabled={cargando}>
            {cargando ? 'Guardando…' : 'Guardar estudiante'}
            {!cargando && <Icon name="check" size={17} />}
          </button>
        </>
      }
    >
      <form id="formulario-estudiante" className="formulario" onSubmit={enviar}>
        <div className="formulario__fila">
          <label className="campo">
            <span>Nombre *</span>
            <div className="campo__control">
              <input
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                placeholder="Laura"
                required
              />
            </div>
          </label>
          <label className="campo">
            <span>Apellido *</span>
            <div className="campo__control">
              <input
                value={apellido}
                onChange={(evento) => setApellido(evento.target.value)}
                placeholder="Gómez"
                required
              />
            </div>
          </label>
        </div>

        <div className="formulario__fila">
          <label className="campo">
            <span>Cédula *</span>
            <div className="campo__control">
              <input
                value={cedula}
                onChange={(evento) => setCedula(evento.target.value)}
                placeholder="1000123456"
                required
              />
            </div>
          </label>
          <label className="campo">
            <span>Teléfono</span>
            <div className="campo__control">
              <input
                value={telefono}
                onChange={(evento) => setTelefono(evento.target.value)}
                placeholder="300 123 4567"
              />
            </div>
          </label>
        </div>

        <label className="campo">
          <span>Correo institucional</span>
          <div className="campo__control">
            <input
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="nombre.apellido@universidad.edu.co"
            />
          </div>
        </label>

        <div className="formulario__fila formulario__fila--tres">
          <label className="campo">
            <span>Programa *</span>
            <div className="campo__control">
              <select value={carrera} onChange={(evento) => setCarrera(evento.target.value)} required>
                {CARRERAS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="campo">
            <span>Semestre *</span>
            <div className="campo__control">
              <select
                value={semestre}
                onChange={(evento) => setSemestre(Number(evento.target.value))}
                required
              >
                {SEMESTRES.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}°
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="campo">
            <span>Estado</span>
            <div className="campo__control">
              <select
                value={estado}
                onChange={(evento) => setEstado(evento.target.value as EstadoEstudiante)}
              >
                <option value="ACTIVO">Activo</option>
                <option value="APLAZADO">Aplazado</option>
                <option value="RETIRADO">Retirado</option>
              </select>
            </div>
          </label>
        </div>

        <div className="formulario__fila formulario__fila--tres">
          <label className="campo">
            <span>Causa principal *</span>
            <div className="campo__control">
              <select value={categoria} onChange={(evento) => setCategoria(evento.target.value)} required>
                {CATEGORIAS.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="campo">
            <span>Promedio</span>
            <div className="campo__control">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={promedio}
                onChange={(evento) => setPromedio(evento.target.value)}
              />
            </div>
          </label>
          <label className="campo">
            <span>Faltas</span>
            <div className="campo__control">
              <input
                type="number"
                min="0"
                value={faltas}
                onChange={(evento) => setFaltas(evento.target.value)}
              />
            </div>
          </label>
        </div>

        <label className="campo">
          <span>Contexto del caso</span>
          <textarea
            value={razon}
            onChange={(evento) => setRazon(evento.target.value)}
            rows={3}
            placeholder="Describe brevemente la situación que está afectando al estudiante…"
          />
        </label>

        {error && (
          <p className="mensaje-error" role="alert">
            <Icon name="alert" size={16} /> {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
