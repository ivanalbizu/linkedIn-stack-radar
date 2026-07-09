import { useMemo, useState } from 'react'
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
import { useReducedMotion } from '../lib/useReducedMotion'
import { useFilter } from '../filter/useFilter'
import { ChartDataTable } from './ChartDataTable'

/** Tecnologías dibujadas por defecto y nº de candidatas ofrecidas para elegir. */
const TOP_N = 8
const CANDIDATES = 20

export function TimeEvolution({ jobs }: { jobs: Job[] }) {
  const { isVisible, active, minEncaje } = useFilter()
  const reducedMotion = useReducedMotion()
  /** null = selección automática (las TOP_N más demandadas). */
  const [selected, setSelected] = useState<Set<string> | null>(null)

  const eligible = useMemo(
    () => (minEncaje > 0 ? jobs.filter((j) => j.encaje >= minEncaje) : jobs),
    [jobs, minEncaje],
  )
  const dates = useMemo(() => scanDates(eligible), [eligible])

  const candidates = useMemo(
    () =>
      countByTech(eligible)
        .filter((t) => isVisible(t.category))
        .slice(0, CANDIDATES),
    [eligible, isVisible],
  )

  const topTechs = useMemo(() => {
    if (!selected) return candidates.slice(0, TOP_N)
    return candidates.filter((t) => selected.has(t.tech))
  }, [candidates, selected])

  const data = useMemo(
    () => evolutionShareByTech(eligible, topTechs.map((t) => t.tech)),
    [eligible, topTechs],
  )

  function toggleTech(tech: string) {
    setSelected((prev) => {
      const base = prev ?? new Set(candidates.slice(0, TOP_N).map((t) => t.tech))
      const next = new Set(base)
      if (next.has(tech)) next.delete(tech)
      else next.add(tech)
      return next
    })
  }

  return (
    <div>
      <p className="muted">
        % de ofertas de cada escaneo que piden cada tecnología (cuota de demanda, normalizada por
        nº de ofertas del día)
        {active.size > 0 ? ', en las categorías seleccionadas' : ''}.
      </p>

      <fieldset className="tech-picker">
        <legend className="muted">
          Tecnologías en el gráfico ({topTechs.length} de {candidates.length})
          {!selected ? ' — las más demandadas' : ''}
        </legend>
        <div className="tech-picker__chips">
          {candidates.map((t) => {
            const on = topTechs.some((s) => s.tech === t.tech)
            return (
              <button
                key={t.tech}
                type="button"
                className={`chip${on ? ' chip--on' : ''}`}
                style={{ '--chip-color': CATEGORY_COLOR[t.category] } as React.CSSProperties}
                aria-pressed={on}
                onClick={() => toggleTech(t.tech)}
              >
                <span className="chip__dot" />
                {t.tech}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="filter__clear"
          onClick={() => setSelected(null)}
          disabled={!selected}
        >
          Restablecer
        </button>
      </fieldset>
      {dates.length < 2 && (
        <p className="notice">
          Solo hay un escaneo ({dates[0] ?? '—'}) en <code>jobs.json</code>. La tendencia aparecerá
          cuando se añadan ofertas con nuevas <code>fecha_escaneo</code>.
        </p>
      )}
      {topTechs.length === 0 && (
        <p className="notice">Selecciona al menos una tecnología para dibujar el gráfico.</p>
      )}
      <ChartDataTable
        caption="Porcentaje de ofertas de cada escaneo que piden cada tecnología"
        columns={['Escaneo', 'Ofertas escaneadas', ...topTechs.map((t) => `${t.tech} (%)`)]}
        rows={data.map((row) => [
          String(row.fecha),
          Number(row.total),
          ...topTechs.map((t) => `${row[t.tech] ?? 0}%`),
        ])}
      />
      <div className="chart" style={{ height: 420 }} aria-hidden="true">
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
                isAnimationActive={!reducedMotion}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
