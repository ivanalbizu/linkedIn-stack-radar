import type { Job } from '../types'
import { type Category, categoryOf } from '../data/taxonomy'

export interface TechCount {
  tech: string
  category: Category
  /** Nº de ofertas donde aparece la tecnología. */
  menciones: number
}

/**
 * Cuenta menciones por tecnología (una oferta cuenta 1 por tecnología aunque
 * la repita). Ordenado de más a menos mencionada.
 */
export function countByTech(jobs: Job[]): TechCount[] {
  const counts = new Map<string, number>()
  for (const job of jobs) {
    for (const tech of new Set(job.requisitos)) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tech, menciones]) => ({ tech, category: categoryOf(tech), menciones }))
    .sort((a, b) => b.menciones - a.menciones || a.tech.localeCompare(b.tech))
}

export interface CategoryCount {
  category: Category
  menciones: number
}

/** Suma de menciones agrupadas por categoría. */
export function countByCategory(jobs: Job[]): CategoryCount[] {
  const counts = new Map<Category, number>()
  for (const job of jobs) {
    for (const tech of new Set(job.requisitos)) {
      const cat = categoryOf(tech)
      counts.set(cat, (counts.get(cat) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([category, menciones]) => ({ category, menciones }))
    .sort((a, b) => b.menciones - a.menciones)
}

/** Fechas de escaneo presentes en los datos, ordenadas ascendentemente. */
export function scanDates(jobs: Job[]): string[] {
  return [...new Set(jobs.map((j) => j.fecha_escaneo))].sort()
}

export interface EvolutionRow {
  /** fecha_escaneo */
  fecha: string
  /** nº de ofertas de ese escaneo (para contexto en el tooltip) */
  total: number
  /** % de ofertas de ese escaneo que piden cada tecnología (0-100) */
  [tech: string]: string | number
}

/**
 * Serie temporal normalizada: para cada fecha_escaneo, qué **porcentaje** de las
 * ofertas de ese escaneo menciona cada una de las `techs`. Se normaliza por el nº
 * de ofertas del día para que la tendencia no dependa de cuántas se escanearon
 * (cuota de demanda, no conteo bruto). Pensado para un gráfico de líneas.
 */
export function evolutionShareByTech(jobs: Job[], techs: string[]): EvolutionRow[] {
  const dates = scanDates(jobs)
  return dates.map((fecha) => {
    const jobsOfDate = jobs.filter((j) => j.fecha_escaneo === fecha)
    const total = jobsOfDate.length
    const row: EvolutionRow = { fecha, total }
    for (const tech of techs) {
      const n = jobsOfDate.filter((j) => j.requisitos.includes(tech)).length
      row[tech] = total > 0 ? Math.round((n / total) * 100) : 0
    }
    return row
  })
}
