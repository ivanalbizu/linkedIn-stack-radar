import type { Profile } from '../types'
import { KNOWN_TECHS } from './taxonomy'

/**
 * Textos para pegar en el plugin de Chrome de Claude. Son la fuente de verdad:
 * los botones "Copiar" de la app copian exactamente estas cadenas.
 *
 * El flujo tiene dos frecuencias distintas:
 * - PERFIL: se ejecuta pocas veces (sobrescribe public/perfil.json).
 * - OFERTAS: se ejecuta cada ciertos días (se añade a public/jobs.json con add-jobs).
 */

/** Prompt para leer el perfil de LinkedIn -> public/perfil.json */
export const PROFILE_PROMPT = `Lee mi perfil de LinkedIn en la pestaña activa y devuélveme únicamente un objeto JSON válido (sin texto antes ni después, sin bloque de código markdown), con exactamente estas claves:

{
  "nombre": "string — nombre y apellidos",
  "titular": "string — el titular/headline del perfil",
  "ubicacion": "string — ubicación que aparece en el perfil",
  "resumen": "string — el 'Acerca de' resumido en 2-4 frases",
  "stack_principal": ["array de strings — tecnologías/skills principales, una por elemento"],
  "accesibilidad": ["array de strings — menciones a accesibilidad, WCAG, cursos, etc."],
  "ia_herramientas": ["array de strings — uso de IA y herramientas (Claude Code, Cursor, Copilot…)"],
  "experiencia": [
    {
      "empresa": "string",
      "rol": "string — puesto",
      "periodo": "string — p.ej. '2022 - actualidad'",
      "modalidad": "string — 'Remoto' | 'Híbrido' | ciudad | '' si no consta",
      "detalle": "string — 1 frase con stack/logros de esa etapa"
    }
  ],
  "formacion": ["array de strings — cada título/curso en un elemento"],
  "carencias": ["array de strings — tecnologías o roles que NO tengo (React, Vue profesional, Tech Lead formal…)"],
  "fecha_lectura": "YYYY-MM-DD — la fecha de hoy"
}

Reglas:
- Devuelve solo el objeto JSON, nada más.
- Todos los campos son obligatorios; si algo no consta, usa "" o [] (no omitas la clave).
- No inventes datos que no estén en el perfil, salvo "carencias", que puedes inferir de tecnologías demandadas en el mercado que NO aparezcan en mi perfil.
- "fecha_lectura" en formato YYYY-MM-DD.`

/** Bloque con mi perfil, para que el encaje se puntúe contra datos reales y no de memoria. */
function profileBlock(profile: Profile | null): string {
  if (!profile) {
    return 'Mi perfil: Frontend / Design Systems Engineer (Web Components, TypeScript, Angular de maquetación).'
  }
  return [
    'Mi perfil actual (úsalo para puntuar el encaje, no lo asumas de memoria):',
    `- Identidad: ${profile.titular}.`,
    `- Stack con experiencia real (encaje alto si la oferta lo pide): ${profile.stack_principal.join(', ')}.`,
    `- Carencias (si son requisito duro no negociable, penaliza fuerte): ${profile.carencias.join(', ')}.`,
  ].join('\n')
}

/**
 * Prompt para buscar ofertas en LinkedIn -> public/jobs.json (vía add-jobs).
 * Se construye con el perfil cargado para que el encaje no dependa de lo que
 * Claude "recuerde" en la sesión del plugin.
 */
export function buildJobsPrompt(profile: Profile | null): string {
  return `Analiza las ofertas de Frontend / Design Systems relevantes para mi perfil que veas en la pestaña activa de LinkedIn y devuélveme únicamente un array JSON (sin texto alrededor, sin bloque de código markdown), donde cada elemento es:

{
  "id": "string — el id numérico de la oferta en la URL de LinkedIn",
  "url": "https://www.linkedin.com/jobs/view/<id>/",
  "puesto": "string",
  "empresa": "string",
  "ubicacion": "string",
  "modalidad": "Remoto | Híbrido | Presencial | ...",
  "requisitos": ["array de tecnologías NORMALIZADAS — ver lista de tokens abajo"],
  "encaje": 0,
  "motivo": "string — 1-2 frases justificando el encaje según mi perfil",
  "fecha_escaneo": "YYYY-MM-DD — la fecha de hoy"
}

${profileBlock(profile)}

Reglas para "requisitos" (importante para poder agregar):
- Usa tokens de esta lista siempre que apliquen, con esta grafía exacta:
  ${KNOWN_TECHS.join(', ')}.
- Si una tecnología no está en la lista, añádela con un nombre corto y consistente.
- No metas texto libre ni frases en "requisitos", solo nombres de tecnología.

Reglas para "encaje" (0-100), según mi perfil de arriba:
- Peso alto: experiencia profesional directa con lo que pide la oferta (las tecnologías de mi stack).
- Peso medio: experiencia adyacente o transferible.
- Penaliza fuerte: requisito "duro" no negociable que esté en mis carencias (p.ej. "5 años de React") → por debajo de 40-45.
- Formación/cursos: matiz menor. Rol/seniority (Tech Lead, Staff) que no acredito: ajuste fino a la baja.

Otras reglas:
- Devuelve solo el array JSON, nada más.
- Un elemento por oferta; el "id" es el de la URL (sirve para no duplicar entre escaneos).
- "fecha_escaneo" en formato YYYY-MM-DD (misma fecha para todas las de esta tanda).`
}
