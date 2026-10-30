import { useState } from 'react'
import { ALL_FIELDS, type Job } from '../../types/job'
import { JobFilterOverlay } from '../jobs/JobFilterOverlay'
import { defaultJobFilters } from '../../types/jobFilters'
import { Icon } from '../ui/Icon'
import { JobList } from '../jobs/JobList'
import { Pagination } from '../ui/Pagination'
import { SectionHeading } from '../ui/SectionHeading'
import './FeaturedJobs.css'

interface FeaturedJobsProps {
  allJobs: Job[]
  jobs: Job[]
  field: string
  savedIds: number[]
  onFieldChange: (field: string) => void
  onToggleSave: (jobId: number) => void
  onReset: () => void
}

export function FeaturedJobs({
  jobs,
  field,
  savedIds,
  onFieldChange,
  onToggleSave,
  onReset,
}: FeaturedJobsProps) {
  const [filters, setFilters] = useState(defaultJobFilters)
  const [filterOpen, setFilterOpen] = useState(false)
  const [pagination, setPagination] = useState({ jobs, filters, page: 0 })
  const matches = jobs.filter((job) => {
    const experience = job.experience ?? { min: 0, max: 0 }
    return (!filters.workType || job.workType === filters.workType)
      && experience.max >= filters.experience[0] && experience.min <= filters.experience[1]
      && (filters.negotiable ? job.salary === null : job.salary ? (job.salary.max >= filters.salary[0] && job.salary.min <= filters.salary[1]) : filters.salary[0] === 0 && filters.salary[1] === 100)
      && filters.skills.every((skill) => job.skills.includes(skill))
  })
  const size = 6
  const totalPages = Math.ceil(matches.length / size)
  const page = pagination.jobs === jobs && pagination.filters === filters ? Math.max(0, Math.min(pagination.page, totalPages - 1)) : 0
  const content = matches.slice(page * size, (page + 1) * size)
  function resetAll() { setFilters(defaultJobFilters); onReset() }

  return (
    <section className="jobs-section" id="jobs">
      <SectionHeading
        description="Những vị trí đang được các ứng viên công nghệ quan tâm."
        kicker="CƠ HỘI DÀNH CHO BẠN"
        title="Danh sách việc làm"
        action={<button className="button button-outline jobs-filter-trigger" type="button" aria-haspopup="dialog" onClick={() => setFilterOpen(true)}><Icon name="filter" /> Bộ lọc</button>}
      />
      {(filters !== defaultJobFilters || field !== ALL_FIELDS) && <div className="jobs-filter-summary"><span>{matches.length} việc làm phù hợp{field !== ALL_FIELDS ? ` · ${field}` : ''}</span><button type="button" onClick={resetAll}>Xóa bộ lọc</button></div>}
      <JobList jobs={content} onReset={resetAll} onToggleSave={onToggleSave} savedIds={savedIds} />
      <Pagination page={page} totalPages={totalPages} totalElements={matches.length} label="việc làm" onChange={(nextPage) => setPagination({ jobs, filters, page: nextPage })} />
      {filterOpen && <JobFilterOverlay value={{ ...filters, field }} onClose={() => setFilterOpen(false)} onApply={(next) => { setFilters(next); onFieldChange(next.field); setFilterOpen(false) }} />}
    </section>
  )
}
