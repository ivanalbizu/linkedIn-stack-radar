/**
 * Normaliza la modalidad de una oferta a una categoría canónica, solo para
 * filtrar y contar (el texto original de `modalidad` se sigue mostrando tal cual).
 * Los valores del escaneo no son uniformes: "Presencial/Híbrido", "Híbrido/Remoto",
 * "No especificado", etc. Un combo con "híbrido" (o presencial+remoto) cuenta como
 * Híbrido, que es lo que implica en la práctica.
 */
export type Modalidad = 'Remoto' | 'Híbrido' | 'Presencial' | 'No especificado'

export const MODALIDAD_ORDER: Modalidad[] = ['Remoto', 'Híbrido', 'Presencial', 'No especificado']

export function canonicalModalidad(modalidad: string): Modalidad {
  const s = modalidad.toLowerCase()
  const remoto = s.includes('remoto')
  const hibrido = s.includes('híbrido') || s.includes('hibrido')
  const presencial = s.includes('presencial')
  if (hibrido || (remoto && presencial)) return 'Híbrido'
  if (remoto) return 'Remoto'
  if (presencial) return 'Presencial'
  return 'No especificado'
}
