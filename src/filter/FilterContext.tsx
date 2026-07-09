import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Category } from '../data/taxonomy'
import type { Job } from '../types'

/** 'all' = todo el histórico; una fecha YYYY-MM-DD = solo ese escaneo. */
export type ScanScope = 'all' | string

interface FilterValue {
  /** Categorías activas. Vacío = sin filtro (se muestran todas). */
  active: Set<Category>
  toggle: (cat: Category) => void
  clear: () => void
  /** true si la categoría debe mostrarse dado el filtro actual. */
  isVisible: (cat: Category) => boolean
  /** Encaje mínimo de las ofertas consideradas en todas las vistas (0 = todas). */
  minEncaje: number
  setMinEncaje: (n: number) => void
  /** Escaneo considerado (histórico completo o una fecha concreta). */
  scanScope: ScanScope
  setScanScope: (s: ScanScope) => void
  /** true si la oferta pasa los filtros globales de encaje y escaneo. */
  passesGlobal: (job: Job) => boolean
}

const FilterCtx = createContext<FilterValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Set<Category>>(new Set())
  const [minEncaje, setMinEncaje] = useState(0)
  const [scanScope, setScanScope] = useState<ScanScope>('all')

  const value = useMemo<FilterValue>(
    () => ({
      active,
      toggle: (cat) =>
        setActive((prev) => {
          const next = new Set(prev)
          if (next.has(cat)) next.delete(cat)
          else next.add(cat)
          return next
        }),
      clear: () => setActive(new Set()),
      isVisible: (cat) => active.size === 0 || active.has(cat),
      minEncaje,
      setMinEncaje,
      scanScope,
      setScanScope,
      passesGlobal: (job) =>
        job.encaje >= minEncaje && (scanScope === 'all' || job.fecha_escaneo === scanScope),
    }),
    [active, minEncaje, scanScope],
  )

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>
}

export function useFilter(): FilterValue {
  const ctx = useContext(FilterCtx)
  if (!ctx) throw new Error('useFilter debe usarse dentro de <FilterProvider>')
  return ctx
}
