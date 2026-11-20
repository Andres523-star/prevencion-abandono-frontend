import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthAside } from '../components/AuthAside'
import { Icon } from '../components/Icon'
import { authApi, mensajeError } from '../services/api'

export function Register() {
  const { sesion, registrarse } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  // El registro público solo crea profesores, atados a una sede y un programa del catálogo:
  // así una cuenta nueva no puede ver estudiantes de otras sedes o programas.
  const [opciones, setOpciones] = useState<Record<string, string[]>>({})
  const [sede, setSede] = useState('')
  const [programa, setPrograma] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    authApi
      .opcionesRegistro()
      .then((datos) => {
        if (activo) setOpciones(datos)
      })
      .catch((err: unknown) => {
        if (activo) setError(mensajeError(err))
      })
    return () => {
      activo = false
    }
  }, [])

  if (sesion) return <Navigate to="/" replace />

  const sedes = Object.keys(opciones)
  const programas = sede ? (opciones[sede] ?? []) : []

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setError('')
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8 || !/\d/.test(password) || !/\p{L}/u.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, con letras y números.')
      return
    }
    if (!sede || !programa) {
      setError('Selecciona la sede y el programa en los que dictas clase.')
      return
    }
    setCargando(true)
    try {
      await registrarse({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        sede,
        programa,
      })
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

            <div className="formulario__fila">
              <label className="campo">
                <span>Sede</span>
                <div className="campo__control">
                  <Icon name="mapPin" size={18} />
                  <select
                    value={sede}
                    onChange={(evento) => {
                      setSede(evento.target.value)
                      setPrograma('')
                    }}
                    required
                  >
                    <option value="">Selecciona tu sede</option>
                    {sedes.map((nombreSede) => (
                      <option key={nombreSede} value={nombreSede}>
                        {nombreSede}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="campo">
                <span>Programa</span>
                <div className="campo__control">
                  <Icon name="book" size={18} />
                  <select
                    value={programa}
                    onChange={(evento) => setPrograma(evento.target.value)}
                    disabled={!sede}
                    required
                  >
                    <option value="">{sede ? 'Selecciona el programa' : 'Primero elige la sede'}</option>
                    {programas.map((nombrePrograma) => (
                      <option key={nombrePrograma} value={nombrePrograma}>
                        {nombrePrograma}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
            <p className="campo__ayuda">
              Las cuentas nuevas son de profesor y solo ven los estudiantes de su programa en su sede.
            </p>

            <div className="formulario__fila">
              <label className="campo">
                <span>Contraseña</span>
                <div className="campo__control">
                  <Icon name="shield" size={18} />
                  <input
                    type={verPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(evento) => setPassword(evento.target.value)}
                    placeholder="Mínimo 8, letras y números"
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
