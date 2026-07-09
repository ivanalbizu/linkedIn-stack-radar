import { describe, expect, it } from 'vitest'
import { canonicalTech, categoryOf, KNOWN_TECHS, TECH_ALIAS } from './taxonomy'

describe('categoryOf', () => {
  it('devuelve la categoría de una tecnología conocida', () => {
    expect(categoryOf('React')).toBe('Frameworks / UI')
    expect(categoryOf('Jest')).toBe('Testing')
    expect(categoryOf('WCAG')).toBe('Design Systems / A11y')
  })

  it('cae en "Otros" si no está mapeada (aviso de que falta clasificar)', () => {
    expect(categoryOf('TecnologíaInventada')).toBe('Otros')
  })
})

describe('canonicalTech', () => {
  it('resuelve alias a su nombre canónico', () => {
    expect(canonicalTech('Lit')).toBe('LitElement')
    expect(canonicalTech('Stencil.js')).toBe('StencilJS')
    expect(canonicalTech('Vue.js')).toBe('Vue 3')
    expect(canonicalTech('NodeJS')).toBe('Node.js')
  })

  it('deja intacto un token que ya es canónico', () => {
    expect(canonicalTech('React')).toBe('React')
  })

  it('deja intacto un token desconocido', () => {
    expect(canonicalTech('Svelte')).toBe('Svelte')
  })

  it('es idempotente: canonicalizar dos veces no cambia nada', () => {
    for (const alias of Object.keys(TECH_ALIAS)) {
      const once = canonicalTech(alias)
      expect(canonicalTech(once)).toBe(once)
    }
  })
})

describe('coherencia de la taxonomía', () => {
  it('todo destino de alias es un token conocido y con categoría', () => {
    for (const [alias, canon] of Object.entries(TECH_ALIAS)) {
      expect(KNOWN_TECHS, `alias "${alias}" apunta a "${canon}"`).toContain(canon)
      expect(categoryOf(canon)).not.toBe('Otros')
    }
  })

  it('ningún alias es a la vez un token canónico (evita ciclos)', () => {
    for (const alias of Object.keys(TECH_ALIAS)) {
      expect(KNOWN_TECHS, `"${alias}" es alias y token canónico a la vez`).not.toContain(alias)
    }
  })
})
