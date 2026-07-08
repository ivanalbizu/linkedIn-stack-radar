import { useEffect, useState } from 'react'
import type { Profile } from '../types'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  error: string | null
}

/** Carga estática de `perfil.json` desde /public (sin backend). */
export function useProfile(): ProfileState {
  const [state, setState] = useState<ProfileState>({ profile: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}perfil.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Profile>
      })
      .then((profile) => {
        if (!cancelled) setState({ profile, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({
            profile: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Error',
          })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
