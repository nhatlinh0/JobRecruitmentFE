import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { performCompanyAction, fetchAdminCompanies, type CompanyAction, type AdminCompany, type AdminCompanyPage, type CompanyStatusFilter } from '../services/adminCompanies'
import { Pagination } from '../components/ui/Pagination'
import { Icon } from '../components/ui/Icon'
import { formatDate } from '../utils/format'
import './JobPostListPage.css'
import './AdminCompaniesPage.css'

const statuses: Record<string, { label: string; style: string }> = {
  PENDING: { label: 'Chờ duyệt', style: 'is-expiring' },
  ACCEPTED: { label: 'Đã duyệt', style: 'is-open' },
  REJECT: { label: 'Đã loại', style: 'is-closed' },
  SUSPEND: { label: 'Tạm ngưng', style: 'is-suspended' },
}

function CompanyStatus({ value }: { value: string }) {
  const status = statuses[value] ?? { label: value || 'Chưa có trạng thái', style: 'is-suspended' }
  return <span className={`post-status ${status.style}`}>{status.label}</span>
}

function CompanyDetails({ company, onClose }: { company: AdminCompany; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = overflow }
  }, [])
  return <dialog className="admin-company-detail" ref={ref} aria-labelledby="admin-company-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <header className="admin-company-detail__header"><div><span className="section-kicker">THÔNG TIN CÔNG TY #{company.id}</span><h2 id="admin-company-title">{company.name}</h2></div><button type="button" aria-label="Đóng chi tiết công ty" onClick={onClose}>×</button></header>
    <div className="admin-company-detail__body">
      <div className="admin-company-detail__identity">{company.logoUrl && <img src={company.logoUrl} alt={`Logo ${company.name}`} />}<div><CompanyStatus value={company.status} /><p>{company.industry?.name || 'Chưa cập nhật lĩnh vực'}</p></div></div>
      <dl className="admin-company-detail__facts">
        <div><dt>Mã công ty</dt><dd>#{company.id}</dd></div>
        <div><dt>Slug</dt><dd>{company.slug || '—'}</dd></div>
        <div><dt>Quy mô nhân sự</dt><dd>{company.companySize || '—'}</dd></div>
        <div><dt>Quốc gia</dt><dd>{company.country || '—'}</dd></div>
        <div><dt>Điện thoại</dt><dd>{company.phone || '—'}</dd></div>
        <div><dt>Số công việc</dt><dd>{company.jobCount}</dd></div>
        <div><dt>Ngày tạo</dt><dd>{company.createAt && !Number.isNaN(Date.parse(company.createAt)) ? formatDate(company.createAt) : '—'}</dd></div>
        <div><dt>Lĩnh vực</dt><dd>{company.industry?.name || '—'}</dd></div>
        <div className="admin-company-detail__full"><dt>Địa chỉ</dt><dd>{company.address || '—'}</dd></div>
      </dl>
      <section><h3>Giới thiệu công ty</h3><p className="admin-company-detail__description">{company.description || 'Chưa cập nhật giới thiệu.'}</p></section>
      <section><h3>Giấy tờ xác minh công ty</h3>{company.profilePDFUrl ? <a href={company.profilePDFUrl} target="_blank" rel="noopener noreferrer"><img className="admin-company-detail__document" src={company.profilePDFUrl} alt={`Giấy tờ xác minh ${company.name}`} /></a> : <p>Chưa có giấy tờ xác minh.</p>}</section>
    </div>
  </dialog>
}

export function AdminCompaniesPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <CompaniesContent key={token} token={token} />
}

