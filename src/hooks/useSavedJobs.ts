import { useMemo, useSyncExternalStore } from 'react'
import { useAuth } from './useAuth'

const SAVED_JOBS_EVENT = 'saved-jobs-changed'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(SAVED_JOBS_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(SAVED_JOBS_EVENT, onChange)
  }
}

function parseIds(value: string | null): number[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number' && Number.isInteger(id)) : []
  } catch {
    return []
  }
}

export function useSavedJobs() {
  const { user } = useAuth()
  const key = `saved_jobs:${user?.sub ?? 'guest'}`
  const stored = useSyncExternalStore(subscribe, () => localStorage.getItem(key), () => null)
  const savedIds = useMemo(() => parseIds(stored), [stored])

  function toggleSaved(jobId: number) {
    const current = parseIds(localStorage.getItem(key))
    const next = current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId]
    localStorage.setItem(key, JSON.stringify(next))
    window.dispatchEvent(new Event(SAVED_JOBS_EVENT))
  }

  return { savedIds, toggleSaved }
}
