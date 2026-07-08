import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Job } from '../types'
import { CATEGORY_COLOR } from '../data/taxonomy'
import { countByTech, evolutionShareByTech, scanDates } from '../lib/aggregations'
import { useFilter } from '../filter/FilterContext'

const TOP_N = 8

export function TimeEvolution({ jobs }: { jobs: Job[] }) {
  const { isVisible, active } = useFilter()
  const dates = useMemo(() => scanDates(jobs), [jobs])

  const topTechs = useMemo(
    () =>
      countByTech(jobs)
        .filter((t) => isVisible(t.category))
        .slice(0, TOP_N),
    [jobs, isVisible],
  )

  const data = useMemo(
    () => evolutionShareByTech(jobs, topTechs.map((t) => t.tech)),
    [jobs, topTechs],
  )

  return (
    <div>
      <p className="muted">
        % de ofertas de cada escaneo que piden cada tecnología (cuota de demanda, normalizada por
        nº de ofertas del día), para las {topTechs.length} más demandadas
        {active.size > 0 ? ' de las categorías seleccionadas' : ''}.
      </p>
      {dates.length < 2 && (
        <p className="notice">
          Solo hay un escaneo ({dates[0] ?? '—'}) en <code>jobs.json</code>. La tendencia aparecerá
          cuando se añadan ofertas con nuevas <code>fecha_escaneo</code>.
        </p>
      )}
      <div className="chart" style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              width={40}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'ofertas']}
              labelFormatter={(fecha) => {
                const row = data.find((r) => r.fecha === fecha)
                return `${fecha} · ${row?.total ?? 0} ofertas escaneadas`
              }}
            />
            <Legend />
            {topTechs.map((t) => (
              <Line
                key={t.tech}
                type="monotone"
                dataKey={t.tech}
                stroke={CATEGORY_COLOR[t.category]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
