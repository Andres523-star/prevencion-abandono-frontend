import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useToast } from '../components/Toast'
import { Avatar, Cargando, RiesgoBadge, Vacio } from '../components/Ui'
import { chatApi, estudiantesApi, mensajeError } from '../services/api'
import type { Conversacion, Estudiante, Mensaje } from '../types'
import { hace, hora } from '../utils/format'

const MAX_ARCHIVO = 5 * 1024 * 1024
const SUGERENCIAS = ['¿Cómo estás?', 'Vi que faltaste a clase esta semana', '¿Podemos agendar una cita?']

interface AdjuntoPendiente {
  nombreArchivo: string
  mime: string
  base64: string
  tamano: number
  esAudio: boolean
}

/** Convierte un archivo o blob a Base64 sin el prefijo data:. */
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

function formatearSegundos(segundos: number): string {
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}

export function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mostrarToast } = useToast()
  const activo = id && Number.isFinite(Number(id)) ? Number(id) : null

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [estudianteActivo, setEstudianteActivo] = useState<Estudiante | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [texto, setTexto] = useState('')
  const [adjunto, setAdjunto] = useState<AdjuntoPendiente | null>(null)
  const [cargandoConversaciones, setCargandoConversaciones] = useState(true)
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [grabando, setGrabando] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const [error, setError] = useState('')

  const finalRef = useRef<HTMLDivElement>(null)
  const inputArchivo = useRef<HTMLInputElement>(null)
  const inputTexto = useRef<HTMLInputElement>(null)
  const grabadora = useRef<MediaRecorder | null>(null)
  const flujo = useRef<MediaStream | null>(null)
  const fragmentos = useRef<Blob[]>([])
  const intervaloGrabacion = useRef<number | null>(null)

  useEffect(() => {
    let vigente = true
    const cargar = async () => {
      try {
        const datos = await chatApi.conversaciones()
        if (vigente) setConversaciones(datos)
      } catch (err) {
        if (vigente) setError(mensajeError(err))
      } finally {
        if (vigente) setCargandoConversaciones(false)
      }
    }
    void cargar()
    const intervalo = window.setInterval(cargar, 10_000)
    return () => {
      vigente = false
      window.clearInterval(intervalo)
    }
  }, [])

  useEffect(() => {
    if (!id && conversaciones.length > 0 && window.matchMedia('(min-width: 861px)').matches) {
      navigate(`/chat/${conversaciones[0].estudianteId}`, { replace: true })
    }
  }, [id, conversaciones, navigate])

  useEffect(() => {
    if (activo === null) {
      setMensajes([])
      setEstudianteActivo(null)
      return
    }
    let vigente = true
    setCargandoMensajes(true)
    setError('')
    setAdjunto(null)

    const cargar = async (silencioso = false) => {
      try {
        const datos = await chatApi.mensajes(activo)
        if (vigente) {
          setMensajes(datos)
          setConversaciones((actuales) =>
            actuales.map((c) => (c.estudianteId === activo ? { ...c, noLeidos: 0 } : c)),
          )
        }
      } catch (err) {
        if (vigente && !silencioso) setError(mensajeError(err))
      } finally {
        if (vigente) setCargandoMensajes(false)
      }
    }

    void cargar()
    const intervalo = window.setInterval(() => void cargar(true), 4_000)
    return () => {
      vigente = false
      window.clearInterval(intervalo)
    }
  }, [activo])

  useEffect(() => {
    if (activo !== null) {
      const enLista = conversaciones.some((c) => c.estudianteId === activo)
      if (enLista) {
        setEstudianteActivo(null)
        return
      }
      let vigente = true
      estudiantesApi
        .obtener(activo)
        .then((datos) => {
          if (vigente) setEstudianteActivo(datos)
        })
        .catch(() => {
          if (vigente) setEstudianteActivo(null)
        })
      return () => {
        vigente = false
      }
    }
    setEstudianteActivo(null)
    return undefined
  }, [activo, conversaciones])

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes.length, activo])

  useEffect(() => {
    return () => {
      if (grabadora.current && grabadora.current.state !== 'inactive') grabadora.current.stop()
      flujo.current?.getTracks().forEach((pista) => pista.stop())
      if (intervaloGrabacion.current) window.clearInterval(intervaloGrabacion.current)
    }
  }, [])

  useEffect(() => {
    if (grabando && segundos >= 60 && grabadora.current?.state === 'recording') {
      grabadora.current.stop()
    }
  }, [grabando, segundos])

  const conversacionActiva = useMemo(
    () => conversaciones.find((c) => c.estudianteId === activo) ?? null,
    [conversaciones, activo],
  )

  const cabecera = useMemo(() => {
    if (conversacionActiva) {
      return {
        nombre: conversacionActiva.nombre,
        apellido: conversacionActiva.apellido,
        carrera: conversacionActiva.carrera,
        semestre: conversacionActiva.semestre,
        riesgo: conversacionActiva.riesgoActual,
        categoria: conversacionActiva.categoria,
      }
    }
    if (estudianteActivo) {
      return {
        nombre: estudianteActivo.nombre,
        apellido: estudianteActivo.apellido,
        carrera: estudianteActivo.carrera,
        semestre: estudianteActivo.semestre,
        riesgo: estudianteActivo.riesgoActual,
        categoria: estudianteActivo.categoria,
      }
    }
    return null
  }, [conversacionActiva, estudianteActivo])

  const filtradas = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase()
    if (!consulta) return conversaciones
    return conversaciones.filter((c) =>
      `${c.nombre} ${c.apellido} ${c.carrera} ${c.categoria}`.toLowerCase().includes(consulta),
    )
  }, [conversaciones, busqueda])

  const seleccionarArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    if (archivo.size > MAX_ARCHIVO) {
      mostrarToast('El archivo no puede superar 5 MB.', 'error')
      return
    }
    const extension = archivo.name.split('.').pop()?.toLowerCase() ?? ''
    const permitido =
      archivo.type.startsWith('audio/') ||
      archivo.type === 'application/pdf' ||
      archivo.type.includes('word') ||
      ['pdf', 'doc', 'docx', 'mp3', 'm4a', 'ogg', 'webm', 'wav'].includes(extension)
    if (!permitido) {
      mostrarToast('Solo se permiten PDF, Word o archivos de audio.', 'error')
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

  const iniciarGrabacion = async () => {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      mostrarToast('Tu navegador no permite grabar audio en esta página.', 'error')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      flujo.current = stream
      const tipoPreferido = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      const recorder = tipoPreferido
        ? new MediaRecorder(stream, { mimeType: tipoPreferido })
        : new MediaRecorder(stream)
      fragmentos.current = []
      recorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) fragmentos.current.push(evento.data)
      }
      recorder.onstop = async () => {
        const tipo = recorder.mimeType || 'audio/webm'
        stream.getTracks().forEach((pista) => pista.stop())
        flujo.current = null
        if (intervaloGrabacion.current) {
          window.clearInterval(intervaloGrabacion.current)
          intervaloGrabacion.current = null
        }
        setGrabando(false)
        setSegundos(0)
        if (fragmentos.current.length === 0) return
        const blob = new Blob(fragmentos.current, { type: tipo })
        if (blob.size > MAX_ARCHIVO) {
          mostrarToast('La nota de voz supera 5 MB. Intenta una más corta.', 'error')
          return
        }
        try {
          const base64 = await leerBlob(blob)
          const extension = tipo.includes('mp4') ? 'm4a' : tipo.includes('ogg') ? 'ogg' : 'webm'
          setAdjunto({
            nombreArchivo: `nota-de-voz-${Date.now()}.${extension}`,
            mime: tipo,
            base64,
            tamano: blob.size,
            esAudio: true,
          })
        } catch {
          mostrarToast('No se pudo preparar la nota de voz.', 'error')
        }
      }
      recorder.start()
      grabadora.current = recorder
      setGrabando(true)
      setSegundos(0)
      intervaloGrabacion.current = window.setInterval(() => {
        setSegundos((actual) => actual + 1)
      }, 1000)
    } catch {
      mostrarToast('No pudimos acceder al micrófono. Revisa los permisos del navegador.', 'error')
    }
  }

  const detenerGrabacion = () => {
    if (grabadora.current?.state === 'recording') grabadora.current.stop()
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault()
    if (activo === null || enviando) return
    const limpio = texto.trim()
    if (!limpio && !adjunto) return
    setEnviando(true)
    setError('')
    try {
      await chatApi.enviar(activo, {
        texto: limpio,
        tipo: adjunto ? 'ARCHIVO' : 'TEXTO',
        nombreArchivo: adjunto?.nombreArchivo,
        mime: adjunto?.mime,
        archivoBase64: adjunto?.base64,
      })
      setTexto('')
      setAdjunto(null)
      const datos = await chatApi.mensajes(activo)
      setMensajes(datos)
      window.setTimeout(async () => {
        try {
          const nuevos = await chatApi.mensajes(activo)
          setMensajes(nuevos)
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

  return (
    <div className="pagina pagina--chat">
      <section className={`chat${activo !== null ? ' chat--activo' : ''}`}>
        <aside className={`chat-lista${activo !== null ? ' chat-lista--con-hilo' : ''}`}>
          <header className="chat-lista__cabecera">
            <div>
              <h2>Conversaciones</h2>
              <p>Seguimiento cercano a tus estudiantes.</p>
            </div>
            <span className="chat-lista__contador">{conversaciones.length}</span>
          </header>

          <div className="buscador buscador--chat">
            <Icon name="search" size={17} />
            <input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar conversación…"
              aria-label="Buscar conversación"
            />
          </div>

          <div className="chat-lista__items">
            {cargandoConversaciones ? (
              <Cargando texto="Cargando conversaciones…" />
            ) : filtradas.length === 0 ? (
              <Vacio
                icono="chat"
                titulo="Sin conversaciones"
                texto="Abre la ficha de un estudiante y escríbele para iniciar el acompañamiento."
              />
            ) : (
              filtradas.map((conversacion) => (
                <Link
                  key={conversacion.estudianteId}
                  to={`/chat/${conversacion.estudianteId}`}
                  className={`chat-item${conversacion.estudianteId === activo ? ' chat-item--activo' : ''}`}
                >
                  <Avatar
                    nombre={conversacion.nombre}
                    apellido={conversacion.apellido}
                    tamano="sm"
                    riesgo={conversacion.riesgoActual}
                  />
                  <div className="chat-item__cuerpo">
                    <div className="chat-item__fila">
                      <strong>{conversacion.nombre} {conversacion.apellido}</strong>
                      <small>{hace(conversacion.ultimaFecha)}</small>
                    </div>
                    <p className={conversacion.noLeidos > 0 ? 'chat-item__mensaje chat-item__mensaje--nuevo' : 'chat-item__mensaje'}>
                      {conversacion.ultimoMensaje}
                    </p>
                    <div className="chat-item__meta">
                      <span>{conversacion.carrera} · {conversacion.semestre}°</span>
                      {conversacion.noLeidos > 0 && (
                        <span className="chat-item__no-leidos">{conversacion.noLeidos}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>

        <section className="chat-hilo">
          {activo === null || !cabecera ? (
            <div className="chat-hilo__vacio">
              <span><Icon name="chat" size={30} /></span>
              <h3>Elige una conversación</h3>
              <p>Selecciona a un estudiante de la lista para ver el historial y escribirle.</p>
            </div>
          ) : (
            <>
              <header className="chat-hilo__cabecera">
                <Link to="/chat" className="chat-volver" aria-label="Volver a la lista de conversaciones">
                  <Icon name="arrowLeft" size={18} />
                </Link>
                <Avatar nombre={cabecera.nombre} apellido={cabecera.apellido} tamano="sm" riesgo={cabecera.riesgo} />
                <div className="chat-hilo__persona">
                  <strong>{cabecera.nombre} {cabecera.apellido}</strong>
                  <span>{cabecera.carrera} · {cabecera.semestre}° semestre</span>
                </div>
                <div className="chat-hilo__acciones">
                  <RiesgoBadge riesgo={cabecera.riesgo} compacto />
                  <Link to={`/estudiantes/${activo}`} className="boton boton--secundario boton--compacto">
                    <Icon name="external" size={15} /> Ver ficha
                  </Link>
                </div>
              </header>

              <div className="chat-hilo__mensajes">
                {cargandoMensajes && mensajes.length === 0 ? (
                  <Cargando texto="Abriendo la conversación…" />
                ) : mensajes.length === 0 ? (
                  <div className="chat-vacio">
                    <span className="chat-vacio__icono"><Icon name="message" size={26} /></span>
                    <h3>Empieza la conversación</h3>
                    <p>
                      Un mensaje a tiempo puede cambiar una decisión. Cuéntale a {cabecera.nombre} que
                      estás ahí para acompañarlo.
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
                  mensajes.map((mensaje) => {
                    const propio = mensaje.autor === 'PROFESOR'
                    const esAudio = Boolean(mensaje.mime?.startsWith('audio/'))
                    const esPdf = mensaje.mime === 'application/pdf'
                    return (
                      <div key={mensaje.id} className={`mensaje${propio ? ' mensaje--propio' : ' mensaje--otro'}`}>
                        {!propio && (
                          <Avatar
                            nombre={cabecera.nombre}
                            apellido={cabecera.apellido}
                            tamano="xs"
                            riesgo={cabecera.riesgo}
                          />
                        )}
                        <div className="mensaje__cuerpo">
                          <div className="mensaje__burbuja">
                            {mensaje.tipo === 'ARCHIVO' && mensaje.archivoId ? (
                              esAudio ? (
                                <div className="archivo-audio">
                                  <span className="archivo-audio__icono"><Icon name="mic" size={18} /></span>
                                  <audio controls preload="none" src={chatApi.archivoUrl(mensaje.archivoId)} />
                                  <a
                                    href={chatApi.archivoUrl(mensaje.archivoId)}
                                    download={mensaje.nombreArchivo ?? undefined}
                                    className="archivo-audio__descarga"
                                    aria-label="Descargar nota de voz"
                                  >
                                    <Icon name="download" size={16} />
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={chatApi.archivoUrl(mensaje.archivoId)}
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
                            {propio ? 'Tú' : cabecera.nombre} · {hora(mensaje.fecha)}
                          </span>
                        </div>
                      </div>
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

              {grabando ? (
                <div className="grabacion">
                  <span className="grabacion__punto" />
                  <div className="grabacion__texto">
                    <strong>Grabando nota de voz</strong>
                    <span>{formatearSegundos(segundos)} · máximo 60 segundos</span>
                  </div>
                  <button type="button" className="boton boton--peligro boton--compacto" onClick={detenerGrabacion}>
                    <Icon name="stop" size={15} /> Detener y adjuntar
                  </button>
                </div>
              ) : (
                <form className="chat-compositor" onSubmit={enviar}>
                  <input
                    ref={inputArchivo}
                    type="file"
                    accept=".pdf,.doc,.docx,audio/*"
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
                    <button
                      type="button"
                      className="boton-icono"
                      onClick={() => void iniciarGrabacion()}
                      title="Grabar nota de voz"
                      aria-label="Grabar nota de voz"
                    >
                      <Icon name="mic" size={19} />
                    </button>
                  </div>
                  <input
                    ref={inputTexto}
                    type="text"
                    value={texto}
                    onChange={(evento) => setTexto(evento.target.value)}
                    placeholder={`Escribe a ${cabecera.nombre}…`}
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
              )}
            </>
          )}
        </section>
      </section>
    </div>
  )
}
