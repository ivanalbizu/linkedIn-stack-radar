import { CATEGORY_COLOR, CATEGORY_ORDER } from '../data/taxonomy'
import { useFilter } from '../filter/FilterContext'

/** Chips seleccionables para filtrar por categoría de tecnología. */
export function CategoryFilter() {
  const { active, toggle, clear, isVisible } = useFilter()

  return (
    <div className="filter">
      <div className="filter__chips">
        {CATEGORY_ORDER.map((cat) => {
          const selected = isVisible(cat) && active.size > 0
          return (
            <button
              key={cat}
              type="button"
              className={`chip${selected ? ' chip--on' : ''}`}
              style={{ '--chip-color': CATEGORY_COLOR[cat] } as React.CSSProperties}
              aria-pressed={active.has(cat)}
              onClick={() => toggle(cat)}
            >
              <span className="chip__dot" />
              {cat}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className="filter__clear"
        onClick={clear}
        disabled={active.size === 0}
      >
        Limpiar filtro
      </button>
    </div>
  )
}
