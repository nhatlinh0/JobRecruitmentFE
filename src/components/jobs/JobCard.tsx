import { Link } from 'react-router-dom'
import { MAX_SKILLS, type Job } from '../../types/job'
import { formatDate, formatSalary } from '../../utils/format'
import { slugify } from '../../utils/slugify'
import { Icon } from '../ui/Icon'
import './JobCard.css'

interface JobCardProps {
  job: Job
  isSaved: boolean
  onToggleSave: (jobId: number) => void
}

export function JobCard({ job, isSaved, onToggleSave }: JobCardProps) {
  const skills = job.skills.slice(0, MAX_SKILLS)

  return (
    <article className={`job-card${job.featured ? ' job-card--featured' : ''}`}>
      <div className="job-card-top">
        <div className={`company-mark ${job.companyColor}`} aria-hidden="true">
          {job.companyName.charAt(0).toUpperCase()}
        </div>
        <div className="job-heading-copy">
          <span className="company-name">{job.companyName}</span>
          {job.featured && (
            <span className="featured-label"><Icon name="spark" /> Nổi bật</span>
          )}
        </div>
        <button
          aria-label={isSaved ? `Bỏ lưu ${job.title}` : `Lưu ${job.title}`}
          aria-pressed={isSaved}
          className={`save-button${isSaved ? ' is-saved' : ''}`}
          onClick={() => onToggleSave(job.id)}
          type="button"
        >
          <Icon name="bookmark" />
        </button>
      </div>

      <h3>{job.title}</h3>
      <Link className="job-field" to={`/fields/${slugify(job.field)}`}>{job.field}</Link>

      <ul className="job-meta">
        <li><Icon name="location" />{job.city}</li>
        <li><Icon name="laptop" />{job.workType}</li>
        <li><Icon name="calendar" />Hạn nộp: {formatDate(job.deadline)}</li>
      </ul>

      <ul className="job-skills" aria-label="Kỹ năng yêu cầu">
        {skills.map((skill) => (
          <li key={skill}>
            <Link to={`/skills/${slugify(skill)}`}>{skill}</Link>
          </li>
        ))}
      </ul>

      <div className="job-card-bottom">
        <div className="salary"><strong>{formatSalary(job.salary)}</strong></div>
        <Link className="job-card-link" to={`/jobs/${slugify(job.title)}`}>
          Xem chi tiết <Icon name="arrow" />
        </Link>
      </div>
    </article>
  )
}
