import { describe, expect, it } from 'vitest'
import type { Job } from '../types'
import { matchesQuery, normalize } from './search'

const betsson: Job = {
  id: '1',
  url: '',
  puesto: 'Frontend Software Engineer - Gaming',
  empresa: 'Betsson Group',
  ubicacion: 'Málaga',
  modalidad: 'Híbrido',
  requisitos: ['Angular', 'TypeScript', 'RxJS'],
  encaje: 75,
  motivo: 'Angular 16 y TypeScript encajan con su experiencia',
  fecha_escaneo: '2026-07-04',
}

describe('normalize', () => {
  it('pasa a minúsculas y quita acentos', () => {
    expect(normalize('Málaga')).toBe('malaga')
    expect(normalize('HÍBRIDO')).toBe('hibrido')
  })
})

describe('matchesQuery', () => {
  it('busca por empresa sin distinguir mayúsculas', () => {
    expect(matchesQuery(betsson, 'betsson')).toBe(true)
  })

  it('busca por ubicación ignorando acentos en ambos sentidos', () => {
    expect(matchesQuery(betsson, 'malaga')).toBe(true)
    expect(matchesQuery(betsson, 'Málaga')).toBe(true)
  })

  it('busca dentro de requisitos y del motivo', () => {
    expect(matchesQuery(betsson, 'rxjs')).toBe(true)
    expect(matchesQuery(betsson, 'experiencia')).toBe(true)
  })

  it('exige que TODAS las palabras aparezcan, aunque sea en campos distintos', () => {
    expect(matchesQuery(betsson, 'betsson angular')).toBe(true)
    expect(matchesQuery(betsson, 'betsson react')).toBe(false)
  })

  it('ignora espacios sobrantes', () => {
    expect(matchesQuery(betsson, '  gaming   angular  ')).toBe(true)
  })

  it('una consulta vacía casa con todo', () => {
    expect(matchesQuery(betsson, '')).toBe(true)
  })

  it('no casa lo que no está', () => {
    expect(matchesQuery(betsson, 'kubernetes')).toBe(false)
  })
})
