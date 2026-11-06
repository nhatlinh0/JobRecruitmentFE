import { Link } from 'react-router-dom'
import { useState } from 'react'
import { MAX_SKILLS, type Job } from '../../types/job'
import { formatDate, formatSalary } from '../../utils/format'
import { slugify } from '../../utils/slugify'
import { Icon } from '../ui/Icon'
import './JobCard.css'

interface JobCardProps {
  job: Job
  isSaved: boolean
  onToggleSave: (jobId: number) => void
  onRemoveSaved?: (jobId: number) => void
  removingSaved?: boolean
}

export function JobCard({ job, isSaved, onToggleSave, onRemoveSaved, removingSaved }: JobCardProps) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null)
  const logoUrl = job.company?.logoUrl?.trim()
  const skills = job.skills.slice(0, MAX_SKILLS)
  const detailUrl = `/jobs/${encodeURIComponent(job.slug || slugify(job.title))}`

  return (
    <article className={`job-card${job.featured ? ' job-card--featured' : ''}`}>
      <div className="job-card-top">
        {logoUrl && failedLogo !== logoUrl ? <img className="company-mark job-card__company-logo" src={logoUrl} alt={`Logo ${job.companyName}`} loading="lazy" onError={() => setFailedLogo(logoUrl)} /> : <div className={`company-mark ${job.companyColor}`} aria-hidden="true">
          {job.companyName.charAt(0).toUpperCase()}
        </div>}
        <div className="job-heading-copy">
          <span className="company-name">{job.companyName}</span>
          {job.featured && (
            <span className="featured-label"><Icon name="spark" /> Nổi bật</span>
          )}
        </div>
        {onRemoveSaved ? <button className="save-button job-card__remove-saved" type="button" title="Xóa việc làm đã lưu" aria-label={`Xóa ${job.title} khỏi danh sách đã lưu`} disabled={removingSaved} onClick={() => onRemoveSaved(job.id)}><Icon name="trash" /></button> : <button
          aria-label={isSaved ? `Đã lưu ${job.title}` : `Lưu ${job.title}`}
          aria-pressed={isSaved}
          className={`save-button${isSaved ? ' is-saved' : ''}`}
          onClick={() => onToggleSave(job.id)}
          type="button"
        >
          <Icon name="bookmark" />
        </button>}
      </div>

      <h3><Link className="job-card__title-link" to={detailUrl}>{job.title}</Link></h3>
      <Link className="job-field" to={`/fields/${encodeURIComponent(job.domainSlug || slugify(job.field))}`} state={{ label: job.field }}>{job.field}</Link>

      <ul className="job-meta">
        <li><Icon name="location" />{job.city}</li>
        <li><Icon name="laptop" />{job.workType}</li>
        <li><Icon name="calendar" />Hạn nộp: {formatDate(job.deadline)}</li>
      </ul>

      <ul className="job-skills" aria-label="Kỹ năng yêu cầu">
        {skills.map((skill) => (
          <li key={skill}>
            <Link to={`/skills/${encodeURIComponent(job.skillSlugs?.[skill] || slugify(skill))}`} state={{ label: skill }}>{skill}</Link>
          </li>
        ))}
      </ul>

      <div className="job-card-bottom">
        <div className="salary"><strong>{formatSalary(job.salary)}</strong></div>
        <Link className="job-card-link" to={detailUrl}>
          Xem chi tiết <Icon name="arrow" />
        </Link>
      </div>
    </article>
  )
}
