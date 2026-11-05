import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchProfileOptions, type ProfileOption } from '../services/userInfo'
import { fetchAdminSkills, mutateAdminSkill, type AdminSkill, type AdminSkillPage } from '../services/adminSkills'
import { Icon } from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { slugify } from '../utils/slugify'
import './JobPostListPage.css'
import './AdminIndustriesPage.css'
import './AdminSkillsPage.css'

export function AdminSkillsPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <SkillsContent key={token} token={token} />
}

function SkillsContent({ token }: { token: string }) {
  const [domains, setDomains] = useState<ProfileOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [domainId, setDomainId] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    fetchProfileOptions('domains', token, controller.signal).then((items) => {
      if (!controller.signal.aborted) setDomains(items)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải chuyên môn.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, retry])
  return <section className="post-list admin-industries">
    <div className="post-list__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>Quản lý kỹ năng</h1><p>Chọn chuyên môn để quản lý các kỹ năng tương ứng.</p></div>
    <label className="admin-skills__domain">Chuyên môn<select value={domainId || ''} disabled={loading} onChange={(event) => setDomainId(Number(event.target.value))}><option value="">Chọn chuyên môn</option>{domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.name}</option>)}</select></label>
    {loading ? <p role="status">Đang tải chuyên môn...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : domainId ? <DomainSkills key={domainId} token={token} domainId={domainId} /> : <p>Vui lòng chọn chuyên môn để xem danh sách kỹ năng.</p>}
  </section>
}

function DomainSkills({ token, domainId }: { token: string; domainId: number }) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<AdminSkillPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [editing, setEditing] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const submitting = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetchAdminSkills(token, domainId, page, 10, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      const lastPage = Math.max(0, result.totalPages - 1)
      if (page > lastPage) { setPage(lastPage); return }
      setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải kỹ năng.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, domainId, page, retry])
  function notify(type: 'success' | 'error', message: string) {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { type, message } }))
  }
  function resetForm() { setEditing(null); setName('') }
  function reload() { setLoading(true); setError(''); setRetry((value) => value + 1) }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    if (!name.trim()) { inputRef.current?.focus(); return }
    submitting.current = true; setBusy(true)
    try {
      await mutateAdminSkill(token, domainId, editing === null ? 'POST' : 'PUT', { name: name.trim(), slug: slugify(name) })
      notify('success', editing === null ? 'Thêm kỹ năng thành công.' : 'Cập nhật kỹ năng thành công.')
      resetForm(); reload()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Không thể lưu kỹ năng.')
    } finally { submitting.current = false; setBusy(false) }
  }
  async function remove(skill: AdminSkill) {
    if (submitting.current || !window.confirm(`Bạn có chắc muốn xóa kỹ năng "${skill.name}"?`)) return
    submitting.current = true; setBusy(true)
    try {
      await mutateAdminSkill(token, domainId, 'DELETE', undefined, skill.id)
      notify('success', 'Xóa kỹ năng thành công.')
      if (editing === skill.id) resetForm()
      reload()
    } catch (error) {
      notify('error', error instanceof Error ? error.message : 'Không thể xóa kỹ năng.')
    } finally { submitting.current = false; setBusy(false) }
  }
  return <>
    {loading ? <p role="status">Đang tải kỹ năng...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : data && <>
      <div className="post-list__card"><table className="post-table"><thead><tr>{['STT', 'ID', 'Tên kỹ năng', 'Slug', 'Thao tác'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{data.content.map((skill, index) => <tr key={skill.id}><td>{data.page * data.size + index + 1}</td><td>#{skill.id}</td><td><strong>{skill.name}</strong></td><td>{skill.slug || '—'}</td><td><div className="admin-industries__actions"><button type="button" disabled={busy} title="Sửa" aria-label={`Sửa ${skill.name}`} onClick={() => { setEditing(skill.id); setName(skill.name); inputRef.current?.focus(); inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}><Icon name="edit" /></button><button type="button" disabled={busy} title="Xóa" aria-label={`Xóa ${skill.name}`} className="admin-industries__delete" onClick={() => remove(skill)}><Icon name="trash" /></button></div></td></tr>)}{!data.content.length && <tr><td colSpan={5} className="post-table__empty">Chuyên môn này chưa có kỹ năng.</td></tr>}</tbody></table></div>
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="kỹ năng" onChange={(next) => { setLoading(true); setError(''); setPage(next) }} />
    </>}
    <form className="admin-industries__form" onSubmit={submit} aria-busy={busy}>
      <h2>{editing === null ? 'Thêm kỹ năng' : 'Chỉnh sửa kỹ năng'}</h2>
      <label>Tên kỹ năng<input ref={inputRef} name="name" required disabled={busy} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Slug<input name="slug" readOnly value={slugify(name)} /></label>
      <div className="admin-industries__form-actions"><button type="submit" disabled={busy} className="button button-primary">{busy ? 'Đang xử lý...' : editing === null ? 'Thêm' : 'Lưu thay đổi'}</button>{editing !== null && <button type="button" disabled={busy} className="button button-outline" onClick={resetForm}>Hủy chỉnh sửa</button>}</div>
    </form>
  </>
}
