import { useState } from 'react'
import { Link } from 'react-router-dom'
import { jobs } from '../../data/jobs'
import { slugify } from '../../utils/slugify'
import { Pagination } from '../ui/Pagination'
import { SectionHeading } from '../ui/SectionHeading'
import { Icon } from '../ui/Icon'
import './CompanyDirectory.css'

const PAGE_SIZE = 6
// Công ty hiện lấy từ dữ liệu việc làm mẫu, gộp theo tên để tránh trùng lặp.
const companies = Array.from(new Map(jobs.map((job) => [job.companyName, job])).values())

export function CompanyDirectory() {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(companies.length / PAGE_SIZE)
  const content = companies.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return <section className="company-directory" id="companies">
    <SectionHeading kicker="KHÁM PHÁ NHÀ TUYỂN DỤNG" title="Danh sách công ty" description="Tìm hiểu các công ty và cơ hội phát triển sự nghiệp dành cho bạn." />
    <div className="company-directory__grid">
      {content.map((company) => <Link className="company-directory__card" key={company.companyName} to={`/companies/${slugify(company.companyName)}`}>
        <div className="company-directory__top">
          <div className={`company-directory__logo company-mark ${company.companyColor}`} aria-hidden="true">{company.companyName.charAt(0).toUpperCase()}</div>
          <span className="company-directory__openings">{jobs.filter((job) => job.companyName === company.companyName).length} vị trí đang tuyển</span>
        </div>
        <h3>{company.companyName}</h3>
        <p className="company-directory__industry">{company.company?.industry ?? 'Chưa cập nhật lĩnh vực'}</p>
        <dl>
          <div><dt><Icon name="location" /> Quốc gia</dt><dd>{company.company?.country ?? 'Chưa cập nhật'}</dd></div>
          <div><dt><Icon name="briefcase" /> Quy mô</dt><dd>{company.company?.size ? `${company.company.size} nhân sự` : 'Chưa cập nhật'}</dd></div>
        </dl>
        <div className="company-directory__footer"><span>Khám phá công ty</span><Icon name="arrow" /></div>
      </Link>)}
    </div>
    <Pagination page={page} totalPages={totalPages} totalElements={companies.length} label="công ty" onChange={setPage} />
  </section>
}
