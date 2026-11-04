import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchAdminJobs, performJobAction, type AdminJob, type AdminJobPage, type JobAction, type JobStatusFilter } from '../services/adminJobs'
import { Pagination } from '../components/ui/Pagination'
import { formatDate } from '../utils/format'
import './JobPostListPage.css'
import './AdminCompaniesPage.css'
import './AdminJobsPage.css'

const statuses: Record<string, { label: string; style: string }> = {
  PENDING: { label: 'Chờ duyệt', style: 'is-expiring' },
  ACCEPTED: { label: 'Đã duyệt', style: 'is-open' },
  REJECT: { label: 'Từ chối', style: 'is-closed' },
  SUSPEND: { label: 'Tạm ngưng', style: 'is-suspended' },
}
function JobStatus({ value }: { value: string }) {
  const status = statuses[value] ?? { label: value || 'Chưa cập nhật', style: 'is-suspended' }
  return <span className={`post-status ${status.style}`}>{status.label}</span>
}
const date = (value: string) => value && !Number.isNaN(Date.parse(value)) ? formatDate(value) : '—'
const salary = (job: AdminJob) => job.salaryNegotiable ? 'Thỏa thuận' : `${job.salaryMin ?? '—'} - ${job.salaryMax ?? '—'} triệu`

function JobDetails({ job, onClose }: { job: AdminJob; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = overflow }
  }, [])
  const facts = [
    ['ID công việc', `#${job.id}`], ['Slug', job.slug], ['Công ty', job.company?.name], ['ID công ty', job.company ? `#${job.company.id}` : '—'],
    ['Quy mô công ty', job.company?.companySize], ['Quốc gia', job.company?.country], ['Chuyên môn', job.domain?.name], ['ID chuyên môn', job.domain ? `#${job.domain.id}` : '—'],
    ['Thành phố', job.city], ['Hình thức làm việc', job.workingType.replaceAll('_', ' ')], ['Kinh nghiệm', `${job.experienceMin ?? '—'} - ${job.experienceMax ?? '—'} năm`],
    ['Mức lương', salary(job)], ['Hạn ứng tuyển', date(job.endDate)], ['Ngày tạo', date(job.createAt)], ['Việc làm nổi bật', job.prioritize ? 'Có' : 'Không'],
  ]
  return <dialog ref={ref} className="admin-company-detail admin-job-detail" aria-labelledby="admin-job-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <header className="admin-company-detail__header"><div><span className="section-kicker">CHI TIẾT CÔNG VIỆC</span><h2 id="admin-job-title">{job.title}</h2></div><button type="button" aria-label="Đóng chi tiết công việc" onClick={onClose}>×</button></header>
    <div className="admin-company-detail__body">
      <div className="admin-company-detail__identity">{job.company?.logoUrl && <img src={job.company.logoUrl} alt={`Logo ${job.company.name}`} />}<div><JobStatus value={job.status} /><p>{job.company?.name || 'Chưa cập nhật công ty'}</p></div></div>
      <dl className="admin-company-detail__facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}<div className="admin-company-detail__full"><dt>Địa chỉ làm việc</dt><dd>{job.address || '—'}</dd></div></dl>
      <section><h3>Kỹ năng</h3><div className="admin-job-detail__skills">{job.skills.length ? job.skills.map((skill) => <span key={skill.id}>{skill.name}</span>) : 'Chưa cập nhật kỹ năng.'}</div></section>
      {[[ 'Mô tả công việc', job.description ], [ 'Yêu cầu ứng viên', job.requirements ], [ 'Quyền lợi', job.benefits ]].map(([title, content]) => <section key={title}><h3>{title}</h3><p className="admin-company-detail__description">{content || 'Chưa cập nhật.'}</p></section>)}
    </div>
  </dialog>
}

export function AdminJobsPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <JobsContent key={token} token={token} />
}

