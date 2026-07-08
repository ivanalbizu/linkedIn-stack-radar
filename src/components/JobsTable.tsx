import { useMemo, useState } from 'react'
import type { Job } from '../types'
import { CATEGORY_COLOR, categoryOf } from '../data/taxonomy'
import { useFilter } from '../filter/FilterContext'
import { JOBS_PROMPT } from '../data/prompts'
import { CopyPromptButton } from './CopyPromptButton'

type SortKey = 'encaje' | 'empresa' | 'puesto'

function scoreClass(encaje: number): string {
  if (encaje >= 70) return 'score score--high'
  if (encaje >= 45) return 'score score--mid'
  return 'score score--low'
}

export function JobsTable({ jobs }: { jobs: Job[] }) {
  const { isVisible, active } = useFilter()
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'encaje', asc: false })

  const rows = useMemo(() => {
    const filtered =
      active.size === 0
        ? jobs
        : jobs.filter((j) => j.requisitos.some((t) => isVisible(categoryOf(t))))

    return [...filtered].sort((a, b) => {
      let cmp: number
      if (sort.key === 'encaje') cmp = a.encaje - b.encaje
      else cmp = String(a[sort.key]).localeCompare(String(b[sort.key]))
      return sort.asc ? cmp : -cmp
    })
  }, [jobs, active, isVisible, sort])

  function toggleSort(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, asc: !prev.asc } : { key, asc: key !== 'encaje' }))
  }

  const arrow = (key: SortKey) => (sort.key === key ? (sort.asc ? ' ↑' : ' ↓') : '')

  return (
    <div className="table-wrap">
      <div className="view-toolbar">
        <p className="muted">
          {rows.length} de {jobs.length} ofertas
          {active.size > 0 ? ' (filtradas por categoría)' : ''}
        </p>
        <CopyPromptButton text={JOBS_PROMPT} label="Copiar prompt para buscar ofertas" />
      </div>
      <table className="jobs">
        <thead>
          <tr>
            <th className="sortable" onClick={() => toggleSort('puesto')}>
              Puesto{arrow('puesto')}
            </th>
            <th className="sortable" onClick={() => toggleSort('empresa')}>
              Empresa{arrow('empresa')}
            </th>
            <th>Ubicación</th>
            <th>Modalidad</th>
            <th>Requisitos</th>
            <th className="sortable num" onClick={() => toggleSort('encaje')}>
              Encaje{arrow('encaje')}
            </th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((job) => (
            <tr key={job.id}>
              <td>
                <a href={job.url} target="_blank" rel="noreferrer">
                  {job.puesto}
                </a>
              </td>
              <td>{job.empresa}</td>
              <td>{job.ubicacion}</td>
              <td>{job.modalidad}</td>
              <td>
                <div className="reqs">
                  {job.requisitos.length === 0 && <span className="muted">—</span>}
                  {job.requisitos.map((tech) => (
                    <span
                      key={tech}
                      className="tag"
                      style={{ '--tag-color': CATEGORY_COLOR[categoryOf(tech)] } as React.CSSProperties}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </td>
              <td className="num">
                <span className={scoreClass(job.encaje)}>{job.encaje}</span>
              </td>
              <td className="motivo">{job.motivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
