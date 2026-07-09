import { useFilter } from '../filter/useFilter'

/**
 * Selector de encaje mínimo. Cambia la pregunta que responden las vistas:
 * de "¿qué pide el mercado?" a "¿qué piden las ofertas a las que puedo aspirar?".
 */
export function EncajeFilter() {
  const { minEncaje, setMinEncaje } = useFilter()

  return (
    <label className="encaje-filter">
      Encaje mínimo
      <select value={minEncaje} onChange={(e) => setMinEncaje(Number(e.target.value))}>
        <option value={0}>Todas las ofertas</option>
        <option value={45}>≥ 45</option>
        <option value={60}>≥ 60</option>
        <option value={70}>≥ 70</option>
      </select>
    </label>
  )
}
