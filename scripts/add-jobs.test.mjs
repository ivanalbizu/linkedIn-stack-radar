import { execFile } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const exec = promisify(execFile)
const SCRIPT = 'scripts/add-jobs.mjs'
const DB = 'public/jobs.json'

/**
 * Ejecuta el CLI y devuelve stdout+stderr juntos (no lanza si el código != 0).
 * El resumen sale por stdout, pero el detalle de errores por stderr (console.warn).
 */
async function run(args) {
  try {
    const { stdout, stderr } = await exec('node', [SCRIPT, ...args])
    return stdout + stderr
  } catch (err) {
    return (err.stdout ?? '') + (err.stderr ?? '')
  }
}

function makeJob(id, extra = {}) {
  return {
    id,
    url: `https://www.linkedin.com/jobs/view/${id}/`,
    puesto: 'Puesto de prueba',
    empresa: 'TestCo',
    ubicacion: 'Remoto',
    modalidad: 'Remoto',
    requisitos: ['Web Components'],
    encaje: 70,
    motivo: 'test',
    fecha_escaneo: '2026-01-01',
    ...extra,
  }
}

let dir
let dbBefore

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'add-jobs-'))
  dbBefore = await readFile(DB, 'utf8')
})

// Red de seguridad: ningún test debe tocar el fichero real (todos usan --dry-run).
afterAll(async () => {
  expect(await readFile(DB, 'utf8')).toBe(dbBefore)
})

async function inputFile(name, jobs) {
  const path = join(dir, name)
  await writeFile(path, JSON.stringify(jobs))
  return path
}

describe('add-jobs (CLI)', () => {
  it('añade una oferta con id nuevo', async () => {
    const file = await inputFile('nueva.json', [makeJob('999000001')])
    const out = await run([file, '--dry-run'])
    expect(out).toContain('+ añadida 999000001')
    expect(out).toMatch(/\+1 añadidas/)
  })

  it('omite un id que ya existe (dedup)', async () => {
    const existing = JSON.parse(dbBefore)[0].id
    const file = await inputFile('dup.json', [makeJob(existing)])
    const out = await run([file, '--dry-run'])
    expect(out).toContain(`omitida (id existente ${existing})`)
    expect(out).toMatch(/\+0 añadidas/)
  })

  it('con --update sobrescribe el id existente en vez de omitirlo', async () => {
    const existing = JSON.parse(dbBefore)[0].id
    const file = await inputFile('upd.json', [makeJob(existing)])
    const out = await run([file, '--update', '--dry-run'])
    expect(out).toContain(`actualizada ${existing}`)
    expect(out).toMatch(/↻1 actualizadas/)
  })

  it('rechaza una oferta a la que le faltan campos obligatorios', async () => {
    const file = await inputFile('mala.json', [{ id: 'x', puesto: 'incompleta' }])
    const out = await run([file, '--dry-run'])
    expect(out).toMatch(/✗1 inválidas/)
    expect(out).toContain('falta "url"')
  })

  it('rellena fecha_escaneo con --fecha cuando la oferta no la trae', async () => {
    const { fecha_escaneo: _omit, ...sinFecha } = makeJob('999000002')
    const file = await inputFile('sin-fecha.json', [sinFecha])
    const out = await run([file, '--fecha', '2026-05-05', '--dry-run'])
    expect(out).toMatch(/\+1 añadidas/)
  })

  it('rechaza una fecha con formato inválido', async () => {
    const file = await inputFile('f.json', [makeJob('999000003')])
    const out = await run([file, '--fecha', '05-05-2026', '--dry-run'])
    expect(out).toContain('Fecha inválida')
  })

  it('--dry-run no escribe el fichero', async () => {
    const file = await inputFile('nueva2.json', [makeJob('999000004')])
    const out = await run([file, '--dry-run'])
    expect(out).toContain('No se ha escrito el fichero')
  })
})
