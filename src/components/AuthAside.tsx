import { Icon } from './Icon'

const BENEFICIOS = [
  {
    icono: 'alert' as const,
    titulo: 'Alertas tempranas',
    texto: 'Detecta el riesgo antes de que el estudiante desaparezca del aula.',
  },
  {
    icono: 'sparkles' as const,
    titulo: 'Planes con IA',
    texto: 'Recomendaciones concretas para acompañar cada caso.',
  },
  {
    icono: 'chat' as const,
    titulo: 'Contacto cercano',
    texto: 'Chat interno con texto, voz y documentos en un solo lugar.',
  },
]

/** Panel visual que acompaña las pantallas de login y registro. */
export function AuthAside() {
  return (
    <aside className="auth-aside">
      <div className="auth-aside__marca">
        <span className="marca__simbolo marca__simbolo--claro">
          <Icon name="cap" size={22} />
        </span>
        <div>
          <strong>Permanencia</strong>
          <span>Plataforma de acompañamiento universitario</span>
        </div>
      </div>

      <div className="auth-aside__centro">
        <p className="auth-aside__eyebrow">Prevenir es acompañar</p>
        <h1>Acompañar a tiempo cambia historias.</h1>
        <p className="auth-aside__texto">
          Un espacio para que docentes y coordinación detecten señales de riesgo, entiendan el
          contexto de cada estudiante y actúen con un plan claro.
        </p>

        <div className="auth-aside__beneficios">
          {BENEFICIOS.map((beneficio) => (
            <div key={beneficio.titulo} className="auth-beneficio">
              <span className="auth-beneficio__icono">
                <Icon name={beneficio.icono} size={18} />
              </span>
              <div>
                <strong>{beneficio.titulo}</strong>
                <p>{beneficio.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-aside__pie">
        <span>600 estudiantes</span>
        <span>5 causas de riesgo</span>
        <span>6 programas</span>
      </div>
    </aside>
  )
}
