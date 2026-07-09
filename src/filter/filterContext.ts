import { createContext } from 'react'
import type { Category } from '../data/taxonomy'
import type { Job } from '../types'

/** 'all' = todo el histórico; una fecha YYYY-MM-DD = solo ese escaneo. */
export type ScanScope = 'all' | string

export interface FilterValue {
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

export const FilterCtx = createContext<FilterValue | null>(null)
