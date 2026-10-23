import type { Job } from '../../types/job'
import { Icon } from '../ui/Icon'
import { JobCard } from './JobCard'
import './JobList.css'

interface JobListProps {
  jobs: Job[]
  savedIds: number[]
  onToggleSave: (jobId: number) => void
  onReset: () => void
}

export function JobList({ jobs, savedIds, onToggleSave, onReset }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="job-list">
        <div className="empty-state">
          <span className="empty-icon"><Icon name="search" /></span>
          <h3>Chưa tìm thấy việc làm phù hợp</h3>
          <p>Thử từ khóa hoặc địa điểm khác để khám phá thêm cơ hội nhé.</p>
          <button className="button button-outline" onClick={onReset} type="button">
            Xóa bộ lọc
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard
          isSaved={savedIds.includes(job.id)}
          job={job}
          key={job.id}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  )
}
