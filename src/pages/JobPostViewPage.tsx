import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchMyJob, type RecruitJob } from '../services/jobs'
import { useAuth } from '../hooks/useAuth'
import { fetchMyCompany, type CompanyProfile } from '../services/company'
import { formatDate, formatSalary } from '../utils/format'
import { Icon } from '../components/ui/Icon'
import './JobPostViewPage.css'

export function JobPostViewPage() {
  const { id } = useParams<{ id: string }>()
  const { token, user } = useAuth()
  const [result, setResult] = useState<{ id: string | undefined; post: RecruitJob | null; error: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companyError, setCompanyError] = useState('')
  const [companyRetry, setCompanyRetry] = useState(0)
  const post = result && result.id === id ? result.post : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (!token || user?.role !== 'RECRUIT') return
    const controller = new AbortController()
    fetchMyJob(token, Number(id), controller.signal).then((post) => {
      if (!controller.signal.aborted) setResult({ id, post, error: '' })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({ id, post: null, error: error instanceof Error ? error.message : 'Không thể tải bài đăng.' })
    })
    return () => controller.abort()
  }, [token, user?.role, id, retry])

  useEffect(() => {
    if (!token || user?.role !== 'RECRUIT') return
    const controller = new AbortController()
    fetchMyCompany(token, controller.signal).then((data) => {
      if (!controller.signal.aborted) setCompany(data)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setCompanyError(error instanceof Error ? error.message : 'Không thể tải thông tin công ty.')
    }).finally(() => { if (!controller.signal.aborted) setCompanyLoading(false) })
    return () => controller.abort()
  }, [token, user?.role, companyRetry])

  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'RECRUIT') return <Navigate to="/" replace />
  if (!result || result.id !== id) return <section className="post-view"><p role="status">Đang tải bài đăng...</p></section>
  if (result.error) return <section className="post-view"><p role="alert">{result.error}</p><button type="button" onClick={() => { setResult(null); setRetry((value) => value + 1) }}>Thử lại</button><Link to="/recruit/posts">← Quay lại danh sách</Link></section>

  if (!post) {
    return (
      <section className="post-view">
        <div className="post-view__not-found">
          <h1>Không tìm thấy bài đăng</h1>
          <Link className="button button-primary" to="/recruit/posts">← Quay lại danh sách</Link>
        </div>
      </section>
    )
  }

  const experienceText = post.experience
    ? `${post.experience.min} - ${post.experience.max} năm`
    : 'Không yêu cầu'

  return (
    <section className="post-view">
      <Link className="post-view__back" to="/recruit/posts">← Quay lại danh sách</Link>

      <section className="post-view__company" aria-label="Thông tin công ty">
        <h2>Thông tin công ty</h2>
        {companyLoading ? <p role="status">Đang tải thông tin công ty...</p> : companyError ? <div role="alert">{companyError} <button className="button button-outline" type="button" onClick={() => { setCompanyLoading(true); setCompanyError(''); setCompanyRetry((value) => value + 1) }}>Thử lại</button></div> : company ? <>
          <div className="post-view__company-heading">
            {company.logoUrl ? <img className="post-view__company-logo" src={company.logoUrl} alt={`Logo ${company.name}`} /> : <div className="post-view__mark" data-color="green" aria-hidden="true">{company.name.charAt(0).toUpperCase()}</div>}
            <h3>{company.name}</h3>
          </div>
          <dl className="post-view__meta">
            <div><dt>Quy mô công ty</dt><dd>{company.companySize ? `${company.companySize} nhân sự` : 'Chưa cập nhật'}</dd></div>
            <div><dt>Quốc gia</dt><dd>{company.country || 'Chưa cập nhật'}</dd></div>
            <div><dt>Lĩnh vực</dt><dd>{company.industry?.name || 'Chưa cập nhật'}</dd></div>
          </dl>
        </> : <p>Chưa có thông tin công ty.</p>}
      </section>

      <div className="post-view__header">
        <div>
          <h1>{post.title}</h1>
          <p>{post.companyName} · Mã bài đăng #{post.id}</p>
        </div>
        {post.featured && <span className="post-view__featured"><Icon name="spark" /> Nổi bật</span>}
      </div>

      <dl className="post-view__meta">
        <div><dt>Địa chỉ</dt><dd>{post.address ?? post.city}</dd></div>
        <div><dt>Ngày kết thúc</dt><dd>{post.deadline && !Number.isNaN(Date.parse(post.deadline)) ? formatDate(post.deadline) : 'Chưa cập nhật'}</dd></div>
        <div><dt>Hình thức làm việc</dt><dd>{post.workType}</dd></div>
        <div><dt>Kinh nghiệm</dt><dd>{experienceText}</dd></div>
        <div><dt>Mức lương</dt><dd>{formatSalary(post.salary)}</dd></div>
        <div><dt>Thành phố</dt><dd>{post.city}</dd></div>
        <div><dt>Lĩnh vực</dt><dd>{post.field}</dd></div>
      </dl>

      <div className="post-view__block">
        <h2>Kỹ năng yêu cầu</h2>
        <ul className="post-view__skills">
          {post.skills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </div>

      <div className="post-view__block">
        <h2>Mô tả công việc</h2>
        <p className="post-view__text">{post.description}</p>
      </div>

      <div className="post-view__block">
        <h2>Yêu cầu ứng viên</h2>
        <p className="post-view__text">{post.requirements}</p>
      </div>

      <div className="post-view__block">
        <h2>Quyền lợi khi gia nhập</h2>
        <p className="post-view__text">{post.benefits}</p>
      </div>
    </section>
  )
}
