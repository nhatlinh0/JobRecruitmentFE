import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobList } from '../components/jobs/JobList'
import { jobs } from '../data/jobs'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { slugify } from '../utils/slugify'
import { Icon } from '../components/ui/Icon'
import './CompanyDetailPage.css'

export function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { savedIds, toggleSaved } = useSavedJobs()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const companyJobs = jobs.filter((job) => slugify(job.companyName) === slug)
  const firstJob = companyJobs[0]

  if (!firstJob) {
    return (
      <section className="company-detail">
        <div className="company-detail__not-found">
          <h1>Không tìm thấy công ty</h1>
          <p>Công ty bạn đang tìm không tồn tại hoặc chưa có tin tuyển dụng.</p>
          <Link className="button button-primary" to="/">Về trang chủ</Link>
        </div>
      </section>
    )
  }

  const company = firstJob.company

  return (
    <section className="company-detail">
      <div className="company-detail__header">
        <div className="company-detail__logo" data-color={firstJob.companyColor}>
          {firstJob.companyName.charAt(0).toUpperCase()}
        </div>
        <div className="company-detail__heading">
          <h1>{firstJob.companyName}</h1>
          <span className="company-detail__industry">{company?.industry ?? 'Phần mềm'}</span>
        </div>
      </div>

      <div className="company-detail__meta">
        <div className="company-detail__meta-item">
          <Icon name="location" />
          <span>{company?.address ?? firstJob.address ?? firstJob.city}</span>
        </div>
        <div className="company-detail__meta-item">
          <Icon name="briefcase" />
          <span>Quy mô: {company?.size ?? '100-200'} nhân sự</span>
        </div>
        <div className="company-detail__meta-item">
          <Icon name="location" />
          <span>Quốc gia: {company?.country ?? 'Việt Nam'}</span>
        </div>
        {company?.phone && (
          <div className="company-detail__meta-item">
            <Icon name="calendar" />
            <span>Điện thoại: {company.phone}</span>
          </div>
        )}
      </div>

      <div className="company-detail__about">
        <h2>Giới thiệu công ty</h2>
        <p className="company-detail__text">{company?.description}</p>
      </div>

      <div className="company-detail__jobs">
        <h2>Vị trí đang tuyển ({companyJobs.length})</h2>
        <JobList jobs={companyJobs} onReset={() => {}} onToggleSave={toggleSaved} savedIds={savedIds} />
      </div>
    </section>
  )
}
