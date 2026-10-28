import { useMemo, useState } from 'react'
import { ALL_FIELDS, type Job } from '../types/job'
import { normalize } from '../utils/format'

function readInitialParams() {
  const params = new URLSearchParams(window.location.search)
  return { field: params.get('field') ?? ALL_FIELDS, keyword: params.get('q') ?? '' }
}

export function useJobSearch(jobs: Job[]) {
  const [initial] = useState(readInitialParams)
  const [keyword, setKeyword] = useState(initial.keyword)
  const [city, setCity] = useState('')
  const [field, setField] = useState(initial.field)

  const filteredJobs = useMemo(() => {
    const keywordTerm = normalize(keyword)
    const cityTerm = normalize(city)

    return jobs.filter((job) => {
      const matchesField = field === ALL_FIELDS || job.field === field
      const matchesKeyword =
        !keywordTerm ||
        normalize(
          `${job.title} ${job.companyName} ${job.field} ${job.skills.join(' ')}`,
        ).includes(keywordTerm)
      const matchesCity = !cityTerm || normalize(job.city).includes(cityTerm)

      return matchesField && matchesKeyword && matchesCity
    }).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  }, [jobs, keyword, city, field])

  function resetFilters() {
    setKeyword('')
    setCity('')
    setField(ALL_FIELDS)
  }

  return { keyword, setKeyword, city, setCity, field, setField, filteredJobs, resetFilters }
}
