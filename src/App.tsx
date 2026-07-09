import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import './App.css'
import { useJobs } from './lib/useJobs'
import { useProfile } from './lib/useProfile'
import { scanDates } from './lib/aggregations'
import { FilterProvider } from './filter/FilterProvider'
import { CategoryFilter } from './components/CategoryFilter'
import { EncajeFilter } from './components/EncajeFilter'
import { ScanFilter } from './components/ScanFilter'
import { JobsTable } from './components/JobsTable'
import { TechRanking } from './components/TechRanking'
import { TimeEvolution } from './components/TimeEvolution'
import { ProfileCard } from './components/ProfileCard'

type Tab = 'ranking' | 'evolucion' | 'ofertas' | 'perfil'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ranking', label: 'Ranking de tecnologías' },
  { id: 'evolucion', label: 'Evolución temporal' },
  { id: 'ofertas', label: 'Ofertas' },
  { id: 'perfil', label: 'Mi perfil' },
]

function App() {
  const { jobs, loading, error } = useJobs()
  const { profile } = useProfile()
  const [tab, setTab] = useState<Tab>('ranking')
  const dates = useMemo(() => scanDates(jobs), [jobs])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  /** Patrón ARIA de tabs: flechas mueven el foco y activan; Home/End a los extremos. */
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = TABS.length - 1
    let next: number | null = null
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next === null) return
    e.preventDefault()
    setTab(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <FilterProvider>
      <div className="app">
        <header className="app__header">
          <h1>LinkedIn Stack Radar</h1>
          <p className="subtitle">
            Qué stacks se demandan más en ofertas relevantes para un perfil Frontend / Design
            Systems, para decidir en qué formarse.
          </p>
        </header>

        {loading && <p className="muted">Cargando ofertas…</p>}
        {error && (
          <p className="notice notice--error" role="alert">
            No se pudo cargar jobs.json: {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="tabs" role="tablist" aria-label="Vistas del radar">
              {TABS.map((t, i) => {
                const selected = tab === t.id
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[i] = el
                    }}
                    id={`tab-${t.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={selected ? 0 : -1}
                    className={`tab${selected ? ' tab--active' : ''}`}
                    onClick={() => setTab(t.id)}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            {tab !== 'perfil' && (
              <div className="filters-row">
                <CategoryFilter />
                <div className="filters-row__globals">
                  {tab !== 'evolucion' && <ScanFilter dates={dates} />}
                  <EncajeFilter />
                </div>
              </div>
            )}

            <section
              className="panel"
              id={`panel-${tab}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab}`}
              tabIndex={0}
            >
              {tab === 'ranking' && <TechRanking jobs={jobs} profile={profile} />}
              {tab === 'evolucion' && <TimeEvolution jobs={jobs} />}
              {tab === 'ofertas' && <JobsTable jobs={jobs} />}
              {tab === 'perfil' &&
                (profile ? (
                  <ProfileCard profile={profile} />
                ) : (
                  <p className="muted">Cargando perfil…</p>
                ))}
            </section>
          </>
        )}

        <footer className="app__footer">
          <span>{jobs.length} ofertas · fuente: jobs.json (estático, sin backend)</span>
        </footer>
      </div>
    </FilterProvider>
  )
}

export default App
