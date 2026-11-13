import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ConteoCarrera, ConteoCategoria, ConteoSemestre, NivelRiesgo } from '../types'
import { COLOR_CATEGORIA, COLOR_RIESGO } from '../utils/format'

const ESTILO_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #e2e8e2',
  boxShadow: '0 12px 30px rgba(16, 43, 36, 0.12)',
  fontSize: 12,
  padding: '8px 12px',
  background: '#ffffff',
}

const ESTILO_EJE = { fontSize: 12.5, fill: '#4f635a', fontWeight: 600 }
const ESTILO_ETIQUETA = { fontSize: 11.5, fontWeight: 750, fill: '#374a42' }

/** Segmento seleccionado en una gráfica para resaltarlo. */
export interface SeleccionGrafica {
  riesgo?: NivelRiesgo
  semestre?: number
  carrera?: string
  categoria?: string
}

export function DonutRiesgo({
  alto,
  medio,
  bajo,
  onRiesgo,
  riesgoActivo,
}: {
  alto: number
  medio: number
  bajo: number
  onRiesgo?: (riesgo: NivelRiesgo) => void
  riesgoActivo?: NivelRiesgo | null
}) {
  const total = alto + medio + bajo
  const datos: Array<{ nombre: string; valor: number; color: string; riesgo: NivelRiesgo }> = [
    { nombre: 'Alto', valor: alto, color: COLOR_RIESGO.ALTO, riesgo: 'ALTO' },
    { nombre: 'Medio', valor: medio, color: COLOR_RIESGO.MEDIO, riesgo: 'MEDIO' },
    { nombre: 'Bajo', valor: bajo, color: COLOR_RIESGO.BAJO, riesgo: 'BAJO' },
  ]
  const porcentaje = (valor: number) => (total === 0 ? 0 : Math.round((valor / total) * 1000) / 10)

  return (
    <div className="donut-riesgo">
      <div className="donut-riesgo__grafica">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              dataKey="valor"
              nameKey="nombre"
              innerRadius="65%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              onClick={(entrada) => {
                const riesgo = (entrada as { riesgo?: NivelRiesgo }).riesgo
                if (riesgo) onRiesgo?.(riesgo)
              }}
              style={{ cursor: 'pointer' }}
            >
              {datos.map((dato) => (
                <Cell
                  key={dato.nombre}
                  fill={dato.color}
                  fillOpacity={riesgoActivo && riesgoActivo !== dato.riesgo ? 0.3 : 1}
                  stroke={riesgoActivo === dato.riesgo ? '#ffffff' : 'none'}
                  strokeWidth={riesgoActivo === dato.riesgo ? 3 : 0}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={ESTILO_TOOLTIP} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-riesgo__centro">
          <strong>{total.toLocaleString('es-CO')}</strong>
          <span>estudiantes</span>
        </div>
      </div>
      <ul className="leyenda">
        {datos.map((dato) => (
          <li
            key={dato.nombre}
            className={onRiesgo ? 'leyenda__clic' : undefined}
            onClick={() => onRiesgo?.(dato.riesgo)}
            role={onRiesgo ? 'button' : undefined}
            tabIndex={onRiesgo ? 0 : undefined}
            onKeyDown={(evento) => {
              if (onRiesgo && (evento.key === 'Enter' || evento.key === ' ')) {
                onRiesgo(dato.riesgo)
              }
            }}
          >
            <i style={{ background: dato.color }} />
            <span>{dato.nombre}</span>
            <strong>{dato.valor.toLocaleString('es-CO')}</strong>
            <small>{porcentaje(dato.valor)}%</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GraficaCategorias({
  datos,
  onCategoria,
  seleccion,
}: {
  datos: ConteoCategoria[]
  onCategoria?: (categoria: string) => void
  seleccion?: SeleccionGrafica | null
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 52, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="#edf1ec" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="categoria"
          axisLine={false}
          tickLine={false}
          width={152}
          tick={ESTILO_EJE}
        />
        <Tooltip
          contentStyle={ESTILO_TOOLTIP}
          cursor={{ fill: 'rgba(20, 92, 78, 0.05)' }}
          formatter={(valor) => [`${Number(valor).toLocaleString('es-CO')} estudiantes`, 'Total']}
        />
        <Bar
          dataKey="total"
          name="Estudiantes"
          barSize={20}
          radius={[0, 12, 12, 0]}
          onClick={(dato) => onCategoria?.((dato as unknown as ConteoCategoria).categoria)}
          style={{ cursor: onCategoria ? 'pointer' : undefined }}
        >
          {datos.map((dato) => (
            <Cell
              key={dato.categoria}
              fill={COLOR_CATEGORIA[dato.categoria] ?? '#145c4e'}
              fillOpacity={seleccion?.categoria && seleccion.categoria !== dato.categoria ? 0.3 : 1}
            />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(valor) => Number(valor).toLocaleString('es-CO')}
            style={ESTILO_ETIQUETA}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficaSemestres({
  datos,
  onSegmento,
  seleccion,
}: {
  datos: ConteoSemestre[]
  onSegmento?: (riesgo: NivelRiesgo, semestre: number) => void
  seleccion?: SeleccionGrafica | null
}) {
  const opacidad = (riesgo: NivelRiesgo, semestre: number) => {
    if (!seleccion) return 1
    if (seleccion.riesgo && seleccion.riesgo !== riesgo) return 0.25
    if (seleccion.semestre && seleccion.semestre !== semestre) return 0.25
    return 1
  }
  const click = (riesgo: NivelRiesgo) => (dato: unknown) => {
    onSegmento?.(riesgo, (dato as unknown as ConteoSemestre).semestre)
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barSize={20}>
        <CartesianGrid vertical={false} stroke="#edf1ec" />
        <XAxis dataKey="semestre" tickLine={false} axisLine={false} tick={ESTILO_EJE} tickFormatter={(valor) => `${valor}°`} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={ESTILO_EJE}
          allowDecimals={false}
          width={46}
          tickFormatter={(valor) => Number(valor).toLocaleString('es-CO')}
        />
        <Tooltip
          contentStyle={ESTILO_TOOLTIP}
          cursor={{ fill: 'rgba(20, 92, 78, 0.04)' }}
          formatter={(valor, nombre) => [Number(valor).toLocaleString('es-CO'), nombre]}
        />
        <Bar dataKey="alto" name="Riesgo alto" stackId="riesgo" fill={COLOR_RIESGO.ALTO}
          onClick={click('ALTO')} style={{ cursor: onSegmento ? 'pointer' : undefined }}>
          {datos.map((dato) => (
            <Cell key={`alto-${dato.semestre}`} fill={COLOR_RIESGO.ALTO}
              fillOpacity={opacidad('ALTO', dato.semestre)} />
          ))}
        </Bar>
        <Bar dataKey="medio" name="Riesgo medio" stackId="riesgo" fill={COLOR_RIESGO.MEDIO}
          onClick={click('MEDIO')} style={{ cursor: onSegmento ? 'pointer' : undefined }}>
          {datos.map((dato) => (
            <Cell key={`medio-${dato.semestre}`} fill={COLOR_RIESGO.MEDIO}
              fillOpacity={opacidad('MEDIO', dato.semestre)} />
          ))}
        </Bar>
        <Bar dataKey="bajo" name="Riesgo bajo" stackId="riesgo" fill={COLOR_RIESGO.BAJO} radius={[5, 5, 0, 0]}
          onClick={click('BAJO')} style={{ cursor: onSegmento ? 'pointer' : undefined }}>
          {datos.map((dato) => (
            <Cell key={`bajo-${dato.semestre}`} fill={COLOR_RIESGO.BAJO}
              fillOpacity={opacidad('BAJO', dato.semestre)} />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            formatter={(valor) => Number(valor).toLocaleString('es-CO')}
            style={ESTILO_ETIQUETA}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficaCarreras({
  datos,
  onSegmento,
  seleccion,
}: {
  datos: ConteoCarrera[]
  onSegmento?: (riesgo: NivelRiesgo, carrera: string) => void
  seleccion?: SeleccionGrafica | null
}) {
  const opacidad = (riesgo: NivelRiesgo, carrera: string) => {
    if (!seleccion) return 1
    if (seleccion.riesgo && seleccion.riesgo !== riesgo) return 0.25
    if (seleccion.carrera && seleccion.carrera !== carrera) return 0.25
    return 1
  }
  const click = (riesgo: NivelRiesgo) => (dato: unknown) => {
    onSegmento?.(riesgo, (dato as unknown as ConteoCarrera).carrera)
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 52, left: 0, bottom: 0 }} barSize={19}>
        <CartesianGrid horizontal={false} stroke="#edf1ec" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="carrera"
          axisLine={false}
          tickLine={false}
          width={158}
          tick={ESTILO_EJE}
        />
        <Tooltip
          contentStyle={ESTILO_TOOLTIP}
          cursor={{ fill: 'rgba(20, 92, 78, 0.05)' }}
          formatter={(valor, nombre) => [Number(valor).toLocaleString('es-CO'), nombre]}
        />
        <Bar dataKey="alto" name="Alto" stackId="riesgo" fill={COLOR_RIESGO.ALTO}
          onClick={click('ALTO')} style={{ cursor: onSegmento ? 'pointer' : undefined }}>
          {datos.map((dato) => (
            <Cell key={`alto-${dato.carrera}`} fill={COLOR_RIESGO.ALTO}
              fillOpacity={opacidad('ALTO', dato.carrera)} />
          ))}
        </Bar>
        <Bar dataKey="medio" name="Medio" stackId="riesgo" fill={COLOR_RIESGO.MEDIO}
          onClick={click('MEDIO')} style={{ cursor: onSegmento ? 'pointer' : undefined }}>
          {datos.map((dato) => (
            <Cell key={`medio-${dato.carrera}`} fill={COLOR_RIESGO.MEDIO}
              fillOpacity={opacidad('MEDIO', dato.carrera)} />
          ))}
        </Bar>
        <Bar dataKey="bajo" name="Bajo" stackId="riesgo" fill={COLOR_RIESGO.BAJO} radius={[0, 4, 4, 0]}
          onClick={click('BAJO')} style={{ cursor: onSegmento ? 'pointer' : undefined }}>
          {datos.map((dato) => (
            <Cell key={`bajo-${dato.carrera}`} fill={COLOR_RIESGO.BAJO}
              fillOpacity={opacidad('BAJO', dato.carrera)} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(valor) => Number(valor).toLocaleString('es-CO')}
            style={ESTILO_ETIQUETA}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LeyendaRiesgo() {
  return (
    <div className="leyenda-riesgo">
      {(['ALTO', 'MEDIO', 'BAJO'] as const).map((nivel) => (
        <span key={nivel}>
          <i style={{ background: COLOR_RIESGO[nivel] }} /> {nivel.charAt(0) + nivel.slice(1).toLowerCase()}
        </span>
      ))}
    </div>
  )
}
