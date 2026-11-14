import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { iaApi, mensajeError } from '../services/api'
import type { CapacidadesIA, MensajeHistorialIA } from '../types'
import { Icon } from './Icon'

interface MensajeIA {
  autor: 'IA' | 'YO'
  texto: string
  permitido?: boolean
}

const BIENVENIDA_INSTITUCIONAL =
  'Hola, soy tu asistente de permanencia. Puedo revisar riesgo, faltas, grupos y materias dentro de tu alcance. ¿Qué quieres consultar?'

const BIENVENIDA_ESTUDIANTE =
  'Hola. Este es un espacio privado entre tú y yo. Cuéntame cómo va tu semestre, qué materia te preocupa o cómo te sientes; tu historial es confidencial y no lo ven otros roles.'

const sugerenciasInstitucionales = [
  '¿Cómo está el riesgo en mi alcance?',
  '¿Qué estudiantes tienen más faltas?',
  'Compara los grupos A y B',
  '¿Qué materias están por debajo de 3.0?',
  '¿Cómo están los programas de mi sede?',
  '¿Qué estudiantes debo citar esta semana?',
]

const sugerenciasProfesor = [
  '¿Qué estudiantes debo citar esta semana?',
  '¿Cómo están mis grupos A y B?',
  '¿Quiénes tienen más faltas en mis semestres?',
  '¿Qué materias están en alerta?',
  '¿Cómo está el riesgo en mi programa?',
  'Compara mis grupos con el promedio del programa',
  '¿Qué estudiantes tienen riesgo alto?',
  '¿Cómo van mis cohortes de primero y quinto?',
]

const sugerenciasEstudiante = [
  '¿Cómo va mi semestre?',
  '¿Cuál es mi promedio actual?',
  '¿Cómo voy en cada materia?',
  '¿Cómo voy en Redes de Computadores?',
  '¿Cuándo es mi próxima cita?',
  '¿Qué materias debo reforzar?',
  '¿Cuántas faltas tengo?',
  '¿Cómo justifico una falta?',
  '¿Cómo ha cambiado mi riesgo?',
  'Me siento desmotivado',
]

