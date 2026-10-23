import { useState } from 'react'

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<number[]>([])

  function toggleSaved(jobId: number) {
    setSavedIds((current) =>
      current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId],
    )
  }

  return { savedIds, toggleSaved }
}
