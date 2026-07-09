import { useEffect, useMemo, useState } from 'react'
import type { Job } from '../types'
import { CATEGORY_COLOR, categoryOf } from '../data/taxonomy'
import { useFilter } from '../filter/FilterContext'
import { JOBS_PROMPT } from '../data/prompts'
import { matchesQuery } from '../lib/search'
import { CopyPromptButton } from './CopyPromptButton'

type SortKey = 'encaje' | 'empresa' | 'puesto'

const PAGE_SIZE = 10

function scoreClass(encaje: number): string {
  if (encaje >= 70) return 'score score--high'
  if (encaje >= 45) return 'score score--mid'
  return 'score score--low'
}

export function JobsTable({ jobs }: { jobs: Job[] }) {
  const { isVisible, active, minEncaje, scanScope, passesGlobal } = useFilter()
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'encaje', asc: false })
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = jobs.filter(passesGlobal)
    if (active.size > 0)
      result = result.filter((j) => j.requisitos.some((t) => isVisible(categoryOf(t))))
    if (query.trim()) result = result.filter((j) => matchesQuery(j, query))

    return [...result].sort((a, b) => {
      let cmp: number
      if (sort.key === 'encaje') cmp = a.encaje - b.encaje
      else cmp = String(a[sort.key]).localeCompare(String(b[sort.key]))
      return sort.asc ? cmp : -cmp
    })
  }, [jobs, active, isVisible, passesGlobal, query, sort])

  // Al cambiar búsqueda, filtros u orden se vuelve a la primera página.
  useEffect(() => {
    setPage(1)
  }, [query, active, minEncaje, scanScope, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const from = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length)

  function toggleSort(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, asc: !prev.asc } : { key, asc: key !== 'encaje' }))
  }

  const arrow = (key: SortKey) => (sort.key === key ? (sort.asc ? ' ↑' : ' ↓') : '')

  return (
    <div className="table-wrap">
      <div className="view-toolbar">
        <input
          type="search"
          className="search"
          placeholder="Buscar por empresa, puesto, tecnología…"
          aria-label="Buscar ofertas por empresa o palabras clave"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="muted">
          {from}–{to} de {filtered.length} ofertas
          {filtered.length !== jobs.length ? ` (${jobs.length} en total)` : ''}
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
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">
                Sin resultados para esta búsqueda/filtro.
              </td>
            </tr>
          )}
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

      {totalPages > 1 && (
        <nav className="pager" aria-label="Paginación de ofertas">
          <button
            type="button"
            className="pager__btn"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`pager__btn${n === currentPage ? ' pager__btn--active' : ''}`}
              aria-current={n === currentPage ? 'page' : undefined}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="pager__btn"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </nav>
      )}
    </div>
  )
}
