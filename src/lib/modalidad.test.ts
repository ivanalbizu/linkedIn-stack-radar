import { describe, expect, it } from 'vitest'
import { canonicalModalidad } from './modalidad'

describe('canonicalModalidad', () => {
  it('reconoce los valores simples', () => {
    expect(canonicalModalidad('Remoto')).toBe('Remoto')
    expect(canonicalModalidad('Híbrido')).toBe('Híbrido')
    expect(canonicalModalidad('Presencial')).toBe('Presencial')
  })

  it('ignora mayúsculas y acentos', () => {
    expect(canonicalModalidad('REMOTO')).toBe('Remoto')
    expect(canonicalModalidad('hibrido')).toBe('Híbrido')
  })

  it('un combo con híbrido cuenta como Híbrido', () => {
    expect(canonicalModalidad('Presencial/Híbrido')).toBe('Híbrido')
    expect(canonicalModalidad('Híbrido/Remoto')).toBe('Híbrido')
  })

  it('presencial + remoto (sin la palabra híbrido) también es Híbrido', () => {
    expect(canonicalModalidad('Remoto o Presencial')).toBe('Híbrido')
  })

  it('lo desconocido cae en No especificado', () => {
    expect(canonicalModalidad('No especificado')).toBe('No especificado')
    expect(canonicalModalidad('')).toBe('No especificado')
  })
})
