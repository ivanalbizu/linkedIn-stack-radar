import { useEffect, useState } from 'react'
import type { Job } from '../types'

interface JobsState {
  jobs: Job[]
  loading: boolean
  error: string | null
}

/** Carga estática de `jobs.json` desde /public (sin backend). */
export function useJobs(): JobsState {
  const [state, setState] = useState<JobsState>({ jobs: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}jobs.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Job[]>
      })
      .then((jobs) => {
        if (!cancelled) setState({ jobs, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ jobs: [], loading: false, error: err instanceof Error ? err.message : 'Error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
