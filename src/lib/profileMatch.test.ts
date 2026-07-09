import { describe, expect, it } from 'vitest'
import type { Profile } from '../types'
import { buildTechStatus } from './profileMatch'

function profile(partial: Partial<Profile> = {}): Profile {
  return {
    nombre: '',
    titular: '',
    ubicacion: '',
    resumen: '',
    stack_principal: [],
    accesibilidad: [],
    ia_herramientas: [],
    experiencia: [],
    formacion: [],
    carencias: [],
    fecha_lectura: '2026-07-06',
    ...partial,
  }
}

describe('buildTechStatus', () => {
  it('marca como "have" lo que está en el stack', () => {
    const status = buildTechStatus(profile({ stack_principal: ['TypeScript'] }))
    expect(status.get('TypeScript')).toBe('have')
  })

  it('marca como "gap" lo que está en carencias', () => {
    const status = buildTechStatus(profile({ carencias: ['React (uso profesional)'] }))
    expect(status.get('React')).toBe('gap')
  })

  it('marca como "unknown" lo que no aparece en ninguno', () => {
    expect(buildTechStatus(profile()).get('Docker')).toBe('unknown')
  })

  it('reconoce la tecnología a través de sus alias en el perfil', () => {
    // El perfil dice "Lit"; el token canónico es "LitElement".
    const status = buildTechStatus(profile({ stack_principal: ['Lit'] }))
    expect(status.get('LitElement')).toBe('have')
  })

  it('encuentra la tecnología dentro de una frase con paréntesis', () => {
    const status = buildTechStatus(profile({ stack_principal: ['Playwright (E2E testing)'] }))
    expect(status.get('Playwright')).toBe('have')
  })

  it('el stack gana sobre una carencia que solo menciona la tecnología', () => {
    // Caso real: Astro está en el stack, pero se menciona en la carencia de React.
    const status = buildTechStatus(
      profile({
        stack_principal: ['Astro'],
        carencias: ['React (uso profesional, solo exposición vía curso de Astro)'],
      }),
    )
    expect(status.get('Astro')).toBe('have')
    expect(status.get('React')).toBe('gap')
  })

  it('coincide por palabra completa, no por subcadena', () => {
    // "Java" no debe activarse por "JavaScript".
    const status = buildTechStatus(profile({ stack_principal: ['JavaScript'] }))
    expect(status.get('JavaScript')).toBe('have')
    expect(status.get('Java')).toBe('unknown')
  })

  it('ignora acentos y mayúsculas al comparar', () => {
    const status = buildTechStatus(profile({ carencias: ['INGLÉS'] }))
    expect(status.get('Inglés')).toBe('gap')
  })

  it('devuelve un mapa vacío sin perfil', () => {
    expect(buildTechStatus(null).size).toBe(0)
  })
})
