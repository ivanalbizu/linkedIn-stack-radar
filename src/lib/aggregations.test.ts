import { describe, expect, it } from 'vitest'
import type { Job } from '../types'
import { countByCategory, countByTech, evolutionShareByTech, scanDates } from './aggregations'

/** Oferta mínima; solo importan requisitos, encaje y fecha en estos tests. */
function job(partial: Partial<Job> & Pick<Job, 'id' | 'requisitos' | 'fecha_escaneo'>): Job {
  return {
    url: '',
    puesto: '',
    empresa: '',
    ubicacion: '',
    modalidad: '',
    encaje: 50,
    motivo: '',
    ...partial,
  }
}

describe('countByTech', () => {
  it('cuenta ofertas por tecnología, no menciones repetidas dentro de una oferta', () => {
    const jobs = [
      job({ id: '1', requisitos: ['React', 'React', 'TypeScript'], fecha_escaneo: '2026-01-01' }),
      job({ id: '2', requisitos: ['React'], fecha_escaneo: '2026-01-01' }),
    ]
    const counts = countByTech(jobs)
    expect(counts.find((c) => c.tech === 'React')?.menciones).toBe(2)
    expect(counts.find((c) => c.tech === 'TypeScript')?.menciones).toBe(1)
  })

  it('ordena de más a menos mencionada, desempatando alfabéticamente', () => {
    const jobs = [
      job({ id: '1', requisitos: ['React', 'Angular', 'Vue 3'], fecha_escaneo: '2026-01-01' }),
      job({ id: '2', requisitos: ['React'], fecha_escaneo: '2026-01-01' }),
    ]
    expect(countByTech(jobs).map((c) => c.tech)).toEqual(['React', 'Angular', 'Vue 3'])
  })

  it('asigna la categoría de cada tecnología', () => {
    const jobs = [job({ id: '1', requisitos: ['Jest'], fecha_escaneo: '2026-01-01' })]
    expect(countByTech(jobs)[0].category).toBe('Testing')
  })

  it('devuelve vacío sin ofertas', () => {
    expect(countByTech([])).toEqual([])
  })
})

describe('countByCategory', () => {
  it('agrupa menciones por categoría', () => {
    const jobs = [
      job({ id: '1', requisitos: ['React', 'Angular', 'Jest'], fecha_escaneo: '2026-01-01' }),
    ]
    const counts = countByCategory(jobs)
    expect(counts.find((c) => c.category === 'Frameworks / UI')?.menciones).toBe(2)
    expect(counts.find((c) => c.category === 'Testing')?.menciones).toBe(1)
  })
})

describe('scanDates', () => {
  it('devuelve fechas únicas en orden ascendente', () => {
    const jobs = [
      job({ id: '1', requisitos: [], fecha_escaneo: '2026-03-01' }),
      job({ id: '2', requisitos: [], fecha_escaneo: '2026-01-01' }),
      job({ id: '3', requisitos: [], fecha_escaneo: '2026-03-01' }),
    ]
    expect(scanDates(jobs)).toEqual(['2026-01-01', '2026-03-01'])
  })
})

describe('evolutionShareByTech', () => {
  it('normaliza por nº de ofertas del escaneo, no por conteo bruto', () => {
    const jobs = [
      // Escaneo 1: 1 de 2 ofertas pide React -> 50%
      job({ id: '1', requisitos: ['React'], fecha_escaneo: '2026-01-01' }),
      job({ id: '2', requisitos: ['Angular'], fecha_escaneo: '2026-01-01' }),
      // Escaneo 2: 3 de 4 piden React -> 75%, aunque en bruto sean más ofertas
      job({ id: '3', requisitos: ['React'], fecha_escaneo: '2026-02-01' }),
      job({ id: '4', requisitos: ['React'], fecha_escaneo: '2026-02-01' }),
      job({ id: '5', requisitos: ['React'], fecha_escaneo: '2026-02-01' }),
      job({ id: '6', requisitos: ['Angular'], fecha_escaneo: '2026-02-01' }),
    ]
    const rows = evolutionShareByTech(jobs, ['React'])
    expect(rows).toEqual([
      { fecha: '2026-01-01', total: 2, React: 50 },
      { fecha: '2026-02-01', total: 4, React: 75 },
    ])
  })

  it('da 0% a una tecnología ausente en un escaneo', () => {
    const jobs = [job({ id: '1', requisitos: ['Angular'], fecha_escaneo: '2026-01-01' })]
    expect(evolutionShareByTech(jobs, ['React'])[0].React).toBe(0)
  })

  it('no rompe sin ofertas', () => {
    expect(evolutionShareByTech([], ['React'])).toEqual([])
  })
})
