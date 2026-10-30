import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobList } from '../components/jobs/JobList'
import { Pagination } from '../components/ui/Pagination'
import { jobs } from '../data/jobs'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { slugify } from '../utils/slugify'
import { Icon } from '../components/ui/Icon'
import './CompanyDetailPage.css'

const PAGE_SIZE = 6

export function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { savedIds, toggleSaved } = useSavedJobs()
  const [pagination, setPagination] = useState({ slug, page: 0 })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const companyJobs = jobs.filter((job) => slugify(job.companyName) === slug)
  const firstJob = companyJobs[0]
  const totalPages = Math.ceil(companyJobs.length / PAGE_SIZE)
  const page = pagination.slug === slug ? Math.max(0, Math.min(pagination.page, totalPages - 1)) : 0
  const content = companyJobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

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
        <JobList jobs={content} onReset={() => {}} onToggleSave={toggleSaved} savedIds={savedIds} />
        <Pagination page={page} totalPages={totalPages} totalElements={companyJobs.length} label="việc làm" onChange={(nextPage) => setPagination({ slug, page: nextPage })} />
      </div>
    </section>
  )
}
