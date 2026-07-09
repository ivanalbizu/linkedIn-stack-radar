import { useState } from 'react'
import './App.css'
import { useJobs } from './lib/useJobs'
import { useProfile } from './lib/useProfile'
import { FilterProvider } from './filter/FilterContext'
import { CategoryFilter } from './components/CategoryFilter'
import { EncajeFilter } from './components/EncajeFilter'
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
        {error && <p className="notice notice--error">No se pudo cargar jobs.json: {error}</p>}

        {!loading && !error && (
          <>
            <nav className="tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`tab${tab === t.id ? ' tab--active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {tab !== 'perfil' && (
              <div className="filters-row">
                <CategoryFilter />
                <EncajeFilter />
              </div>
            )}

            <section className="panel">
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
