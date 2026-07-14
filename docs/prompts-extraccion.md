# Prompts de extracción (plugin de Chrome)

Los datos se obtienen con una sesión de Claude + plugin de Chrome sobre LinkedIn, en
un formato JSON fijo que la app consume. Hay **dos flujos separados** con frecuencias
distintas:

| Flujo | Frecuencia | Destino | Cómo se escribe |
|-------|-----------|---------|-----------------|
| **Perfil** | baja (de vez en cuando) | `public/perfil.json` | se sobrescribe entero |
| **Ofertas** | cada ciertos días | `public/jobs.json` | se **añade** con `pnpm add-jobs` (dedup por `id`) |

## Fuente de verdad de los textos

Los prompts viven en [`src/data/prompts.ts`](../src/data/prompts.ts) (`PROFILE_PROMPT` y
`JOBS_PROMPT`). **No los copies a mano desde aquí:** cada pestaña de la app tiene un
botón que copia el texto exacto al portapapeles.

- Pestaña **Mi perfil** → botón *"Copiar prompt para actualizar perfil"*.
- Pestaña **Ofertas** → botón *"Copiar prompt para buscar ofertas"*.

La lista de tokens de `requisitos` del prompt de ofertas se genera automáticamente
desde `KNOWN_TECHS` en [`src/data/taxonomy.ts`](../src/data/taxonomy.ts), así que
taxonomía y prompt nunca se desincronizan. Además, el prompt de ofertas **incrusta tu
perfil actual** (stack y carencias leídos de `perfil.json`) para que el `encaje` se
puntúe contra datos reales y no de lo que Claude recuerde en la sesión del plugin.

## Flujo de trabajo

### Actualizar el perfil (poco frecuente)

1. Abrir tu página de perfil en LinkedIn (`linkedin.com/in/…`).
2. En la app, pestaña **Mi perfil** → *Copiar prompt*.
3. Pegarlo en el plugin de Chrome de Claude.
4. Volcar el JSON resultante en `public/perfil.json` (sobrescribe) y guardar.

### Buscar ofertas nuevas (cada ciertos días)

1. Abrir un listado/oferta en LinkedIn Jobs.
2. En la app, pestaña **Ofertas** → *Copiar prompt*.
3. Pegarlo en el plugin de Chrome de Claude.
4. Guardar el array JSON en un fichero (p.ej. `ofertas-nuevas.json`) y añadirlo:

```bash
pnpm add-jobs:dry ofertas-nuevas.json   # revisar qué entraría
pnpm add-jobs ofertas-nuevas.json       # escribir (dedup por id, rellena fecha)
```

## Notas

- Regla común a ambos prompts: devolver **solo JSON**, sin texto alrededor ni
  ```` ```json ````, para poder pegarlo directamente.
- Criterio de `encaje` completo: `../claude-linkedin-jobs/base-puntuacion.md`.
- Si aparecen tokens de tecnología nuevos, añádelos a `TECH_CATEGORY` en
  `src/data/taxonomy.ts` para que caigan en su categoría (si no, salen en "Otros")
  y para que entren en la lista del prompt.
