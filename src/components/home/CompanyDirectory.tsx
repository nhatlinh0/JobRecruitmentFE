import { useState } from 'react'
import { Link } from 'react-router-dom'
import { jobs } from '../../data/jobs'
import { slugify } from '../../utils/slugify'
import { Pagination } from '../ui/Pagination'
import { SectionHeading } from '../ui/SectionHeading'
import { Icon } from '../ui/Icon'
import './CompanyDirectory.css'
import type { HomeCompany } from '../../services/home'

const PAGE_SIZE = 6
// Công ty hiện lấy từ dữ liệu việc làm mẫu, gộp theo tên để tránh trùng lặp.
const companies = Array.from(new Map(jobs.map((job) => [job.companyName, job])).values())

export function CompanyDirectory({ items }: { items?: HomeCompany[] }) {
  const companiesToShow: HomeCompany[] = items ?? companies.map((job) => ({ id: String(job.id), name: job.companyName, slug: slugify(job.companyName), logoUrl: '', industry: job.company?.industry ?? '', country: job.company?.country ?? '', size: job.company?.size ?? '' }))
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(companiesToShow.length / PAGE_SIZE)
  const currentPage = Math.max(0, Math.min(page, totalPages - 1))
  const content = companiesToShow.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  return <section className="company-directory" id="companies">
    <SectionHeading kicker="KHÁM PHÁ NHÀ TUYỂN DỤNG" title="Danh sách công ty" description="Tìm hiểu các công ty và cơ hội phát triển sự nghiệp dành cho bạn." />
    <div className="company-directory__grid">
      {content.map((company) => <article className="company-directory__card" key={company.id}>
        <div className="company-directory__top">
          {company.logoUrl ? <img className="company-directory__logo" style={{ objectFit: 'contain', background: '#fff' }} src={company.logoUrl} alt={`Logo ${company.name}`} /> : <div className="company-directory__logo company-mark green" aria-hidden="true">{company.name.charAt(0).toUpperCase()}</div>}
        </div>
        <h3><Link className="company-directory__name-link" to={`/companies/${company.slug || slugify(company.name)}`}>{company.name}</Link></h3>
        <p className="company-directory__industry">{company.industry ? <Link to={`/industries/${encodeURIComponent(company.industrySlug || slugify(company.industry))}`} state={{ label: company.industry }}>{company.industry}</Link> : 'Chưa cập nhật lĩnh vực'}</p>
        <dl>
          <div><dt><Icon name="location" /> Quốc gia</dt><dd>{company.country || 'Chưa cập nhật'}</dd></div>
          <div><dt><Icon name="briefcase" /> Quy mô</dt><dd>{company.size ? `${company.size} nhân sự` : 'Chưa cập nhật'}</dd></div>
        </dl>
        <Link className="company-directory__footer" to={`/companies/${company.slug || slugify(company.name)}`}><span>Khám phá công ty</span><Icon name="arrow" /></Link>
      </article>)}
    </div>
    {!content.length && <p>Chưa có công ty phù hợp.</p>}
    <Pagination page={currentPage} totalPages={totalPages} totalElements={companiesToShow.length} label="công ty" onChange={setPage} />
  </section>
}
