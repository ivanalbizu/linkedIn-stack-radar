import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type YAxisTickContentProps,
} from 'recharts'
import type { Job, Profile } from '../types'
import { CATEGORY_COLOR } from '../data/taxonomy'
import { countByTech } from '../lib/aggregations'
import { buildTechStatus, type TechStatus } from '../lib/profileMatch'
import { useFilter } from '../filter/FilterContext'

/** Nº de tecnologías visibles inicialmente; el resto tras "Mostrar todas". */
const INITIAL_COUNT = 30
const TOP_GAPS = 5

const STATUS_SYMBOL: Record<TechStatus, string> = { have: '✓ ', gap: '✗ ', unknown: '' }
const STATUS_COLOR: Record<TechStatus, string> = { have: '#1a7f37', gap: '#c0392b', unknown: '' }

/** Tick del eje Y con marca de estado respecto al perfil (✓ la tengo / ✗ carencia). */
function StatusTick({
  x,
  y,
  payload,
  statuses,
}: Pick<YAxisTickContentProps, 'x' | 'y' | 'payload'> & {
  statuses: Map<string, TechStatus>
}) {
  const tech = String(payload.value ?? '')
  const status = statuses.get(tech) ?? 'unknown'
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill="var(--muted)">
      {status !== 'unknown' && (
        <tspan fill={STATUS_COLOR[status]} fontWeight={700}>
          {STATUS_SYMBOL[status]}
        </tspan>
      )}
      {tech}
    </text>
  )
}

export function TechRanking({ jobs, profile }: { jobs: Job[]; profile: Profile | null }) {
  const { isVisible, active, minEncaje, scanScope, passesGlobal } = useFilter()
  const [showAll, setShowAll] = useState(false)

  const statuses = useMemo(() => buildTechStatus(profile), [profile])

  const data = useMemo(
    () => countByTech(jobs.filter(passesGlobal)).filter((t) => isVisible(t.category)),
    [jobs, passesGlobal, isVisible],
  )

  const topGaps = useMemo(
    () => data.filter((t) => statuses.get(t.tech) === 'gap').slice(0, TOP_GAPS),
    [data, statuses],
  )

  const visible = showAll ? data : data.slice(0, INITIAL_COUNT)
  const hasMore = data.length > INITIAL_COUNT
  const chartHeight = Math.max(240, visible.length * 26 + 40)

  return (
    <div>
      <p className="muted">
        {showAll || !hasMore
          ? `${data.length} tecnologías`
          : `Top ${visible.length} de ${data.length} tecnologías`}
        {active.size > 0 ? ' en las categorías seleccionadas' : ''}
        {minEncaje > 0 ? ` con encaje ≥ ${minEncaje}` : ''}
        {scanScope !== 'all' ? ` del escaneo ${scanScope}` : ''} · el conteo es nº de ofertas donde
        aparece cada una
        {profile ? (
          <>
            {' '}
            · <span className="mark-have">✓ en tu perfil</span> ·{' '}
            <span className="mark-gap">✗ carencia declarada</span>
          </>
        ) : null}
      </p>

      {topGaps.length > 0 && (
        <p className="gaps">
          <strong>Top brechas</strong> (demandadas y en tus carencias):
          {topGaps.map((t) => (
            <span
              key={t.tech}
              className="tag"
              style={{ '--tag-color': '#c0392b' } as React.CSSProperties}
            >
              {t.tech} · {t.menciones}
            </span>
          ))}
        </p>
      )}

      <div className="chart" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={visible} layout="vertical" margin={{ left: 24, right: 24, top: 8, bottom: 8 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="tech"
              width={150}
              tick={(props: YAxisTickContentProps) => (
                <StatusTick x={props.x} y={props.y} payload={props.payload} statuses={statuses} />
              )}
              interval={0}
            />
            <Tooltip
              formatter={(value) => [`${value} ofertas`, 'Menciones']}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="menciones" radius={[0, 4, 4, 0]}>
              {visible.map((entry) => (
                <Cell key={entry.tech} fill={CATEGORY_COLOR[entry.category]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {hasMore && (
        <div className="show-all">
          <button type="button" className="pager__btn" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Mostrar menos' : `Mostrar todas (${data.length})`}
          </button>
        </div>
      )}
    </div>
  )
}
