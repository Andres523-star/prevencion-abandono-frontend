import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AuthAside } from '../components/AuthAside'
import { Icon } from '../components/Icon'
import { mensajeError } from '../services/api'
import {
  ETIQUETAS_ROL,
  ROLES_CON_SEDE,
  SEDES_UCC,
  type Rol,
} from '../types'

/** Orden de los roles en el selector de acceso. */
const ORDEN_ROLES: Rol[] = [
  'ESTUDIANTE',
  'PROFESOR',
  'JEFE_PROGRAMA',
  'COORDINADOR_SEDE',
  'DECANO',
  'RECTOR',
]

/** Cuentas ficticias para recorrer la demo sin escribir credenciales. */
const CUENTAS_DEMO: Array<{
  rol: Rol
  email: string
  password: string
  sede?: string
  etiqueta?: string
}> = [
  { rol: 'ESTUDIANTE', email: 'estudiante@ucc.edu.co', password: 'Estudiante2026', sede: 'Pasto' },
  { rol: 'PROFESOR', email: 'profesor@ucc.edu.co', password: 'Profesor2026', sede: 'Bogotá' },
  {
    rol: 'JEFE_PROGRAMA',
    email: 'jefe.programa@ucc.edu.co',
    password: 'Programa2026',
    sede: 'Medellín',
  },
  {
    rol: 'COORDINADOR_SEDE',
    email: 'coordinador.sede@ucc.edu.co',
    password: 'Coordinador2026',
    sede: 'Bogotá',
    etiqueta: 'Coordinador de Sede',
  },
  { rol: 'DECANO', email: 'decano@ucc.edu.co', password: 'Decano2026', sede: 'Pasto' },
  { rol: 'RECTOR', email: 'rector@ucc.edu.co', password: 'Rector2026' },
]

export function Login() {
  const { sesion, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [rol, setRol] = useState<Rol>('ESTUDIANTE')
  const [sede, setSede] = useState('Bogotá')
  const [email, setEmail] = useState(CUENTAS_DEMO[0].email)
  const [password, setPassword] = useState(CUENTAS_DEMO[0].password)
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  if (sesion) return <Navigate to="/" replace />

  const destino = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    || (rol === 'ESTUDIANTE' ? '/reportes' : '/')
  const requiereSede = ROLES_CON_SEDE.includes(rol)

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    setError('')
    setCargando(true)
    try {
      await iniciarSesion(email.trim(), password, rol, requiereSede ? sede : undefined)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  const elegirRol = (nuevoRol: Rol) => {
    setRol(nuevoRol)
    const cuenta = CUENTAS_DEMO.find((item) => item.rol === nuevoRol)
    if (cuenta) {
      setEmail(cuenta.email)
      setPassword(cuenta.password)
      if (cuenta.sede) setSede(cuenta.sede)
    }
    setError('')
  }

  const usarCuenta = (cuenta: (typeof CUENTAS_DEMO)[number]) => {
    setRol(cuenta.rol)
    setEmail(cuenta.email)
    setPassword(cuenta.password)
    if (cuenta.sede) setSede(cuenta.sede)
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
            <p>Elige tu rol: los datos que verás dependen de él.</p>
          </header>

          <form onSubmit={enviar} className="formulario" autoComplete="off">
            <label className="campo">
              <span>Rol de acceso</span>
              <div className="campo__control">
                <Icon name="shield" size={18} />
                <select value={rol} onChange={(evento) => elegirRol(evento.target.value as Rol)}>
                  {ORDEN_ROLES.map((valor) => (
                    <option key={valor} value={valor}>
                      {ETIQUETAS_ROL[valor]}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            {requiereSede && (
              <label className="campo">
                <span>Sede</span>
                <div className="campo__control">
                  <Icon name="mapPin" size={18} />
                  <select value={sede} onChange={(evento) => setSede(evento.target.value)}>
                    {SEDES_UCC.map((nombre) => (
                      <option key={nombre} value={nombre}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <small className="campo__ayuda">
                  {rol === 'DECANO'
                    ? 'El decano conserva la facultad completa en todas las sedes; la sede es solo referencial.'
                    : rol === 'ESTUDIANTE'
                      ? 'Tu cuenta está asociada a una sede; aquí puedes confirmarla.'
                      : 'La sede ajusta el alcance de los datos que verás.'}
                </small>
              </label>
            )}

            <label className="campo">
              <span>Correo institucional</span>
              <div className="campo__control">
                <Icon name="mail" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  placeholder="tu.nombre@ucc.edu.co"
                  autoComplete="off"
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
                  key={`${cuenta.rol}-${cuenta.sede ?? 'nacional'}`}
                  type="button"
                  className={`cuenta-demo${
                    rol === cuenta.rol && (!cuenta.sede || cuenta.sede === sede)
                      ? ' cuenta-demo--activa'
                      : ''
                  }`}
                  onClick={() => usarCuenta(cuenta)}
                  title={`${cuenta.email} · ${cuenta.password}`}
                >
                  <Icon name={cuenta.sede ? 'mapPin' : 'shield'} size={15} />
                  <span>
                    <strong>{cuenta.etiqueta ?? ETIQUETAS_ROL[cuenta.rol]}</strong>
                    <small>{cuenta.email}</small>
                    <small className="cuenta-demo__clave">
                      {cuenta.sede ? `${cuenta.sede} · ${cuenta.password}` : cuenta.password}
                    </small>
                  </span>
                </button>
              ))}
            </div>
            <p className="cuentas-demo__nota">
              Elige un cargo y el correo y la contraseña se completan solos. También puedes
              escribirlos a mano.
            </p>
          </div>

          <p className="auth-enlace">
            ¿No tienes cuenta? <Link to="/registro">Crea una cuenta</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
