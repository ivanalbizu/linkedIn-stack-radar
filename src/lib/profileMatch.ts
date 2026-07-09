import type { Profile } from '../types'
import { KNOWN_TECHS, TECH_ALIAS } from '../data/taxonomy'

export type TechStatus = 'have' | 'gap' | 'unknown'

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** true si `name` aparece como palabra completa dentro de `text` (ya normalizados). */
function containsWord(text: string, name: string): boolean {
  return new RegExp(`(?<![a-z0-9])${escapeRegExp(name)}(?![a-z0-9])`).test(text)
}

/** Nombres con los que puede aparecer una tecnología: su token canónico + alias. */
function namesFor(tech: string): string[] {
  const aliases = Object.entries(TECH_ALIAS)
    .filter(([, canon]) => canon === tech)
    .map(([a]) => a)
  return [tech, ...aliases].map(normalize)
}

/**
 * Cruza las tecnologías conocidas con el perfil leído de LinkedIn:
 * - 'have' si aparece en `stack_principal`
 * - 'gap'  si aparece en `carencias`
 * - 'unknown' si no aparece en ninguno
 * En caso de conflicto gana el stack: una carencia que solo *menciona* una
 * tecnología del stack (p.ej. "solo exposición vía curso de Astro") no debe
 * convertirla en brecha.
 */
export function buildTechStatus(profile: Profile | null): Map<string, TechStatus> {
  const map = new Map<string, TechStatus>()
  if (!profile) return map
  const stack = profile.stack_principal.map(normalize)
  const gaps = profile.carencias.map(normalize)
  for (const tech of KNOWN_TECHS) {
    const names = namesFor(tech)
    const inStack = stack.some((item) => names.some((n) => containsWord(item, n)))
    const inGaps = gaps.some((item) => names.some((n) => containsWord(item, n)))
    map.set(tech, inStack ? 'have' : inGaps ? 'gap' : 'unknown')
  }
  return map
}