function CompaniesContent({ token }: { token: string }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<CompanyStatusFilter>('')
  const [name, setName] = useState('')
  const [searchName, setSearchName] = useState('')
  const [data, setData] = useState<AdminCompanyPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState<AdminCompany | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const updating = useRef(false)

  async function changeStatus(company: AdminCompany, action: CompanyAction) {
    if (updating.current) return
    updating.current = true
    setUpdatingId(company.id)
    try {
      await performCompanyAction(token, company.id, action)
      const status = action === 'accept' ? 'ACCEPTED' : action === 'reject' ? 'REJECT' : 'SUSPEND'
      setData((current) => current ? { ...current, content: current.content.map((item) => item.id === company.id ? { ...item, status } : item) } : current)
      setSelected((current) => current?.id === company.id ? { ...current, status } : current)
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: action === 'accept' ? `Đã duyệt công ty ${company.name}.` : action === 'reject' ? `Đã loại công ty ${company.name}.` : `Đã tạm ngưng công ty ${company.name}.` } }))
      setLoading(true); setError(''); setRetry((value) => value + 1)
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: error instanceof Error ? error.message : 'Không thể cập nhật công ty.' } }))
    } finally { updating.current = false; setUpdatingId(null) }
  }
  useEffect(() => {
    const controller = new AbortController()
    fetchAdminCompanies(token, page, 10, controller.signal, filter, searchName).then((result) => {
      if (controller.signal.aborted) return
      if (result.totalPages > 0 && page >= result.totalPages) {
        setPage(result.totalPages - 1)
        return
      }
      setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải công ty.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, page, retry, filter, searchName])
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    setLoading(true); setError(''); setPage(0); setFilter(''); setSearchName(name.trim()); setRetry((value) => value + 1)
  }
  return <section className="post-list admin-companies">
    <div className="post-list__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>Quản lý công ty</h1><p>Thông tin doanh nghiệp và trạng thái xét duyệt trên hệ thống.</p></div>
    <form className="admin-companies__search" onSubmit={search}>
      <label htmlFor="admin-company-name">Tên công ty<input id="admin-company-name" name="name" type="text" required value={name} disabled={updatingId !== null} onChange={(event) => setName(event.target.value)} /></label>
      <button type="submit" className="button button-primary" disabled={loading || updatingId !== null}>Tìm</button>
    </form>
    <div className="admin-companies__filters" role="group" aria-label="Lọc công ty theo trạng thái">
      {([{ value: '', label: 'Tất cả' }, { value: 'ACCEPTED', label: 'Đã duyệt' }, { value: 'REJECT', label: 'Loại' }, { value: 'SUSPEND', label: 'Tạm ngưng' }] as const).map((item) => <button key={item.value} type="button" aria-pressed={!searchName && filter === item.value} disabled={updatingId !== null} onClick={() => {
        if (filter === item.value && !searchName) return
        setLoading(true); setError(''); setPage(0); setFilter(item.value); setSearchName(''); setName('')
      }}>{item.label}</button>)}
    </div>
    {loading ? <p role="status">Đang tải danh sách công ty...</p> : error ? <div role="alert">{error} <button className="button button-outline" type="button" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : data && <>
      <div className="post-list__card"><table className="post-table"><thead><tr><th scope="col">STT</th><th scope="col">ID</th><th scope="col">Công ty</th><th scope="col">Lĩnh vực</th><th scope="col">Quốc gia</th><th scope="col">Quy mô</th><th scope="col">Trạng thái</th><th scope="col">Chi tiết</th><th scope="col">Thao tác</th></tr></thead><tbody>
        {data.content.map((company, index) => <tr key={company.id}>
          <td>{data.page * data.size + index + 1}</td><td className="post-table__id">#{company.id}</td>
          <td><div className="admin-companies__identity">{company.logoUrl ? <img src={company.logoUrl} alt="" /> : <span className="admin-companies__fallback" aria-hidden="true">{company.name.charAt(0)}</span>}<strong>{company.name}</strong></div></td>
          <td>{company.industry?.name || '—'}</td><td>{company.country || '—'}</td><td>{company.companySize || '—'}</td><td><CompanyStatus value={company.status} /></td>
          <td><button className="button button-outline admin-companies__details" type="button" onClick={() => setSelected(company)}><Icon name="eye" /> Xem chi tiết</button></td>
          <td><div className="admin-companies__actions" aria-busy={updatingId === company.id}><button type="button" className="admin-companies__action admin-companies__action--accept" disabled={updatingId !== null || company.status === 'ACCEPTED'} onClick={() => changeStatus(company, 'accept')}>Duyệt</button><button type="button" className="admin-companies__action admin-companies__action--reject" disabled={updatingId !== null || company.status === 'REJECT'} onClick={() => changeStatus(company, 'reject')}>Loại</button><button type="button" className="admin-companies__action" disabled={updatingId !== null || company.status === 'SUSPEND'} onClick={() => changeStatus(company, 'suspend')}>Tạm ngưng</button></div></td>
        </tr>)}
        {!data.content.length && <tr><td className="post-table__empty" colSpan={9}>{searchName ? 'Không tìm thấy công ty phù hợp.' : 'Chưa có công ty nào.'}</td></tr>}
      </tbody></table></div>
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="công ty" onChange={(next) => { setLoading(true); setError(''); setPage(next) }} />
    </>}
    {selected && <CompanyDetails company={selected} onClose={() => setSelected(null)} />}
  </section>
}
