/** Una oferta de LinkedIn analizada. Coincide con el esquema de `public/jobs.json`. */
export interface Job {
  /** Identificador de la oferta en LinkedIn (clave para deduplicar entre escaneos). */
  id: string
  url: string
  puesto: string
  empresa: string
  ubicacion: string
  modalidad: string
  /** Tecnologías requeridas, ya normalizadas como tokens (no texto libre). */
  requisitos: string[]
  /** Puntuación de encaje 0-100 (criterio heredado del proyecto anterior). */
  encaje: number
  motivo: string
  /** Fecha del escaneo en formato YYYY-MM-DD. Clave para la vista de evolución. */
  fecha_escaneo: string
}

/** Una etapa de experiencia profesional dentro del perfil. */
export interface ExperienceItem {
  empresa: string
  rol: string
  periodo: string
  modalidad: string
  detalle: string
}

/**
 * Perfil profesional leído de LinkedIn. Es el contexto contra el que se
 * puntúa el `encaje` de cada oferta. Coincide con `public/perfil.json`.
 */
export interface Profile {
  nombre: string
  titular: string
  ubicacion: string
  resumen: string
  stack_principal: string[]
  accesibilidad: string[]
  ia_herramientas: string[]
  experiencia: ExperienceItem[]
  formacion: string[]
  carencias: string[]
  /** Fecha de lectura del perfil desde LinkedIn (YYYY-MM-DD). */
  fecha_lectura: string
}
