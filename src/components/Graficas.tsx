import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ConteoCarrera, ConteoCategoria, ConteoSemestre } from '../types'
import { COLOR_CATEGORIA, COLOR_RIESGO } from '../utils/format'

const ESTILO_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #e2e8e2',
  boxShadow: '0 12px 30px rgba(16, 43, 36, 0.12)',
  fontSize: 12,
  padding: '8px 12px',
  background: '#ffffff',
}

const ESTILO_EJE = { fontSize: 11, fill: '#63746c' }

export function DonutRiesgo({ alto, medio, bajo }: { alto: number; medio: number; bajo: number }) {
  const total = alto + medio + bajo
  const datos = [
    { nombre: 'Alto', valor: alto, color: COLOR_RIESGO.ALTO },
    { nombre: 'Medio', valor: medio, color: COLOR_RIESGO.MEDIO },
    { nombre: 'Bajo', valor: bajo, color: COLOR_RIESGO.BAJO },
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
            >
              {datos.map((dato) => (
                <Cell key={dato.nombre} fill={dato.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={ESTILO_TOOLTIP} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-riesgo__centro">
          <strong>{total}</strong>
          <span>estudiantes</span>
        </div>
      </div>
      <ul className="leyenda">
        {datos.map((dato) => (
          <li key={dato.nombre}>
            <i style={{ background: dato.color }} />
            <span>{dato.nombre}</span>
            <strong>{dato.valor}</strong>
            <small>{porcentaje(dato.valor)}%</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GraficaCategorias({ datos }: { datos: ConteoCategoria[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="#edf1ec" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="categoria"
          axisLine={false}
          tickLine={false}
          width={136}
          tick={ESTILO_EJE}
        />
        <Tooltip
          contentStyle={ESTILO_TOOLTIP}
          cursor={{ fill: 'rgba(20, 92, 78, 0.05)' }}
          formatter={(valor) => [`${valor} estudiantes`, 'Total']}
        />
        <Bar dataKey="total" name="Estudiantes" barSize={16} radius={[0, 12, 12, 0]}>
          {datos.map((dato) => (
            <Cell key={dato.categoria} fill={COLOR_CATEGORIA[dato.categoria] ?? '#145c4e'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficaSemestres({ datos }: { datos: ConteoSemestre[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barSize={18}>
        <CartesianGrid vertical={false} stroke="#edf1ec" />
        <XAxis dataKey="semestre" tickLine={false} axisLine={false} tick={ESTILO_EJE} tickFormatter={(valor) => `${valor}°`} />
        <YAxis tickLine={false} axisLine={false} tick={ESTILO_EJE} allowDecimals={false} />
        <Tooltip contentStyle={ESTILO_TOOLTIP} cursor={{ fill: 'rgba(20, 92, 78, 0.04)' }} />
        <Bar dataKey="alto" name="Riesgo alto" stackId="riesgo" fill={COLOR_RIESGO.ALTO} />
        <Bar dataKey="medio" name="Riesgo medio" stackId="riesgo" fill={COLOR_RIESGO.MEDIO} />
        <Bar dataKey="bajo" name="Riesgo bajo" stackId="riesgo" fill={COLOR_RIESGO.BAJO} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficaCarreras({ datos }: { datos: ConteoCarrera[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barSize={17}>
        <CartesianGrid horizontal={false} stroke="#edf1ec" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="carrera"
          axisLine={false}
          tickLine={false}
          width={140}
          tick={ESTILO_EJE}
        />
        <Tooltip contentStyle={ESTILO_TOOLTIP} cursor={{ fill: 'rgba(20, 92, 78, 0.05)' }} />
        <Bar dataKey="alto" name="Alto" stackId="riesgo" fill={COLOR_RIESGO.ALTO} />
        <Bar dataKey="medio" name="Medio" stackId="riesgo" fill={COLOR_RIESGO.MEDIO} />
        <Bar dataKey="bajo" name="Bajo" stackId="riesgo" fill={COLOR_RIESGO.BAJO} radius={[0, 4, 4, 0]} />
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