function JobsContent({ token }: { token: string }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<JobStatusFilter>('')
  const [title, setTitle] = useState('')
  const [searchTitle, setSearchTitle] = useState('')
  const [data, setData] = useState<AdminJobPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState<AdminJob | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const updating = useRef(false)
  useEffect(() => {
    const controller = new AbortController()
    fetchAdminJobs(page, 10, controller.signal, filter, token, searchTitle).then((result) => {
      if (controller.signal.aborted) return
      if (result.totalPages > 0 && page >= result.totalPages) {
        setPage(result.totalPages - 1)
        return
      }
      setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải công việc.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page, retry, filter, token, searchTitle])
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) return
    setLoading(true); setError(''); setPage(0); setFilter(''); setSearchTitle(title.trim()); setRetry((value) => value + 1)
  }
  async function changeStatus(job: AdminJob, action: JobAction) {
    if (updating.current) return
    updating.current = true
    setUpdatingId(job.id)
    try {
      await performJobAction(token, job.id, action)
      const status = action === 'accept' ? 'ACCEPTED' : action === 'reject' ? 'REJECT' : 'SUSPEND'
      setData((current) => current ? { ...current, content: current.content.map((item) => item.id === job.id ? { ...item, status } : item) } : current)
      setSelected((current) => current?.id === job.id ? { ...current, status } : current)
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: `Đã ${action === 'accept' ? 'duyệt' : action === 'reject' ? 'từ chối' : 'tạm ngưng'} công việc ${job.title}.` } }))
      setLoading(true); setError(''); setRetry((value) => value + 1)
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: error instanceof Error ? error.message : 'Không thể cập nhật công việc.' } }))
    } finally { updating.current = false; setUpdatingId(null) }
  }
  return <section className="post-list admin-jobs">
    <div className="post-list__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>Quản lý công việc</h1><p>Danh sách công việc và trạng thái xét duyệt trên hệ thống.</p></div>
    <form className="admin-companies__search" onSubmit={search}>
      <label htmlFor="admin-job-title-search">Tiêu đề công việc<input id="admin-job-title-search" name="title" type="text" required value={title} disabled={updatingId !== null} onChange={(event) => setTitle(event.target.value)} /></label>
      <button type="submit" className="button button-primary" disabled={loading || updatingId !== null}>Tìm</button>
    </form>
    <div className="admin-jobs__filters" role="group" aria-label="Lọc công việc theo trạng thái">
      {([{ value: '', label: 'Tất cả' }, { value: 'ACCEPTED', label: 'Đã duyệt' }, { value: 'REJECT', label: 'Loại' }, { value: 'SUSPEND', label: 'Tạm ngưng' }] as const).map((item) => <button key={item.value} type="button" aria-pressed={!searchTitle && filter === item.value} disabled={updatingId !== null} onClick={() => {
        if (filter === item.value && !searchTitle) return
        setLoading(true); setError(''); setPage(0); setFilter(item.value); setSearchTitle(''); setTitle('')
      }}>{item.label}</button>)}
    </div>
    {loading ? <p role="status">Đang tải danh sách công việc...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : data && <>
      <div className="post-list__card"><table className="post-table"><thead><tr>{['STT', 'ID', 'Công việc', 'Công ty', 'Thành phố', 'Mức lương', 'Trạng thái', 'Chi tiết', 'Thao tác'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
        {data.content.map((job, index) => <tr key={job.id}><td>{data.page * data.size + index + 1}</td><td className="post-table__id">#{job.id}</td><td><strong>{job.title}</strong><small className="admin-jobs__domain">{job.domain?.name}</small></td><td>{job.company?.name || '—'}</td><td>{job.city || '—'}</td><td>{salary(job)}</td><td><JobStatus value={job.status} /></td><td><button type="button" className="button button-outline admin-companies__details" onClick={() => setSelected(job)}>Xem chi tiết</button></td><td><div className="admin-companies__actions" aria-busy={updatingId === job.id}>
          {(['accept', 'reject', 'suspend'] as const).map((action) => <button key={action} type="button" className={`admin-companies__action ${action !== 'suspend' ? `admin-companies__action--${action}` : ''}`} disabled={updatingId !== null || job.status === ({ accept: 'ACCEPTED', reject: 'REJECT', suspend: 'SUSPEND' }[action])} onClick={() => changeStatus(job, action)}>{{ accept: 'Duyệt', reject: 'Từ chối', suspend: 'Tạm ngưng' }[action]}</button>)}
        </div></td></tr>)}
        {!data.content.length && <tr><td colSpan={9} className="post-table__empty">{searchTitle ? 'Không tìm thấy công việc phù hợp.' : 'Chưa có công việc nào.'}</td></tr>}
      </tbody></table></div>
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="công việc" onChange={(next) => { setLoading(true); setError(''); setPage(next) }} />
    </>}
    {selected && <JobDetails job={selected} onClose={() => setSelected(null)} />}
  </section>
}
