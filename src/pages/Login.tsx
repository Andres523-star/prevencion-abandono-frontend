import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthAside } from '../components/AuthAside'
import { Icon } from '../components/Icon'
import { mensajeError } from '../services/api'

const CUENTAS_DEMO = [
  { rol: 'Andrés Felipe', email: 'facb129@gmail.com', password: 'Permanencia2026' },
  { rol: 'Docente', email: 'esteban@universidad.edu.co', password: 'demo123' },
  { rol: 'Coordinación', email: 'coordinacion@universidad.edu.co', password: 'demo123' },
]

export function Login() {
  const { sesion, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('facb129@gmail.com')
  const [password, setPassword] = useState('Permanencia2026')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  if (sesion) return <Navigate to="/" replace />

  const destino = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/'

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setError('')
    setCargando(true)
    try {
      await iniciarSesion(email.trim(), password)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  const usarCuenta = (cuenta: (typeof CUENTAS_DEMO)[number]) => {
    setEmail(cuenta.email)
    setPassword(cuenta.password)
    setError('')
  }

  return (
    <div className="auth-pagina">
      <AuthAside />

      <main className="auth-formulario-panel">
        <div className="auth-formulario">
          <header className="auth-formulario__cabecera">
            <p className="auth-formulario__eyebrow">Bienvenido de nuevo</p>
            <h2>Inicia sesión</h2>
            <p>Entra para revisar cómo están tus estudiantes hoy.</p>
          </header>

          <form onSubmit={enviar} className="formulario">
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

            <label className="campo">
              <span>Contraseña</span>
              <div className="campo__control">
                <Icon name="shield" size={18} />
                <input
                  type={verPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
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

            {error && (
              <p className="mensaje-error" role="alert">
                <Icon name="alert" size={16} /> {error}
              </p>
            )}

            <button type="submit" className="boton boton--primario boton--bloque" disabled={cargando}>
              {cargando ? 'Entrando…' : 'Entrar a la plataforma'}
              {!cargando && <Icon name="arrowRight" size={18} />}
            </button>
          </form>

          <div className="cuentas-demo">
            <div className="cuentas-demo__titulo">
              <span>Acceso rápido para la demo</span>
              <span className="linea" />
            </div>
            <div className="cuentas-demo__botones">
              {CUENTAS_DEMO.map((cuenta) => (
                <button
                  key={cuenta.email}
                  type="button"
                  className="cuenta-demo"
                  onClick={() => usarCuenta(cuenta)}
                >
                  <Icon name="user" size={16} />
                  <span>
                    <strong>{cuenta.rol}</strong>
                    <small>{cuenta.email}</small>
                  </span>
                </button>
              ))}
            </div>
            <p className="cuentas-demo__nota">Contraseña para ambas cuentas: <code>demo123</code></p>
          </div>

          <p className="auth-enlace">
            ¿No tienes cuenta? <Link to="/registro">Crea una cuenta de docente</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
