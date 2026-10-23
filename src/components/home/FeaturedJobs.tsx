import { useMemo } from 'react'
import { ALL_FIELDS, type Job } from '../../types/job'
import { FieldFilter } from '../jobs/FieldFilter'
import { JobList } from '../jobs/JobList'
import { Icon } from '../ui/Icon'
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
  allJobs,
  jobs,
  field,
  savedIds,
  onFieldChange,
  onToggleSave,
  onReset,
}: FeaturedJobsProps) {
  const fieldOptions = useMemo(() => {
    const counts = new Map<string, number>()
    allJobs.forEach((job) => counts.set(job.field, (counts.get(job.field) ?? 0) + 1))
    return [
      { name: ALL_FIELDS, count: allJobs.length },
      ...Array.from(counts, ([name, count]) => ({ name, count })),
    ]
  }, [allJobs])

  return (
    <section className="jobs-section" id="jobs">
      <SectionHeading
        action={
          <a className="text-link" href="#all-jobs">
            Xem tất cả việc làm <Icon name="arrow" />
          </a>
        }
        description="Những vị trí đang được các ứng viên công nghệ quan tâm."
        kicker="CƠ HỘI DÀNH CHO BẠN"
        title="Việc làm nổi bật"
      />
      <FieldFilter onSelect={onFieldChange} options={fieldOptions} selected={field} />
      <JobList jobs={jobs} onReset={onReset} onToggleSave={onToggleSave} savedIds={savedIds} />
      <a className="button button-outline browse-button" href="#all-jobs">
        Khám phá tất cả việc làm <Icon name="arrow" />
      </a>
    </section>
  )
}
