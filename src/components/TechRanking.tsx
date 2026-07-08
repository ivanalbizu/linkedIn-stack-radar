import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Job } from '../types'
import { CATEGORY_COLOR } from '../data/taxonomy'
import { countByTech } from '../lib/aggregations'
import { useFilter } from '../filter/FilterContext'

export function TechRanking({ jobs }: { jobs: Job[] }) {
  const { isVisible, active } = useFilter()

  const data = useMemo(
    () => countByTech(jobs).filter((t) => isVisible(t.category)),
    [jobs, isVisible],
  )

  const chartHeight = Math.max(240, data.length * 26 + 40)

  return (
    <div>
      <p className="muted">
        {data.length} tecnologías{active.size > 0 ? ' en las categorías seleccionadas' : ''} · el
        conteo es nº de ofertas donde aparece cada una.
      </p>
      <div className="chart" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 24, top: 8, bottom: 8 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="tech"
              width={140}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <Tooltip
              formatter={(value) => [`${value} ofertas`, 'Menciones']}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="menciones" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.tech} fill={CATEGORY_COLOR[entry.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
