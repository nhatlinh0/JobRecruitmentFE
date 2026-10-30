import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ApplyModal } from '../components/ApplyModal'
import { JobList } from '../components/jobs/JobList'
import { jobs } from '../data/jobs'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { formatDate, formatSalary } from '../utils/format'
import { slugify } from '../utils/slugify'
import { Icon } from '../components/ui/Icon'
import './JobDetailPage.css'

const MAX_RELATED_JOBS = 8

export function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const job = jobs.find((item) => slugify(item.title) === slug)
  const { savedIds, toggleSaved } = useSavedJobs()
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!job) {
    return (
      <section className="job-detail">
        <div className="job-detail__not-found">
          <h1>Không tìm thấy công việc</h1>
          <p>Công việc bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
          <Link className="button button-primary" to="/">Về trang chủ</Link>
        </div>
      </section>
    )
  }

  const experienceText = job.experience
    ? `${job.experience.min} - ${job.experience.max} năm`
    : 'Không yêu cầu'

  const relatedJobs = jobs
    .filter((item) => item.id !== job.id)
    .sort((a, b) => Number(b.field === job.field) - Number(a.field === job.field))
    .slice(0, MAX_RELATED_JOBS)

  return (
    <section className="job-detail">
      <div className="job-detail__header">
        <div className="job-detail__company-mark" data-color={job.companyColor}>
          {job.companyName.charAt(0).toUpperCase()}
        </div>
        <div className="job-detail__heading">
          <h1>{job.title}</h1>
          <p className="job-detail__company-name">{job.companyName}</p>
        </div>
        <div className="job-detail__actions">
          <button
            className="button button-primary job-detail__apply"
            onClick={() => setApplyOpen(true)}
            type="button"
          >
            Ứng tuyển ngay
          </button>
          <button aria-label={savedIds.includes(job.id) ? 'Bỏ lưu công việc' : 'Lưu công việc'} aria-pressed={savedIds.includes(job.id)} onClick={() => toggleSaved(job.id)} className="job-detail__save" type="button">
            <Icon name="bookmark" />
          </button>
        </div>
      </div>

      <div className="job-detail__meta">
        <div className="job-detail__meta-item">
          <Icon name="location" />
          <span>{job.address ?? job.city}</span>
        </div>
        <div className="job-detail__meta-item">
          <Icon name="calendar" />
          <span>Hạn nộp: {formatDate(job.deadline)}</span>
        </div>
        <div className="job-detail__meta-item">
          <Icon name="laptop" />
          <span>{job.workType}</span>
        </div>
        <div className="job-detail__meta-item">
          <Icon name="briefcase" />
          <span>{experienceText}</span>
        </div>
        <div className="job-detail__meta-item">
          <Icon name="trend" />
          <span>{formatSalary(job.salary)}</span>
        </div>
        <div className="job-detail__meta-item">
          <Icon name="location" />
          <span>{job.city}</span>
        </div>
      </div>

      <div className="job-detail__skills">
        <h2>Kỹ năng yêu cầu</h2>
        <ul>
          {job.skills.map((skill) => (
            <li key={skill}>
              <Link to={`/skills/${slugify(skill)}`}>{skill}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="job-detail__field">
        <h2>Lĩnh vực chuyên môn</h2>
        <Link className="job-detail__field-badge" to={`/fields/${slugify(job.field)}`}>{job.field}</Link>
      </div>

      <div className="job-detail__content">
        <div className="job-detail__section">
          <h2>Mô tả công việc</h2>
          <p className="job-detail__text">{job.description}</p>
        </div>

        <div className="job-detail__section">
          <h2>Yêu cầu ứng viên</h2>
          <p className="job-detail__text">{job.requirements}</p>
        </div>

        <div className="job-detail__section">
          <h2>Quyền lợi khi gia nhập</h2>
          <p className="job-detail__text">{job.benefits}</p>
        </div>
      </div>

      <div className="job-detail__company">
        <h2>Thông tin công ty</h2>
        <Link className="job-detail__company-card" to={`/companies/${slugify(job.companyName)}`}>
          <div className="job-detail__company-logo" data-color={job.companyColor}>
            {job.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="job-detail__company-info">
            <h3>{job.companyName}</h3>
            <ul>
              <li><strong>Lĩnh vực:</strong> {job.company?.industry ?? 'Phần mềm'}</li>
              <li><strong>Quy mô:</strong> {job.company?.size ?? '100-200'} nhân sự</li>
              <li><strong>Quốc gia:</strong> {job.company?.country ?? 'Việt Nam'}</li>
            </ul>
          </div>
        </Link>
      </div>

      <div className="job-detail__related">
        <h2>Công việc khác</h2>
        <JobList jobs={relatedJobs} onReset={() => {}} onToggleSave={toggleSaved} savedIds={savedIds} />
      </div>

      {applyOpen && <ApplyModal jobTitle={job.title} onClose={() => setApplyOpen(false)} />}
    </section>
  )
}
