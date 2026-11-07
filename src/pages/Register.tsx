import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthAside } from '../components/AuthAside'
import { Icon } from '../components/Icon'
import { mensajeError } from '../services/api'

export function Register() {
  const { sesion, registrarse } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [rol, setRol] = useState<'DOCENTE' | 'COORDINADOR'>('DOCENTE')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  if (sesion) return <Navigate to="/" replace />

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setError('')
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6 || !/\d/.test(password)) {
      setError('La contraseña debe tener al menos 6 caracteres y un número.')
      return
    }
    setCargando(true)
    try {
      await registrarse({ nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim(), password, rol })
      navigate('/', { replace: true })
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth-pagina">
      <AuthAside />

      <main className="auth-formulario-panel auth-formulario-panel--registro">
        <div className="auth-formulario">
          <header className="auth-formulario__cabecera">
            <p className="auth-formulario__eyebrow">Únete al acompañamiento</p>
            <h2>Crea tu cuenta</h2>
            <p>Un perfil nuevo dentro de la demo, listo para explorar la plataforma.</p>
          </header>

          <form onSubmit={enviar} className="formulario">
            <div className="formulario__fila">
              <label className="campo">
                <span>Nombre</span>
                <div className="campo__control">
                  <Icon name="user" size={18} />
                  <input
                    value={nombre}
                    onChange={(evento) => setNombre(evento.target.value)}
                    placeholder="Camila"
                    autoComplete="given-name"
                    required
                  />
                </div>
              </label>
              <label className="campo">
                <span>Apellido</span>
                <div className="campo__control">
                  <Icon name="user" size={18} />
                  <input
                    value={apellido}
                    onChange={(evento) => setApellido(evento.target.value)}
                    placeholder="Torres"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </label>
            </div>

            <label className="campo">
              <span>Correo institucional</span>
              <div className="campo__control">
                <Icon name="mail" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  placeholder="tu.nombre@universidad.edu.co"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <fieldset className="campo campo--rol">
              <legend>¿Cómo vas a usar la plataforma?</legend>
              <div className="selector-rol">
                <button
                  type="button"
                  className={`opcion-rol${rol === 'DOCENTE' ? ' opcion-rol--activa' : ''}`}
                  onClick={() => setRol('DOCENTE')}
                >
                  <Icon name="book" size={18} />
                  <span>
                    <strong>Docente</strong>
                    <small>Acompaño estudiantes</small>
                  </span>
                </button>
                <button
                  type="button"
                  className={`opcion-rol${rol === 'COORDINADOR' ? ' opcion-rol--activa' : ''}`}
                  onClick={() => setRol('COORDINADOR')}
                >
                  <Icon name="chart" size={18} />
                  <span>
                    <strong>Coordinación</strong>
                    <small>Analizo programas</small>
                  </span>
                </button>
              </div>
            </fieldset>

            <div className="formulario__fila">
              <label className="campo">
                <span>Contraseña</span>
                <div className="campo__control">
                  <Icon name="shield" size={18} />
                  <input
                    type={verPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(evento) => setPassword(evento.target.value)}
                    placeholder="Mínimo 6 y un número"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="campo__ojo"
                    onClick={() => setVerPassword((valor) => !valor)}
                    aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <Icon name="eye" size={17} />
                  </button>
                </div>
              </label>
              <label className="campo">
                <span>Confirmar contraseña</span>
                <div className="campo__control">
                  <Icon name="shield" size={18} />
                  <input
                    type={verPassword ? 'text' : 'password'}
                    value={confirmacion}
                    onChange={(evento) => setConfirmacion(evento.target.value)}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </label>
            </div>

            {error && (
              <p className="mensaje-error" role="alert">
                <Icon name="alert" size={16} /> {error}
              </p>
            )}

            <button type="submit" className="boton boton--primario boton--bloque" disabled={cargando}>
              {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
              {!cargando && <Icon name="arrowRight" size={18} />}
            </button>
          </form>

          <p className="auth-enlace">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
