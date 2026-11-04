import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Icon } from '../components/ui/Icon'
import { fetchAdminIndustries, mutateAdminIndustry, type AdminIndustry, type AdminIndustryPage } from '../services/adminIndustries'
import { Pagination } from '../components/ui/Pagination'
import { slugify } from '../utils/slugify'
import './JobPostListPage.css'
import './AdminIndustriesPage.css'

export function AdminIndustriesPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <IndustriesContent key={token} token={token} />
}

function IndustriesContent({ token }: { token: string }) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<AdminIndustryPage | null>(null)
  const items = data?.content ?? []
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetchAdminIndustries(page, 10, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      const lastPage = Math.max(0, result.totalPages - 1)
      if (page > lastPage) { setPage(lastPage); return }
      setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải lĩnh vực.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [retry, page])

  function notify(type: 'success' | 'error', message: string) {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type, message } }))
  }
  function resetForm() { setEditing(null); setName(''); setDescription('') }
  function reload() { setLoading(true); setError(''); setRetry((value) => value + 1) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) { inputRef.current?.focus(); return }
    if (submitting.current) return
    submitting.current = true; setBusy(true)
    try {
      await mutateAdminIndustry(token, editing === null ? 'POST' : 'PUT', editing ?? undefined, { name: name.trim(), slug: slugify(name), description })
      notify('success', editing === null ? 'Thêm lĩnh vực thành công.' : 'Cập nhật lĩnh vực thành công.')
      resetForm(); reload()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Không thể lưu lĩnh vực.')
    } finally { submitting.current = false; setBusy(false) }
  }

  async function remove(item: AdminIndustry) {
    if (submitting.current || !window.confirm(`Bạn có chắc muốn xóa lĩnh vực "${item.name}"?`)) return
    submitting.current = true; setBusy(true)
    try {
      await mutateAdminIndustry(token, 'DELETE', item.id)
      notify('success', 'Xóa lĩnh vực thành công.')
      if (editing === item.id) resetForm()
      reload()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Không thể xóa lĩnh vực.')
    } finally { submitting.current = false; setBusy(false) }
  }

  return <section className="post-list admin-industries">
    <div className="post-list__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>Quản lý lĩnh vực</h1><p>Danh mục lĩnh vực hoạt động của công ty.</p></div>
    {loading ? <p role="status">Đang tải danh sách lĩnh vực...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={() => { setError(''); setLoading(true); setRetry((value) => value + 1) }}>Thử lại</button></div> : <div className="post-list__card"><table className="post-table"><thead><tr>{['STT', 'ID', 'Tên lĩnh vực', 'Slug', 'Mô tả', 'Thao tác'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
      {items.map((item, index) => <tr key={item.id}><td>{(data?.page ?? 0) * (data?.size ?? 10) + index + 1}</td><td className="post-table__id">#{item.id}</td><td><strong>{item.name}</strong></td><td>{item.slug || '—'}</td><td className="admin-industries__description">{item.description || '—'}</td><td><div className="admin-industries__actions">
        <button type="button" disabled={busy} aria-label={`Sửa ${item.name}`} title="Sửa" onClick={() => { setEditing(item.id); setName(item.name); setDescription(item.description); inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}><Icon name="edit" /></button>
        <button type="button" disabled={busy} className="admin-industries__delete" aria-label={`Xóa ${item.name}`} title="Xóa" onClick={() => remove(item)}><Icon name="trash" /></button>
      </div></td></tr>)}
      {!items.length && <tr><td className="post-table__empty" colSpan={6}>Chưa có lĩnh vực nào.</td></tr>}
    </tbody></table></div>}
    {!loading && !error && data && <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="lĩnh vực" onChange={(next) => { setLoading(true); setError(''); setPage(next) }} />}
    <form className="admin-industries__form" onSubmit={submit} aria-busy={busy}>
      <h2>{editing === null ? 'Thêm lĩnh vực' : 'Chỉnh sửa lĩnh vực'}</h2>
      <label>Tên lĩnh vực<input ref={inputRef} name="name" required disabled={busy} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Slug<input name="slug" readOnly value={slugify(name)} aria-describedby="industry-slug-hint" /></label>
      <p id="industry-slug-hint" className="admin-industries__hint">Slug được tạo tự động theo tên lĩnh vực.</p>
      <label>Mô tả<textarea name="description" rows={5} disabled={busy} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <div className="admin-industries__form-actions"><button type="submit" disabled={busy} className="button button-primary">{busy ? 'Đang xử lý...' : editing === null ? 'Thêm' : 'Lưu thay đổi'}</button>{editing !== null && <button type="button" disabled={busy} className="button button-outline" onClick={resetForm}>Hủy chỉnh sửa</button>}</div>
    </form>
  </section>
}
