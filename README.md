# linkedin-stack-radar

App **local** para visualizar qué stacks tecnológicos se demandan más en las ofertas de LinkedIn
relevantes para un perfil Frontend / Design Systems Engineer, y decidir en qué formarse.

Es una herramienta personal pensada para levantarse en local junto a su repo (los datos viven en
ficheros JSON versionados). Se comparte como código por si a alguien le interesa probarla o
adaptarla a su propio perfil — no hay despliegue ni backend.

**No es** un tracker de candidaturas. El objetivo secundario, igual de real, es practicar React con
un alcance pequeño. Ver [`CLAUDE.md`](./CLAUDE.md) para el contexto completo.

![Vista de ranking: gráfico de barras horizontales con las tecnologías más pedidas (TypeScript,
React, HTML/CSS, JavaScript, Angular…), cada barra coloreada por categoría y marcada con ✓ si está
en el perfil o ✗ si es una carencia declarada. Encima, un resumen de "Top brechas" con React,
Vue 3, Liderazgo técnico, Cloud y AWS.](docs/img/ranking.png)

## Pruébala

```bash
git clone <este-repo>
cd linkedin-stack-radar
pnpm install
pnpm dev        # abre http://localhost:5173
```

Verás 4 pestañas: **Ranking de tecnologías** (nº de ofertas que piden cada una, con marcas
✓ ya-la-tengo / ✗ carencia cruzando con el perfil, y un resumen de "top brechas"), **Evolución
temporal** (% de ofertas por escaneo que piden cada tecnología, con selector de cuáles dibujar),
**Ofertas** (tabla con buscador, paginación, encaje y motivo) y **Mi perfil** (el contexto contra
el que se puntúa el encaje).

Las vistas de datos se filtran por categoría de tecnología, por **encaje mínimo** (para mirar solo
las ofertas a las que podrías aspirar) y por **escaneo** (demanda viva del último escaneo frente al
histórico acumulado).

La app es accesible: navegación completa por teclado (las pestañas siguen el patrón ARIA con
flechas y Home/End), `aria-sort` en la tabla, alternativa textual de los gráficos para lectores de
pantalla y respeto a `prefers-reduced-motion`.

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
pnpm test           # tests con Vitest
pnpm test:watch     # tests en modo watch
pnpm add-jobs       # fusionar ofertas nuevas en public/jobs.json (dedup por id)
pnpm add-jobs:dry   # lo mismo, sin escribir (simulación)
```

Los tests cubren las funciones puras (agregaciones, búsqueda, taxonomía, cruce con el perfil) y,
como test de integración, la dedup por `id` del CLI `add-jobs` (siempre en `--dry-run`, con una
comprobación final de que no se ha tocado `public/jobs.json`).

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
src/data/taxonomy.ts        # tecnología -> categoría, colores y alias
src/data/prompts.ts         # prompts para el plugin de Chrome (fuente de verdad)
src/lib/aggregations.ts     # conteos y serie temporal normalizada
src/lib/profileMatch.ts     # cruce perfil <-> tecnologías (✓ la tengo / ✗ carencia)
src/lib/search.ts           # búsqueda de ofertas (sin acentos, todas las palabras)
src/lib/useJobs.ts          # carga estática de jobs.json (normaliza alias)
src/lib/useProfile.ts       # carga estática de perfil.json
src/filter/                 # filtros compartidos por Context (categoría, encaje, escaneo)
src/components/             # CategoryFilter, EncajeFilter, ScanFilter, TechRanking,
                            # TimeEvolution, JobsTable, ProfileCard, ChartDataTable,
                            # CopyPromptButton
```

Cada módulo de lógica pura tiene su `*.test.ts` al lado.
