import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

type TipoToast = 'exito' | 'error' | 'info'

interface Toast {
  id: number
  mensaje: string
  tipo: TipoToast
}

interface ToastContexto {
  mostrarToast: (mensaje: string, tipo?: TipoToast) => void
}

const ToastContext = createContext<ToastContexto | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const siguienteId = useRef(1)

  const mostrarToast = useCallback((mensaje: string, tipo: TipoToast = 'exito') => {
    const id = siguienteId.current++
    setToasts((actuales) => [...actuales, { id, mensaje, tipo }])
    window.setTimeout(() => {
      setToasts((actuales) => actuales.filter((toast) => toast.id !== id))
    }, 4200)
  }, [])

  const valor = useMemo(() => ({ mostrarToast }), [mostrarToast])

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tipo}`}>
            <span className="toast__icono">
              <Icon
                name={toast.tipo === 'exito' ? 'check' : toast.tipo === 'error' ? 'alert' : 'bell'}
                size={17}
              />
            </span>
            <span>{toast.mensaje}</span>
            <button
              type="button"
              className="toast__cerrar"
              onClick={() => setToasts((actuales) => actuales.filter((t) => t.id !== toast.id))}
              aria-label="Cerrar aviso"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContexto {
  const contexto = useContext(ToastContext)
  if (!contexto) throw new Error('useToast debe usarse dentro de ToastProvider')
  return contexto
}
