import { Fragment, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { Avatar, Cargando } from '../components/Ui'
import { chatApi, mensajeError } from '../services/api'
import type { Mensaje } from '../types'
import { fechaCorta, hora } from '../utils/format'

const MAX_ARCHIVO = 5 * 1024 * 1024
const PROFESOR = { nombre: 'Carlos Andrés', apellido: 'Muñoz Ibarra' }
const SUGERENCIAS = [
  'Gracias profe, le cuento cómo me fue.',
  '¿Podemos agendar una cita esta semana?',
  'Tengo una duda con la entrega del proyecto.',
]

interface AdjuntoPendiente {
  nombreArchivo: string
  mime: string
  base64: string
  tamano: number
  esAudio: boolean
}

function leerBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => {
      const resultado = String(lector.result ?? '')
      const coma = resultado.indexOf(',')
      resolve(coma >= 0 ? resultado.slice(coma + 1) : resultado)
    }
    lector.onerror = () => reject(new Error('No se pudo leer el archivo'))
    lector.readAsDataURL(blob)
  })
}

function tamanoLegible(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Etiqueta del día para separar la conversación cuando hay mensajes de varias fechas. */
function etiquetaDia(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy'
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer'
  return fechaCorta(iso)
}

/** Conversación única del estudiante con su profesor acompañante. */
export function ChatEstudiante() {
  const { sesion } = useAuth()
  const { mostrarToast } = useToast()
  const estudianteId = sesion?.estudianteId ?? null

  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [adjunto, setAdjunto] = useState<AdjuntoPendiente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const finalRef = useRef<HTMLDivElement>(null)
  const inputArchivo = useRef<HTMLInputElement>(null)
  const inputTexto = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (estudianteId === null) {
      setCargando(false)
      return undefined
    }
    let vigente = true
    const cargar = async (silencioso = false) => {
      try {
        const datos = await chatApi.mensajes(estudianteId)
        if (vigente) setMensajes(datos)
        if (vigente && !silencioso) setError('')
      } catch (err) {
        if (vigente && !silencioso) setError(mensajeError(err))
      } finally {
        if (vigente) setCargando(false)
      }
    }
    void cargar()
    const intervalo = window.setInterval(() => void cargar(true), 4_000)
    return () => {
      vigente = false
      window.clearInterval(intervalo)
    }
  }, [estudianteId])

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes.length])

  const seleccionarArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    if (archivo.size > MAX_ARCHIVO) {
      mostrarToast('El archivo no puede superar 5 MB.', 'error')
      return
    }
    const extension = archivo.name.split('.').pop()?.toLowerCase() ?? ''
    // El backend valida el contenido real; aquí solo se evita subir algo que va a rechazar.
    // Word antiguo (.doc) y con macros (.docm) no se aceptan: son la vía típica de malware.
    const permitido = ['pdf', 'docx', 'mp3', 'm4a', 'ogg', 'oga', 'opus', 'webm', 'wav'].includes(extension)
    if (!permitido) {
      mostrarToast('Solo se permiten PDF, Word (.docx) o archivos de audio.', 'error')
      return
    }
    try {
      const base64 = await leerBlob(archivo)
      setAdjunto({
        nombreArchivo: archivo.name,
        mime: archivo.type || 'application/octet-stream',
        base64,
        tamano: archivo.size,
        esAudio: archivo.type.startsWith('audio/'),
      })
      setError('')
    } catch {
      mostrarToast('No se pudo leer el archivo.', 'error')
    }
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (estudianteId === null || enviando) return
    const limpio = texto.trim()
    if (!limpio && !adjunto) return
    setEnviando(true)
    setError('')
    try {
      await chatApi.enviar(estudianteId, {
        texto: limpio,
        tipo: adjunto ? 'ARCHIVO' : 'TEXTO',
        nombreArchivo: adjunto?.nombreArchivo,
        mime: adjunto?.mime,
        archivoBase64: adjunto?.base64,
      })
      setTexto('')
      setAdjunto(null)
      setMensajes(await chatApi.mensajes(estudianteId))
      window.setTimeout(async () => {
        try {
          if (estudianteId !== null) setMensajes(await chatApi.mensajes(estudianteId))
        } catch {
          // El sondeo periódico lo intentará de nuevo.
        }
      }, 3_800)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  const usarSugerencia = (sugerencia: string) => {
    setTexto(sugerencia)
    inputTexto.current?.focus()
  }

  if (estudianteId === null) {
    return (
      <div className="pagina pagina--chat">
        <div className="chat-hilo__vacio">
          <span><Icon name="alert" size={30} /></span>
          <h3>No encontramos tu perfil de estudiante</h3>
          <p>Vuelve a iniciar sesión con tu cuenta institucional.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pagina pagina--chat">
      <section className="chat chat--activo chat--estudiante">
        <section className="chat-hilo">
          <header className="chat-hilo__cabecera chat-hilo__cabecera--estudiante">
            <Avatar nombre={PROFESOR.nombre} apellido={PROFESOR.apellido} tamano="sm" />
            <div className="chat-hilo__persona">
              <strong>{PROFESOR.nombre} {PROFESOR.apellido}</strong>
              <span>Profesor acompañante · Ingeniería de Software</span>
            </div>
            <div className="chat-hilo__acciones">
              <span className="chat-estado"><span className="punto-en-linea" /> En línea</span>
            </div>
          </header>

          <div className="chat-hilo__mensajes">
            {cargando ? (
              <Cargando texto="Abriendo tu conversación…" />
            ) : mensajes.length === 0 ? (
              <div className="chat-vacio">
                <span className="chat-vacio__icono"><Icon name="message" size={26} /></span>
                <h3>Este es tu espacio con el profesor</h3>
                <p>
                  Escríbele cuando necesites orientación académica o personal. Solo tú y tu
                  profesor acompañante pueden ver esta conversación.
                </p>
                <div className="chat-sugerencias">
                  {SUGERENCIAS.map((sugerencia) => (
                    <button key={sugerencia} type="button" onClick={() => usarSugerencia(sugerencia)}>
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              mensajes.map((mensaje, indice) => {
                const propio = mensaje.autor === 'ESTUDIANTE'
                const esAudio = Boolean(mensaje.mime?.startsWith('audio/'))
                const esPdf = mensaje.mime === 'application/pdf'
                const anterior = mensajes[indice - 1]
                const nuevoDia = !anterior
                  || new Date(anterior.fecha).toDateString() !== new Date(mensaje.fecha).toDateString()
                return (
                  <Fragment key={mensaje.id}>
                    {nuevoDia && (
                      <div className="chat-fecha">
                        <span>{etiquetaDia(mensaje.fecha)}</span>
                      </div>
                    )}
                    <div className={`mensaje${propio ? ' mensaje--propio' : ' mensaje--otro'}`}>
                    {!propio && (
                      <Avatar nombre={PROFESOR.nombre} apellido={PROFESOR.apellido} tamano="xs" />
                    )}
                    <div className="mensaje__cuerpo">
                      <div className="mensaje__burbuja">
                        {mensaje.tipo === 'ARCHIVO' && mensaje.archivoId ? (
                          esAudio ? (
                            <div className="archivo-audio">
                              <span className="archivo-audio__icono"><Icon name="mic" size={18} /></span>
                              <audio controls preload="none" src={chatApi.archivoUrl(mensaje)} />
                              <a
                                href={chatApi.archivoUrl(mensaje)}
                                download={mensaje.nombreArchivo ?? undefined}
                                className="archivo-audio__descarga"
                                aria-label="Descargar nota de voz"
                              >
                                <Icon name="download" size={16} />
                              </a>
                            </div>
                          ) : (
                            <a
                              href={chatApi.archivoUrl(mensaje)}
                              target="_blank"
                              rel="noreferrer"
                              className="archivo-adjunto"
                            >
                              <span className="archivo-adjunto__icono">
                                <Icon name="file" size={20} />
                              </span>
                              <span className="archivo-adjunto__datos">
                                <strong>{mensaje.nombreArchivo ?? 'Documento'}</strong>
                                <small>{esPdf ? 'Documento PDF' : 'Documento Word'}</small>
                              </span>
                              <Icon name="download" size={16} />
                            </a>
                          )
                        ) : (
                          <p>{mensaje.texto}</p>
                        )}
                        {mensaje.tipo === 'ARCHIVO' && mensaje.texto && (
                          <p className="mensaje__nota">{mensaje.texto}</p>
                        )}
                      </div>
                      <span className="mensaje__hora">
                        {propio ? 'Tú' : PROFESOR.nombre} · {hora(mensaje.fecha)}
                      </span>
                    </div>
                    </div>
                  </Fragment>
                )
              })
            )}
            <div ref={finalRef} />
          </div>

          {error && (
            <p className="mensaje-error chat-error" role="alert">
              <Icon name="alert" size={16} /> {error}
            </p>
          )}

          {adjunto && (
            <div className="adjunto-preview">
              <span className="adjunto-preview__icono">
                <Icon name={adjunto.esAudio ? 'mic' : 'file'} size={18} />
              </span>
              <div>
                <strong>{adjunto.nombreArchivo}</strong>
                <small>{tamanoLegible(adjunto.tamano)} · listo para enviar</small>
              </div>
              <button
                type="button"
                className="boton-icono"
                onClick={() => setAdjunto(null)}
                aria-label="Quitar archivo adjunto"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          <form className="chat-compositor" onSubmit={enviar}>
            <input
              ref={inputArchivo}
              type="file"
              accept=".pdf,.docx,audio/*"
              onChange={(evento) => void seleccionarArchivo(evento)}
              hidden
            />
            <div className="chat-compositor__herramientas">
              <button
                type="button"
                className="boton-icono"
                onClick={() => inputArchivo.current?.click()}
                title="Adjuntar PDF, Word o audio"
                aria-label="Adjuntar archivo"
              >
                <Icon name="paperclip" size={19} />
              </button>
            </div>
            <input
              ref={inputTexto}
              type="text"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Escribe a tu profesor…"
              aria-label="Escribir mensaje"
            />
            <button
              type="submit"
              className="boton boton--primario boton--enviar"
              disabled={enviando || (!texto.trim() && !adjunto)}
              aria-label="Enviar mensaje"
            >
              <Icon name={enviando ? 'clock' : 'send'} size={18} />
            </button>
          </form>
        </section>
      </section>
    </div>
  )
}
