#!/usr/bin/env node
/**
 * Añade ofertas nuevas a public/jobs.json sin duplicar por `id`.
 *
 * Uso:
 *   node scripts/add-jobs.mjs <fichero-nuevas.json> [--fecha YYYY-MM-DD] [--update] [--dry-run]
 *   pnpm add-jobs scripts/nuevas-ofertas.example.json
 *
 * El fichero de entrada es un array de ofertas (o una sola oferta). Cada oferta
 * sigue el esquema de jobs.json; si le falta `fecha_escaneo` se rellena con
 * --fecha o, en su defecto, la fecha de hoy.
 *
 * Por defecto los `id` ya existentes se OMITEN. Con --update se sobrescriben.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = resolve(__dirname, '..', 'public', 'jobs.json')

const REQUIRED_FIELDS = ['id', 'url', 'puesto', 'empresa', 'ubicacion', 'modalidad', 'requisitos', 'encaje', 'motivo']

function parseArgs(argv) {
  const opts = { file: null, fecha: null, update: false, dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--update') opts.update = true
    else if (a === '--dry-run') opts.dryRun = true
    else if (a === '--fecha') opts.fecha = argv[++i]
    else if (!a.startsWith('--')) opts.file = a
  }
  return opts
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function isValidDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

/** Devuelve un array de errores (vacío si la oferta es válida). */
function validate(job) {
  const errors = []
  for (const f of REQUIRED_FIELDS) {
    if (!(f in job)) errors.push(`falta "${f}"`)
  }
  if ('id' in job && typeof job.id !== 'string') errors.push('"id" debe ser string')
  if ('requisitos' in job && !Array.isArray(job.requisitos)) errors.push('"requisitos" debe ser un array')
  if ('encaje' in job && (typeof job.encaje !== 'number' || job.encaje < 0 || job.encaje > 100))
    errors.push('"encaje" debe ser un número 0-100')
  if ('fecha_escaneo' in job && !isValidDate(job.fecha_escaneo))
    errors.push('"fecha_escaneo" debe tener formato YYYY-MM-DD')
  return errors
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  if (!opts.file) {
    console.error('Uso: node scripts/add-jobs.mjs <fichero-nuevas.json> [--fecha YYYY-MM-DD] [--update] [--dry-run]')
    process.exit(1)
  }
  if (opts.fecha && !isValidDate(opts.fecha)) {
    console.error(`Fecha inválida: "${opts.fecha}" (esperado YYYY-MM-DD)`)
    process.exit(1)
  }

  const fecha = opts.fecha ?? today()

  const db = JSON.parse(await readFile(DB_PATH, 'utf8'))
  const rawInput = JSON.parse(await readFile(resolve(process.cwd(), opts.file), 'utf8'))
  const incoming = Array.isArray(rawInput) ? rawInput : [rawInput]

  const byId = new Map(db.map((j) => [j.id, j]))
  let added = 0
  let updated = 0
  let skipped = 0
  let invalid = 0

  for (const [index, job] of incoming.entries()) {
    if (!job.fecha_escaneo) job.fecha_escaneo = fecha

    const errors = validate(job)
    if (errors.length > 0) {
      invalid++
      console.warn(`✗ oferta #${index} (${job.empresa ?? '¿?'} / ${job.id ?? 's/id'}): ${errors.join(', ')}`)
      continue
    }

    const exists = byId.has(job.id)
    if (exists && !opts.update) {
      skipped++
      console.log(`· omitida (id existente ${job.id}): ${job.puesto} — ${job.empresa}`)
      continue
    }
    if (exists) {
      byId.set(job.id, { ...byId.get(job.id), ...job })
      updated++
      console.log(`↻ actualizada ${job.id}: ${job.puesto} — ${job.empresa}`)
    } else {
      byId.set(job.id, job)
      added++
      console.log(`+ añadida ${job.id}: ${job.puesto} — ${job.empresa} [encaje ${job.encaje}]`)
    }
  }

  const result = [...byId.values()]

  console.log(
    `\nResumen: +${added} añadidas, ↻${updated} actualizadas, ·${skipped} omitidas, ✗${invalid} inválidas. Total: ${result.length} ofertas.`,
  )

  if (invalid > 0 && added === 0 && updated === 0) {
    console.error('\nNo se escribió nada (solo entradas inválidas).')
    process.exit(1)
  }
  if (added === 0 && updated === 0) {
    console.log('\nSin cambios que escribir.')
    return
  }
  if (opts.dryRun) {
    console.log('\n[--dry-run] No se ha escrito el fichero.')
    return
  }

  await writeFile(DB_PATH, JSON.stringify(result, null, 2) + '\n', 'utf8')
  console.log(`\nEscrito ${DB_PATH}`)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
