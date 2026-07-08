/**
 * Taxonomía de categorías de tecnología.
 *
 * Punto de partida: `../claude-linkedin-jobs/habilidades-para-revisar.md`.
 * Cada tecnología que aparezca en `requisitos` debería estar mapeada aquí; las
 * que no lo estén caen en "Otros" (útil como aviso de que falta clasificarlas).
 */

export type Category =
  | 'Frameworks / UI'
  | 'Lenguajes'
  | 'Maquetación / CSS'
  | 'Estado / Arquitectura'
  | 'Design Systems / A11y'
  | 'Testing'
  | 'Backend / Datos / Infra'
  | 'Visualización'
  | 'IA / Tooling'
  | 'Herramientas'
  | 'Liderazgo / Rol'
  | 'No-frontend / Low-code'
  | 'Otros'

/** Orden en el que se muestran las categorías en los filtros y leyendas. */
export const CATEGORY_ORDER: Category[] = [
  'Frameworks / UI',
  'Lenguajes',
  'Maquetación / CSS',
  'Estado / Arquitectura',
  'Design Systems / A11y',
  'Testing',
  'Backend / Datos / Infra',
  'Visualización',
  'IA / Tooling',
  'Herramientas',
  'Liderazgo / Rol',
  'No-frontend / Low-code',
  'Otros',
]

/** Color estable por categoría (usado en gráficos y chips). */
export const CATEGORY_COLOR: Record<Category, string> = {
  'Frameworks / UI': '#0a66c2',
  Lenguajes: '#2e7d32',
  'Maquetación / CSS': '#00897b',
  'Estado / Arquitectura': '#6a1b9a',
  'Design Systems / A11y': '#c2185b',
  Testing: '#ef6c00',
  'Backend / Datos / Infra': '#5d4037',
  Visualización: '#0097a7',
  'IA / Tooling': '#7b1fa2',
  Herramientas: '#455a64',
  'Liderazgo / Rol': '#b8860b',
  'No-frontend / Low-code': '#9e9e9e',
  Otros: '#bdbdbd',
}

/** Mapa tecnología -> categoría. */
const TECH_CATEGORY: Record<string, Category> = {
  // Frameworks / UI
  Angular: 'Frameworks / UI',
  React: 'Frameworks / UI',
  'Vue 3': 'Frameworks / UI',
  LitElement: 'Frameworks / UI',
  Cells: 'Frameworks / UI',
  'Web Components': 'Frameworks / UI',
  StencilJS: 'Frameworks / UI',
  Storybook: 'Frameworks / UI',
  PrimeNG: 'Frameworks / UI',
  PrimeVue: 'Frameworks / UI',
  Pinia: 'Frameworks / UI',
  'Styled Components': 'Frameworks / UI',
  'Angular Material': 'Frameworks / UI',
  Nuxt: 'Frameworks / UI',

  // Lenguajes
  TypeScript: 'Lenguajes',
  JavaScript: 'Lenguajes',
  RxJS: 'Lenguajes',

  // Maquetación / CSS
  'HTML/CSS': 'Maquetación / CSS',
  SASS: 'Maquetación / CSS',
  BEM: 'Maquetación / CSS',

  // Estado / Arquitectura
  NgRx: 'Estado / Arquitectura',
  Redux: 'Estado / Arquitectura',
  DDD: 'Estado / Arquitectura',
  'Arquitectura Hexagonal': 'Estado / Arquitectura',
  Microfrontends: 'Estado / Arquitectura',
  SOLID: 'Estado / Arquitectura',
  POO: 'Estado / Arquitectura',

  // Design Systems / A11y
  'Design Systems': 'Design Systems / A11y',
  WCAG: 'Design Systems / A11y',
  Accesibilidad: 'Design Systems / A11y',

  // Testing
  Jest: 'Testing',
  RTL: 'Testing',
  Testing: 'Testing',

  // Backend / Datos / Infra
  REST: 'Backend / Datos / Infra',
  GraphQL: 'Backend / Datos / Infra',
  'Node.js': 'Backend / Datos / Infra',
  SQL: 'Backend / Datos / Infra',
  MongoDB: 'Backend / Datos / Infra',
  Redis: 'Backend / Datos / Infra',
  Docker: 'Backend / Datos / Infra',
  AWS: 'Backend / Datos / Infra',
  'CI/CD': 'Backend / Datos / Infra',
  Agile: 'Backend / Datos / Infra',
  Java: 'Backend / Datos / Infra',
  Cloud: 'Backend / Datos / Infra',
  Nx: 'Backend / Datos / Infra',
  'Extreme Programming': 'Backend / Datos / Infra',

  // Visualización
  Canvas: 'Visualización',
  'PIXI.js': 'Visualización',
  'GIS / mapas': 'Visualización',
  OpenLayers: 'Visualización',

  // IA / Tooling
  'Claude Code': 'IA / Tooling',
  Cursor: 'IA / Tooling',
  Copilot: 'IA / Tooling',
  'IA / Prompting': 'IA / Tooling',

  // Herramientas
  Vite: 'Herramientas',
  NPM: 'Herramientas',
  Git: 'Herramientas',
  i18n: 'Herramientas',
  CMS: 'Herramientas',
  Inglés: 'Herramientas',

  // Liderazgo / Rol
  'Liderazgo técnico': 'Liderazgo / Rol',
  'Arquitecto Frontend': 'Liderazgo / Rol',

  // No-frontend / Low-code
  OutSystems: 'No-frontend / Low-code',
  AEM: 'No-frontend / Low-code',
  OSGi: 'No-frontend / Low-code',
}

/** Devuelve la categoría de una tecnología, o "Otros" si no está mapeada. */
export function categoryOf(tech: string): Category {
  return TECH_CATEGORY[tech] ?? 'Otros'
}

/** Tokens de tecnología conocidos (los que tienen categoría asignada). */
export const KNOWN_TECHS: string[] = Object.keys(TECH_CATEGORY)
