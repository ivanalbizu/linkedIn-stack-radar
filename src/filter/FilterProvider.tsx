import { useMemo, useState, type ReactNode } from 'react'
import type { Category } from '../data/taxonomy'
import { FilterCtx, type FilterValue, type ScanScope } from './filterContext'

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
