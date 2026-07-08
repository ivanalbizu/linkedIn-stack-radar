# linkedin-stack-radar

App **local** para visualizar qué stacks tecnológicos se demandan más en las ofertas de LinkedIn
relevantes para un perfil Frontend / Design Systems Engineer, y decidir en qué formarse.

Es una herramienta personal pensada para levantarse en local junto a su repo (los datos viven en
ficheros JSON versionados). Se comparte como código por si a alguien le interesa probarla o
adaptarla a su propio perfil — no hay despliegue ni backend.

**No es** un tracker de candidaturas. El objetivo secundario, igual de real, es practicar React con
un alcance pequeño. Ver [`CLAUDE.md`](./CLAUDE.md) para el contexto completo.

## Pruébala

```bash
git clone <este-repo>
cd linkedin-stack-radar
pnpm install
pnpm dev        # abre http://localhost:5173
```

Verás 4 pestañas: **Ranking de tecnologías** (nº de ofertas que piden cada una), **Evolución
temporal** (% de ofertas por escaneo que piden cada tecnología), **Ofertas** (tabla con encaje y
motivo) y **Mi perfil** (el contexto contra el que se puntúa el encaje). Filtro por categoría de
tecnología en las vistas de datos.

Para adaptarla a tu perfil: sustituye `public/jobs.json` y `public/perfil.json` por tus datos
(esquemas abajo) y ajusta la taxonomía en `src/data/taxonomy.ts`.

## Stack

- Vite + React + TypeScript, Recharts para gráficos
- `public/jobs.json` y `public/perfil.json` como única fuente de datos (estáticos, versionados)
- pnpm como gestor de paquetes

## Flujo de datos (asistido, sin scraping)

1. Una sesión de Claude + plugin de Chrome lee LinkedIn con los prompts fijados (cada pestaña de
   la app tiene un botón que copia el prompt exacto; también en
   [`docs/prompts-extraccion.md`](docs/prompts-extraccion.md)).
2. El resultado JSON se incorpora **en local**:
   - **Ofertas** → `pnpm add-jobs <fichero.json>` fusiona contra `public/jobs.json` sin duplicar
     por `id` (`pnpm add-jobs:dry` para simular, `--update` para sobrescribir, `--fecha` para fijar
     la fecha de escaneo).
   - **Perfil** → sobrescribir `public/perfil.json` con el objeto devuelto.
3. La app solo visualiza. La vista de evolución cobra sentido a partir de varios escaneos con
   distinta `fecha_escaneo`.
4. El historial de datos es el historial de git: cada escaneo puede ser un commit.

## Scripts

```bash
pnpm dev            # servidor de desarrollo
pnpm build          # typecheck (tsc) + build de producción
pnpm preview        # servir el build
pnpm lint           # oxlint
pnpm add-jobs       # fusionar ofertas nuevas en public/jobs.json (dedup por id)
pnpm add-jobs:dry   # lo mismo, sin escribir (simulación)
```

## Esquemas de datos

`public/jobs.json` — array de ofertas:

```json
{
  "id": "4425844348",
  "url": "https://www.linkedin.com/jobs/view/4425844348/",
  "puesto": "Frontend Software Engineer - Gaming",
  "empresa": "Betsson Group",
  "ubicacion": "Málaga",
  "modalidad": "Híbrido",
  "requisitos": ["Angular", "TypeScript", "RxJS", "Web Components", "StencilJS"],
  "encaje": 75,
  "motivo": "Justificación de la puntuación según el perfil…",
  "fecha_escaneo": "2026-07-04"
}
```

- `requisitos`: tokens normalizados (no texto libre) — es lo que permite agregar sin reparsear.
- `encaje`: 0-100, calculado por Claude en el momento del escaneo contra el perfil de ese momento
  (la app no lo recalcula; para refrescarlo, re-escanear con `--update`).
- `id`: el de la URL de LinkedIn, clave de deduplicación entre escaneos.

`public/perfil.json` — objeto único con el perfil leído de LinkedIn (`nombre`, `titular`,
`resumen`, `stack_principal`, `accesibilidad`, `ia_herramientas`, `experiencia`, `formacion`,
`carencias`, `fecha_lectura`). Tipos completos en [`src/types.ts`](src/types.ts).

## Estructura

```
public/jobs.json            # ofertas analizadas (fuente de verdad)
public/perfil.json          # perfil leído de LinkedIn
scripts/add-jobs.mjs        # fusión CLI de ofertas nuevas (dedup por id)
src/types.ts                # tipos Job y Profile
src/data/taxonomy.ts        # tecnología -> categoría + colores
src/data/prompts.ts         # prompts para el plugin de Chrome (fuente de verdad)
src/lib/aggregations.ts     # conteos y serie temporal normalizada
src/lib/useJobs.ts          # carga estática de jobs.json
src/lib/useProfile.ts       # carga estática de perfil.json
src/filter/FilterContext.tsx# filtro por categoría (Context)
src/components/             # CategoryFilter, TechRanking, TimeEvolution, JobsTable,
                            # ProfileCard, CopyPromptButton
```
