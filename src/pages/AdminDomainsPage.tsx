import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Icon } from '../components/ui/Icon'
import { fetchAdminDomains, mutateAdminDomain, type AdminDomain, type AdminDomainPage } from '../services/adminDomains'
import { Pagination } from '../components/ui/Pagination'
import { slugify } from '../utils/slugify'
import './JobPostListPage.css'
import './AdminIndustriesPage.css'

export function AdminDomainsPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <DomainsContent key={token} token={token} />
}

function DomainsContent({ token }: { token: string }) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<AdminDomainPage | null>(null)
  const items = data?.content ?? []
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetchAdminDomains(page, 10, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      const lastPage = Math.max(0, result.totalPages - 1)
      if (page > lastPage) { setPage(lastPage); return }
      setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải chuyên môn.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [retry, page])

  function notify(type: 'success' | 'error', message: string) {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type, message } }))
  }
  function resetForm() { setEditing(null); setName('') }
  function reload() { setLoading(true); setError(''); setRetry((value) => value + 1) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) { inputRef.current?.focus(); return }
    if (submitting.current) return
    submitting.current = true; setBusy(true)
    try {
      await mutateAdminDomain(token, editing === null ? 'POST' : 'PUT', editing ?? undefined, { name: name.trim(), slug: slugify(name) })
      notify('success', editing === null ? 'Thêm chuyên môn thành công.' : 'Cập nhật chuyên môn thành công.')
      resetForm(); reload()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Không thể lưu chuyên môn.')
    } finally { submitting.current = false; setBusy(false) }
  }

  async function remove(item: AdminDomain) {
    if (submitting.current || !window.confirm(`Bạn có chắc muốn xóa chuyên môn "${item.name}"?`)) return
    submitting.current = true; setBusy(true)
    try {
      await mutateAdminDomain(token, 'DELETE', item.id)
      notify('success', 'Xóa chuyên môn thành công.')
      if (editing === item.id) resetForm()
      reload()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Không thể xóa chuyên môn.')
    } finally { submitting.current = false; setBusy(false) }
  }

  return <section className="post-list admin-industries">
    <div className="post-list__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>Quản lý chuyên môn</h1><p>Danh mục chuyên môn của công việc.</p></div>
    {loading ? <p role="status">Đang tải danh sách chuyên môn...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={() => { setError(''); setLoading(true); setRetry((value) => value + 1) }}>Thử lại</button></div> : <div className="post-list__card"><table className="post-table"><thead><tr>{['STT', 'ID', 'Tên chuyên môn', 'Slug', 'Thao tác'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
      {items.map((item, index) => <tr key={item.id}><td>{(data?.page ?? 0) * (data?.size ?? 10) + index + 1}</td><td className="post-table__id">#{item.id}</td><td><strong>{item.name}</strong></td><td>{item.slug || '—'}</td><td><div className="admin-industries__actions">
        <button type="button" disabled={busy} aria-label={`Sửa ${item.name}`} title="Sửa" onClick={() => { setEditing(item.id); setName(item.name); inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}><Icon name="edit" /></button>
        <button type="button" disabled={busy} className="admin-industries__delete" aria-label={`Xóa ${item.name}`} title="Xóa" onClick={() => remove(item)}><Icon name="trash" /></button>
      </div></td></tr>)}
      {!items.length && <tr><td className="post-table__empty" colSpan={5}>Chưa có chuyên môn nào.</td></tr>}
    </tbody></table></div>}
    {!loading && !error && data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="chuyên môn" onChange={(next) => { setLoading(true); setError(''); setPage(next) }} />}
    <form className="admin-industries__form" onSubmit={submit} aria-busy={busy}>
      <h2>{editing === null ? 'Thêm chuyên môn' : 'Chỉnh sửa chuyên môn'}</h2>
      <label>Tên chuyên môn<input ref={inputRef} name="name" required disabled={busy} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Slug<input name="slug" readOnly value={slugify(name)} aria-describedby="domain-slug-hint" /></label>
      <p id="domain-slug-hint" className="admin-industries__hint">Slug được tạo tự động theo tên chuyên môn.</p>
      <div className="admin-industries__form-actions"><button type="submit" disabled={busy} className="button button-primary">{busy ? 'Đang xử lý...' : editing === null ? 'Thêm' : 'Lưu thay đổi'}</button>{editing !== null && <button type="button" disabled={busy} className="button button-outline" onClick={resetForm}>Hủy chỉnh sửa</button>}</div>
    </form>
  </section>
}
