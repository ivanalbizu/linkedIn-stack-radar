# linkedin-stack-radar

## Objetivo

App para visualizar qué stacks tecnológicos se demandan más en las ofertas de LinkedIn relevantes para el perfil de
Iván (Frontend Engineer / Design Systems Engineer), con el fin de decidir en qué formarse y mantenerse actualizado
profesionalmente.

**No es** una herramienta de seguimiento de candidaturas (no hay estados "aplicado/entrevista/rechazado").

Segundo objetivo, igual de real: es un proyecto para practicar React. El alcance se ha diseñado deliberadamente
pequeño y sin backend para que sea abarcable como ejercicio, no como producto.

## Origen / contexto

Proyecto hermano de `../claude-linkedin-jobs`, donde el análisis de ofertas se hacía a mano en un `index.html`
estático, alimentado sesión a sesión por Claude a través del plugin de Chrome (búsqueda y puntuación de ofertas de
LinkedIn). Ese flujo tiene un problema de fondo: cada sesión del plugin no tiene memoria de ofertas ya vistas, y el
histórico vivía mezclado con la presentación (HTML a mano).

Aquí se separan las dos cosas:
- **Extracción de datos**: sigue haciéndose igual, con Claude + plugin de Chrome buscando en LinkedIn.
- **Almacenamiento**: pasa a un JSON estructurado con fecha de escaneo, en vez de pegarse directamente en HTML.
- **Presentación**: una app React que lee ese JSON y muestra agregados (qué tecnologías se repiten más, cómo
  evoluciona la demanda en el tiempo).

## Alcance

### Dentro

- Fichero `jobs.json` como fuente de verdad: cada oferta con id de LinkedIn, requisitos (lista de tecnologías),
  puntuación de encaje, motivo, y fecha de escaneo.
- App Vite + React + TypeScript que lee ese JSON de forma estática (fetch a un fichero local, sin backend).
- Vista de ranking de tecnologías por nº de menciones.
- Vista de evolución temporal (¿sube o baja la demanda de una tecnología entre escaneos?).
- Filtro por categoría de tecnología (frameworks, testing, arquitectura, IA, etc. — mismas categorías usadas en
  `habilidades-para-revisar.md` del proyecto anterior).

### Fuera (explícitamente descartado)

- Seguimiento de candidaturas (aplicado, entrevista, rechazado, notas por oferta).
- Scraping automatizado de LinkedIn (se sigue usando el plugin de Chrome de forma asistida, no un bot).
- Backend, base de datos, autenticación, multi-usuario.
- Rediseñar el criterio de puntuación de "encaje" — se reutiliza tal cual el campo `encaje` si se importa desde el
  proyecto anterior (criterios documentados en `../claude-linkedin-jobs/base-puntuacion.md`).

## Stack técnico

- Vite + React + TypeScript
- Una librería de gráficos ligera (a decidir al empezar: Recharts es la opción por defecto)
- JSON estático versionado en el repo como base de datos — nada de servidor
- Sin despliegue urgente; si más adelante interesa, es un sitio estático (GitHub Pages / Netlify)

## Esquema de datos (`jobs.json`)

```json
[
  {
    "id": "4425844348",
    "url": "https://www.linkedin.com/jobs/view/4425844348/",
    "puesto": "Frontend Software Engineer - Gaming",
    "empresa": "Betsson Group",
    "ubicacion": "Málaga",
    "modalidad": "Híbrido",
    "requisitos": ["Angular", "TypeScript", "RxJS", "StencilJS"],
    "encaje": 75,
    "motivo": "...",
    "fecha_escaneo": "2026-07-04"
  }
]
```

- `requisitos` como array de tecnologías (no texto libre) es lo que permite agregar/contar sin reparsear strings.
- `fecha_escaneo` es el campo clave para la vista de evolución temporal — sin él no hay tendencia que mostrar.
- `id` es el identificador de la oferta en LinkedIn (para deduplicar entre escaneos).

## Roadmap

1. Cerrar el esquema de `jobs.json` y migrar como semilla los datos ya existentes en
   `../claude-linkedin-jobs/index.html` (extraer requisitos + encaje de las 41 ofertas ya analizadas).
2. Scaffold del proyecto (Vite + React + TS).
3. Listado/tabla básica de ofertas leyendo el JSON (practicar tipado, props, listas).
4. Vista "Ranking de tecnologías" — agregación y conteo de `requisitos` (practicar `useMemo`/reducers).
5. Vista "Evolución temporal" — gráfico por `fecha_escaneo` (practicar librería de gráficos).
6. Filtro por categoría de tecnología (practicar estado compartido / posible uso de Context).
7. (Opcional, más adelante) Script o formulario simple para añadir nuevas entradas a `jobs.json` sin duplicar por
   `id`.

## Flujo de trabajo continuo

1. Pedir a Claude (vía plugin de Chrome) que busque ofertas nuevas relevantes en LinkedIn, como se ha hecho hasta
   ahora.
2. Convertir esos resultados en entradas nuevas de `jobs.json`, con su `fecha_escaneo`.
3. La app solo visualiza — no recolecta ni hace scraping por su cuenta.

## Referencias al proyecto anterior

- `../claude-linkedin-jobs/index.html` — datos semilla (41 ofertas ya puntuadas).
- `../claude-linkedin-jobs/base-puntuacion.md` — criterio de puntuación de "encaje", se reutiliza sin cambios.
- `../claude-linkedin-jobs/habilidades-para-revisar.md` — taxonomía de categorías de tecnología ya usada, punto de
  partida para el agrupado por categorías en la vista de ranking.
