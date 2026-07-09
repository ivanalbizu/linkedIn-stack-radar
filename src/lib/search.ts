import type { Job } from '../types'

/** Normaliza para comparar texto: minúsculas y sin acentos. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * true si la oferta casa con la búsqueda. Busca en puesto, empresa, ubicación,
 * modalidad, motivo y requisitos; todas las palabras de la consulta deben
 * aparecer (en cualquier campo), sin distinguir mayúsculas ni acentos.
 */
export function matchesQuery(job: Job, query: string): boolean {
  const haystack = normalize(
    [job.puesto, job.empresa, job.ubicacion, job.modalidad, job.motivo, ...job.requisitos].join(' '),
  )
  return normalize(query)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}
