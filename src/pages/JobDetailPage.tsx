import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { JobList } from '../components/jobs/JobList'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { formatDate, formatSalary } from '../utils/format'
import { slugify } from '../utils/slugify'
import { Icon } from '../components/ui/Icon'
import './JobDetailPage.css'
import './JobDetailRefined.css'
import { fetchHomeJobs, fetchJobBySlug } from '../services/home'
import type { Job } from '../types/job'
import { Pagination } from '../components/ui/Pagination'

const RELATED_PAGE_SIZE = 6

export function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [remote, setRemote] = useState<{ slug: string; job: Job | null; jobs: Job[]; error: string; relatedError: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const [relatedPagination, setRelatedPagination] = useState({ key: '', page: 0 })
  const sourceJobs = remote?.jobs ?? []
  const job = remote?.job
  const { savedIds, toggleSaved } = useSavedJobs()

  useEffect(() => {
    const controller = new AbortController()
    Promise.allSettled([fetchJobBySlug(slug ?? '', controller.signal), fetchHomeJobs(controller.signal)]).then(([detail, related]) => {
      if (controller.signal.aborted) return
      setRemote({ slug: slug ?? '', job: detail.status === 'fulfilled' ? detail.value : null, jobs: related.status === 'fulfilled' ? related.value : [], error: detail.status === 'rejected' ? (detail.reason instanceof Error ? detail.reason.message : 'Không thể tải công việc.') : '', relatedError: related.status === 'rejected' ? 'Không thể tải các công việc khác.' : '' })
    })
    return () => controller.abort()
  }, [slug, retry])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!remote || remote.slug !== (slug ?? '')) return <section className="job-detail"><p role="status">Đang tải công việc...</p></section>
  if (remote.error) return <section className="job-detail"><p role="alert">{remote.error}</p><button type="button" className="button button-outline" onClick={() => { setRemote(null); setRetry((value) => value + 1) }}>Thử lại</button></section>

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

  const relatedJobs = sourceJobs
    .filter((item) => item.id !== job.id)
    .sort((a, b) => Number(b.field === job.field) - Number(a.field === job.field))
  const relatedKey = String(job.id)
  const relatedTotalPages = Math.ceil(relatedJobs.length / RELATED_PAGE_SIZE)
  const relatedPage = relatedPagination.key === relatedKey ? Math.max(0, Math.min(relatedPagination.page, relatedTotalPages - 1)) : 0
  const companyUrl = `/companies/${job.company?.slug || slugify(job.companyName)}`

  return (
    <section className="job-detail job-profile">
      <nav className="job-profile__breadcrumb" aria-label="Đường dẫn"><Link to="/">Trang chủ</Link><span>/</span><Link to="/#jobs">Việc làm</Link><span>/</span><span>{job.title}</span></nav>
      <div className="job-detail__header">
        {job.company?.logoUrl ? <img className="job-profile__logo" src={job.company.logoUrl} alt={`Logo ${job.companyName}`} /> : <div className="job-detail__company-mark" data-color={job.companyColor}>
          {job.companyName.charAt(0).toUpperCase()}
        </div>}
        <div className="job-detail__heading">
          <span className="job-profile__eyebrow">CƠ HỘI NGHỀ NGHIỆP{job.featured ? ' · NỔI BẬT' : ''}</span>
          <h1>{job.title}</h1>
          <Link className="job-detail__company-name" to={companyUrl}>{job.companyName}</Link>
        </div>
        <div className="job-detail__actions">
          <button
            className="button button-primary job-detail__apply"
            type="button"
          >
            Ứng tuyển
          </button>
          <button aria-label="Lưu công việc" title="Lưu công việc" className="job-detail__save" type="button">
            <Icon name="bookmark" />
          </button>
        </div>
      </div>

      <dl className="job-detail__meta job-facts">
        <div className="job-facts__item job-facts__item--salary"><dt><Icon name="trend" /> Mức lương</dt><dd>{formatSalary(job.salary)}</dd></div>
        <div className="job-facts__item"><dt><Icon name="briefcase" /> Kinh nghiệm</dt><dd>{experienceText}</dd></div>
        <div className="job-facts__item"><dt><Icon name="laptop" /> Hình thức làm việc</dt><dd>{job.workType || 'Chưa cập nhật'}</dd></div>
        <div className="job-facts__item"><dt><Icon name="location" /> Thành phố</dt><dd>{job.city || 'Chưa cập nhật'}</dd></div>
        <div className="job-facts__item"><dt><Icon name="calendar" /> Hạn nộp hồ sơ</dt><dd>{job.deadline && !Number.isNaN(Date.parse(job.deadline)) ? formatDate(job.deadline) : 'Chưa cập nhật'}</dd></div>
        <div className="job-facts__item"><dt><Icon name="location" /> Địa điểm làm việc</dt><dd>{job.address || job.city || 'Chưa cập nhật'}</dd></div>
      </dl>

      <div className="job-profile__main">
      <div className="job-detail__skills">
        <h2>Kỹ năng yêu cầu</h2>
        <ul>
          {job.skills.map((skill) => (
            <li key={skill}>
              <Link to={`/skills/${encodeURIComponent(job.skillSlugs?.[skill] || slugify(skill))}`} state={{ label: skill }}>{skill}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="job-detail__field">
        <h2>Lĩnh vực chuyên môn</h2>
        <Link className="job-detail__field-badge" to={`/fields/${encodeURIComponent(job.domainSlug || slugify(job.field))}`} state={{ label: job.field }}>{job.field}</Link>
      </div>

      <div className="job-detail__content">
        <div className="job-detail__section">
          <h2><span className="job-section-number">01</span>Mô tả công việc</h2>
          <p className="job-detail__text">{job.description || 'Chưa cập nhật mô tả công việc.'}</p>
        </div>

        <div className="job-detail__section">
          <h2><span className="job-section-number">02</span>Yêu cầu ứng viên</h2>
          <p className="job-detail__text">{job.requirements || 'Chưa cập nhật yêu cầu ứng viên.'}</p>
        </div>

        <div className="job-detail__section">
          <h2><span className="job-section-number">03</span>Quyền lợi khi gia nhập</h2>
          <p className="job-detail__text">{job.benefits || 'Chưa cập nhật quyền lợi.'}</p>
        </div>
      </div>
      </div>

      <div className="job-detail__company">
        <div className="job-company-caption"><Icon name="briefcase" /><h2>Nhà tuyển dụng</h2></div>
        <Link className="job-detail__company-card" to={companyUrl}>
          {job.company?.logoUrl ? <img className="job-profile__logo job-profile__logo--small" src={job.company.logoUrl} alt={`Logo ${job.companyName}`} /> : <div className="job-detail__company-logo" data-color={job.companyColor}>
            {job.companyName.charAt(0).toUpperCase()}
          </div>}
          <div className="job-detail__company-info">
            <h3>{job.companyName}</h3>
            <ul>
              <li><strong>Lĩnh vực</strong><span>{job.company?.industry || 'Chưa cập nhật'}</span></li>
              <li><strong>Quy mô</strong><span>{job.company?.size ? `${job.company.size} nhân sự` : 'Chưa cập nhật'}</span></li>
              <li><strong>Quốc gia</strong><span>{job.company?.country || 'Chưa cập nhật'}</span></li>
              {job.company?.address && <li><strong>Địa chỉ</strong><span>{job.company.address}</span></li>}
              {job.company?.phone && <li><strong>Điện thoại</strong><span>{job.company.phone}</span></li>}
            </ul>
          </div>
        </Link>
        {job.company?.description && <p className="job-profile__company-description">{job.company.description}</p>}
        <Link className="job-profile__company-link" to={companyUrl}>Xem trang công ty <Icon name="arrow" /></Link>
      </div>

      <div className="job-detail__related">
        <div className="job-profile__related-heading"><div><span className="job-profile__eyebrow">KHÁM PHÁ THÊM CƠ HỘI</span><h2>Công việc khác</h2></div><span>{relatedJobs.length} việc làm</span></div>
        {remote.relatedError ? <p role="alert">{remote.relatedError}</p> : relatedJobs.length ? <JobList jobs={relatedJobs.slice(relatedPage * RELATED_PAGE_SIZE, (relatedPage + 1) * RELATED_PAGE_SIZE)} onReset={() => {}} onToggleSave={toggleSaved} savedIds={savedIds} /> : <p>Chưa có công việc khác.</p>}
        <Pagination page={relatedPage} totalPages={relatedTotalPages} totalElements={relatedJobs.length} label="việc làm" onChange={(page) => setRelatedPagination({ key: relatedKey, page })} />
      </div>

    </section>
  )
}
