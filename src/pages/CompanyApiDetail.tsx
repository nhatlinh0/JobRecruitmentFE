import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCompanyBySlug, fetchHomeJobs, type HomeCompany } from '../services/home'
import type { Job } from '../types/job'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { JobList } from '../components/jobs/JobList'
import { Pagination } from '../components/ui/Pagination'
import { Icon } from '../components/ui/Icon'
import { slugify } from '../utils/slugify'

const PAGE_SIZE = 6

export function CompanyApiDetail({ slug }: { slug: string }) {
  const [data, setData] = useState<{ company: HomeCompany | null; jobs: Job[] } | null>(null)
  const [error, setError] = useState('')
  const [jobsError, setJobsError] = useState('')
  const [retry, setRetry] = useState(0)
  const [page, setPage] = useState(0)
  const { savedIds, toggleSaved } = useSavedJobs()

  useEffect(() => {
    const controller = new AbortController()
    window.scrollTo(0, 0)
    Promise.allSettled([fetchCompanyBySlug(slug, controller.signal), fetchHomeJobs(controller.signal)]).then(([detail, jobs]) => {
      if (controller.signal.aborted) return
      if (detail.status === 'rejected') { setError(detail.reason instanceof Error ? detail.reason.message : 'Không thể tải công ty.'); return }
      const company = detail.value
      if (jobs.status === 'rejected') setJobsError(jobs.reason instanceof Error ? jobs.reason.message : 'Không thể tải việc làm.')
      setData({ company, jobs: company && jobs.status === 'fulfilled' ? jobs.value.filter((job) => job.companyId ? job.companyId === company.id : job.companyName === company.name) : [] })
    })
    return () => controller.abort()
  }, [slug, retry])

  function reload() { setData(null); setError(''); setJobsError(''); setPage(0); setRetry((value) => value + 1) }

  if (error) return <section className="company-detail"><p role="alert">{error}</p><button className="button button-outline" type="button" onClick={reload}>Thử lại</button></section>
  if (!data) return <section className="company-detail"><p role="status">Đang tải thông tin công ty...</p></section>
  const { company, jobs } = data
  if (!company) return <section className="company-detail"><h1>Không tìm thấy công ty</h1><Link to="/">← Về trang chủ</Link></section>
  const totalPages = Math.ceil(jobs.length / PAGE_SIZE)
  const currentPage = Math.max(0, Math.min(page, totalPages - 1))

  return <section className="company-detail company-profile">
    <nav className="company-profile__breadcrumb" aria-label="Đường dẫn"><Link to="/">Trang chủ</Link><span aria-hidden="true">/</span><Link to="/#companies">Công ty</Link><span aria-hidden="true">/</span><span>{company.name}</span></nav>
    <header className="company-profile__hero">
      <div className="company-profile__cover" aria-hidden="true"><span>JOBSEEKER / COMPANY PROFILE</span></div>
      <div className="company-profile__identity">
        {company.logoUrl ? <img className="company-profile__logo" src={company.logoUrl} alt={`Logo ${company.name}`} /> : <div className="company-profile__logo company-profile__logo--fallback" aria-hidden="true">{company.name.charAt(0).toUpperCase()}</div>}
        <div className="company-profile__title"><span className="company-profile__eyebrow">KHÁM PHÁ NHÀ TUYỂN DỤNG</span><h1>{company.name}</h1><div className="company-profile__tags"><span>{company.industry ? <Link style={{ color: 'inherit', textDecoration: 'none' }} to={`/industries/${encodeURIComponent(company.industrySlug || slugify(company.industry))}`} state={{ label: company.industry }}>{company.industry}</Link> : 'Chưa cập nhật lĩnh vực'}</span>{company.country && <span><Icon name="location" />{company.country}</span>}</div></div>
        <a className="button button-primary company-profile__cta" href="#company-jobs"><Icon name="briefcase" /> Xem việc làm <span>{jobs.length}</span></a>
      </div>
    </header>
    <div className="company-profile__overview">
      <article className="company-profile__about"><span className="company-profile__eyebrow">VỀ CHÚNG TÔI</span><h2>Giới thiệu công ty</h2><p className="company-detail__text">{company.description || 'Công ty chưa cập nhật nội dung giới thiệu.'}</p></article>
      <aside className="company-profile__facts"><h2>Thông tin công ty</h2><dl>
        <div><dt><Icon name="code" /> Lĩnh vực</dt><dd>{company.industry ? <Link to={`/industries/${encodeURIComponent(company.industrySlug || slugify(company.industry))}`} state={{ label: company.industry }}>{company.industry}</Link> : 'Chưa cập nhật'}</dd></div>
        <div><dt><Icon name="briefcase" /> Quy mô nhân sự</dt><dd>{company.size ? `${company.size} nhân sự` : 'Chưa cập nhật'}</dd></div>
        <div><dt><Icon name="location" /> Quốc gia</dt><dd>{company.country || 'Chưa cập nhật'}</dd></div>
        <div><dt><Icon name="location" /> Địa chỉ</dt><dd>{company.address || 'Chưa cập nhật'}</dd></div>
        <div><dt><Icon name="briefcase" /> Điện thoại</dt><dd>{company.phone || 'Chưa cập nhật'}</dd></div>
      </dl></aside>
    </div>
    <section className="company-profile__jobs" id="company-jobs"><div className="company-profile__jobs-heading"><div><span className="company-profile__eyebrow">BƯỚC TIẾP THEO TRONG SỰ NGHIỆP</span><h2>Cơ hội tại {company.name}</h2><p>Khám phá vị trí phù hợp và bắt đầu hành trình mới.</p></div><span className="company-profile__count">{jobs.length} việc làm</span></div>
      {jobsError ? <div role="alert">{jobsError} <button type="button" onClick={reload}>Thử lại</button></div> : <>
        {jobs.length ? <JobList jobs={jobs.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)} savedIds={savedIds} onToggleSave={toggleSaved} onReset={() => setPage(0)} /> : <div className="company-profile__empty"><Icon name="briefcase" /><h3>Chưa có vị trí tuyển dụng</h3><p>Hãy quay lại sau để xem cơ hội mới từ công ty.</p><Link to="/">Khám phá việc làm khác →</Link></div>}
        <Pagination page={currentPage} totalPages={totalPages} totalElements={jobs.length} label="việc làm" onChange={setPage} />
      </>}
    </section>
  </section>
}