function fechaCorta(iso: string) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  return `${fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
  })} · ${fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
}

type TamanoIA = 'compacto' | 'normal' | 'grande' | 'extra'

const TAMANOS_IA: TamanoIA[] = ['compacto', 'normal', 'grande', 'extra']

/** Recupera el tamaño elegido para el botón y el panel del asistente. */
function tamanoGuardado(): TamanoIA {
  const valor = window.localStorage.getItem('permanencia-ia-tamano')
  return valor === 'compacto' || valor === 'grande' || valor === 'extra' ? valor : 'normal'
}

/**
 * Chat de IA flotante disponible para todos los roles.
 *
 * <p>Las respuestas respetan la jerarquía de la cuenta. El estudiante tiene un modo personal y
 * confidencial: su historial no se mezcla con el de profesores ni administrativos. Todos los roles
 * pueden consultar y borrar su propio historial.</p>
 */
export function IaChat() {
  const { sesion } = useAuth()
  const esEstudiante = sesion?.rol === 'ESTUDIANTE'
  const esProfesor = sesion?.rol === 'PROFESOR'
  const bienvenida = useMemo(
    () => (esEstudiante ? BIENVENIDA_ESTUDIANTE : BIENVENIDA_INSTITUCIONAL),
    [esEstudiante],
  )
  const sugerencias = esEstudiante
    ? sugerenciasEstudiante
    : esProfesor
      ? sugerenciasProfesor
      : sugerenciasInstitucionales

  const [abierto, setAbierto] = useState(false)
  const [vista, setVista] = useState<'chat' | 'historial'>('chat')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [capacidades, setCapacidades] = useState<CapacidadesIA | null>(null)
  const [historial, setHistorial] = useState<MensajeHistorialIA[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [mensajes, setMensajes] = useState<MensajeIA[]>([{ autor: 'IA', texto: bienvenida }])
  const [tamano, setTamano] = useState<TamanoIA>(tamanoGuardado)
  const fin = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.localStorage.setItem('permanencia-ia-tamano', tamano)
  }, [tamano])

  const cambiarTamano = (delta: number) => {
    setTamano((actual) => {
      const indice = TAMANOS_IA.indexOf(actual)
      const siguiente = Math.min(TAMANOS_IA.length - 1, Math.max(0, indice + delta))
      return TAMANOS_IA[siguiente]
    })
  }

  const iconoTamano =
    tamano === 'extra' ? 31 : tamano === 'grande' ? 28 : tamano === 'compacto' ? 20 : 24

  // El sidebar puede abrir el asistente desde cualquier pantalla.
  useEffect(() => {
    const abrir = () => setAbierto(true)
    window.addEventListener('permanencia:abrir-ia', abrir)
    return () => window.removeEventListener('permanencia:abrir-ia', abrir)
  }, [])

  useEffect(() => {
    setMensajes([{ autor: 'IA', texto: bienvenida }])
  }, [bienvenida])

  useEffect(() => {
    if (!abierto) return
    iaApi
      .capacidades()
      .then((datos) => setCapacidades(datos))
      .catch(() => setCapacidades(null))
    void cargarHistorial(true)
  }, [abierto])

  useEffect(() => {
    if (abierto && vista === 'chat') fin.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, abierto, vista])

  const cargarHistorial = async (restaurarChat = false) => {
    setCargandoHistorial(true)
    try {
      const datos = await iaApi.historial()
      setHistorial(datos)
      if (restaurarChat) {
        setMensajes([
          { autor: 'IA', texto: bienvenida },
          ...datos.map((item) => ({ autor: item.autor, texto: item.texto })),
        ])
      }
    } catch {
      setHistorial([])
    } finally {
      setCargandoHistorial(false)
    }
  }

  const enviar = async (texto: string) => {
    const limpio = texto.trim()
    if (!limpio || enviando) return
    setMensajes((actuales) => [...actuales, { autor: 'YO', texto: limpio }])
    setMensaje('')
    setEnviando(true)
    try {
      const respuesta = await iaApi.consultar(limpio)
      setMensajes((actuales) => [
        ...actuales,
        { autor: 'IA', texto: respuesta.respuesta, permitido: respuesta.permitido },
      ])
      void cargarHistorial(false)
    } catch (err) {
      setMensajes((actuales) => [
        ...actuales,
        { autor: 'IA', texto: mensajeError(err), permitido: false },
      ])
    } finally {
      setEnviando(false)
    }
  }

  const limpiar = async () => {
    try {
      await iaApi.limpiarHistorial()
      setHistorial([])
      setMensajes([{ autor: 'IA', texto: bienvenida }])
      setVista('chat')
    } catch {
      // Si falla, conservamos el historial visible.
    }
  }

  return (
    <div className={`ia-chat${abierto ? ' ia-chat--abierto' : ''}`}>
      {abierto && (
        <section className={`ia-chat__panel ia-chat__panel--${tamano}`} aria-label="Asistente de IA">
          <header className="ia-chat__cabecera">
            <span className="ia-chat__avatar">
              <Icon name="sparkles" size={18} />
            </span>
            <div>
              <strong>Asistente Permanencia</strong>
              <span>
                {esEstudiante
                  ? 'Confidencial · solo tú ves este historial'
                  : capacidades
                    ? `Rol ${capacidades.rol.toLowerCase()} · alcance aplicado`
                    : 'Conectando…'}
              </span>
            </div>
            <div className="ia-chat__tamano" role="group" aria-label="Tamaño del asistente">
              <button
                type="button"
                onClick={() => cambiarTamano(-1)}
                disabled={tamano === 'compacto'}
                aria-label="Reducir tamaño del asistente"
                title="Reducir tamaño"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => cambiarTamano(1)}
                disabled={tamano === 'extra'}
                aria-label="Aumentar tamaño del asistente"
                title="Aumentar tamaño"
              >
                A+
              </button>
            </div>
            <button
              type="button"
              className="boton-icono"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
            >
              <Icon name="close" size={17} />
            </button>
          </header>

          <div className="ia-chat__pestanas" role="tablist" aria-label="Vistas del asistente">
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'chat'}
              className={vista === 'chat' ? 'activa' : ''}
              onClick={() => setVista('chat')}
            >
              <Icon name="sparkles" size={13} /> Chat
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={vista === 'historial'}
              className={vista === 'historial' ? 'activa' : ''}
              onClick={() => {
                setVista('historial')
                void cargarHistorial(false)
              }}
            >
              <Icon name="clock" size={13} /> Historial
              {historial.length > 0 && <span className="ia-chat__contador">{historial.length}</span>}
            </button>
          </div>

          {vista === 'chat' ? (
            <>
              {capacidades && capacidades.capacidades.length > 0 && (
                <div className="ia-chat__capacidades">
                  {capacidades.capacidades.slice(0, 4).map((capacidad) => (
                    <span key={capacidad}>{capacidad}</span>
                  ))}
                </div>
              )}

              <div className="ia-chat__hilo">
                {mensajes.map((item, indice) => (
                  <div
                    key={`${item.autor}-${indice}`}
                    className={`ia-mensaje ia-mensaje--${item.autor === 'IA' ? 'ia' : 'yo'}${
                      item.permitido === false ? ' ia-mensaje--bloqueado' : ''
                    }`}
                  >
                    {item.texto}
                  </div>
                ))}
                {enviando && (
                  <div className="ia-mensaje ia-mensaje--ia ia-mensaje--pensando">Analizando…</div>
                )}
                <div ref={fin} />
              </div>

              <div className="ia-chat__sugerencias">
                {sugerencias.map((sugerencia) => (
                  <button key={sugerencia} type="button" onClick={() => enviar(sugerencia)}>
                    {sugerencia}
                  </button>
                ))}
              </div>

              <form
                className="ia-chat__entrada"
                onSubmit={(evento) => {
                  evento.preventDefault()
                  void enviar(mensaje)
                }}
              >
                <input
                  value={mensaje}
                  onChange={(evento) => setMensaje(evento.target.value)}
                  placeholder={
                    esEstudiante ? 'Cuéntame qué necesitas…' : 'Escribe tu pregunta…'
                  }
                  aria-label="Pregunta para la IA"
                />
                <button
                  type="submit"
                  disabled={enviando || !mensaje.trim()}
                  aria-label="Enviar pregunta"
                >
                  <Icon name="send" size={16} />
                </button>
              </form>
              <p className="ia-chat__nota">
                {esEstudiante
                  ? 'Conversación confidencial. Nadie más en la plataforma puede leer este historial.'
                  : 'La IA respeta tu jerarquía. Aún no está conectada a un modelo externo.'}
              </p>
            </>
          ) : (
            <div className="ia-chat__historial">
              <div className="ia-chat__historial-cabecera">
                <span>
                  {cargandoHistorial
                    ? 'Cargando…'
                    : `${historial.length} mensaje${historial.length === 1 ? '' : 's'} guardados`}
                </span>
                <button type="button" onClick={limpiar} disabled={historial.length === 0}>
                  Borrar historial
                </button>
              </div>
              <div className="ia-chat__historial-lista">
                {historial.length === 0 && !cargandoHistorial && (
                  <p className="ia-chat__vacio">
                    Aún no hay conversaciones guardadas. Tus preguntas y respuestas aparecerán aquí,
                    solo para ti.
                  </p>
                )}
                {historial.map((item) => (
                  <article
                    key={item.id}
                    className={`ia-historial__item ia-historial__item--${
                      item.autor === 'IA' ? 'ia' : 'yo'
                    }`}
                  >
                    <header>
                      <strong>{item.autor === 'IA' ? 'Asistente' : 'Tú'}</strong>
                      <span>{fechaCorta(item.fecha)}</span>
                    </header>
                    <p>{item.texto}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        className={`ia-chat__boton ia-chat__boton--${tamano}`}
        onClick={() => setAbierto((valor) => !valor)}
        aria-label={abierto ? 'Cerrar asistente de IA' : 'Abrir asistente de IA'}
        title={abierto ? 'Cerrar asistente' : 'Hablar con la IA'}
      >
        <Icon name={abierto ? 'close' : 'sparkles'} size={abierto ? 20 : iconoTamano} />
        {!abierto && <span>Hablar con la IA</span>}
      </button>
    </div>
  )
}
