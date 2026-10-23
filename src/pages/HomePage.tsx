import { useEffect } from 'react'
import { CtaBanner } from '../components/home/CtaBanner'
import { FeaturedJobs } from '../components/home/FeaturedJobs'
import { HeroSection } from '../components/home/HeroSection'
import { TrustedCompanies } from '../components/home/TrustedCompanies'
import { jobs } from '../data/jobs'
import { useJobSearch } from '../hooks/useJobSearch'
import { useSavedJobs } from '../hooks/useSavedJobs'

export function HomePage() {
  const search = useJobSearch(jobs)
  const { savedIds, toggleSaved } = useSavedJobs()

  useEffect(() => {
    if (window.location.search) scrollToJobs()
  }, [])

  function scrollToJobs() {
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <HeroSection
        city={search.city}
        keyword={search.keyword}
        onCityChange={search.setCity}
        onKeywordChange={search.setKeyword}
        onSearch={scrollToJobs}
      />
      <TrustedCompanies />
      <FeaturedJobs
        allJobs={jobs}
        field={search.field}
        jobs={search.filteredJobs}
        onFieldChange={search.setField}
        onReset={search.resetFilters}
        onToggleSave={toggleSaved}
        savedIds={savedIds}
      />
      <CtaBanner />
    </>
  )
}
