import { useFilter } from '../filter/FilterContext'

/**
 * Selector de escaneo: distingue la demanda viva (último escaneo) del histórico
 * acumulado. Sin él, el ranking suma para siempre ofertas de escaneos antiguos.
 * Solo tiene sentido con 2+ escaneos.
 */
export function ScanFilter({ dates }: { dates: string[] }) {
  const { scanScope, setScanScope } = useFilter()
  if (dates.length < 2) return null

  // `dates` viene ascendente; el último es el más reciente.
  const latest = dates[dates.length - 1]

  return (
    <label className="encaje-filter">
      Escaneo
      <select value={scanScope} onChange={(e) => setScanScope(e.target.value)}>
        <option value="all">Todo el histórico</option>
        {[...dates].reverse().map((d) => (
          <option key={d} value={d}>
            {d === latest ? `Último (${d})` : d}
          </option>
        ))}
      </select>
    </label>
  )
}
