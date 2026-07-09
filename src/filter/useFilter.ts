import { useContext } from 'react'
import { FilterCtx, type FilterValue } from './filterContext'

export function useFilter(): FilterValue {
  const ctx = useContext(FilterCtx)
  if (!ctx) throw new Error('useFilter debe usarse dentro de <FilterProvider>')
  return ctx
}
