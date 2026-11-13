import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchAdminPackages, fetchPackageDetail, savePackage, deletePackage, type PackagePage, type PackagePayload } from '../services/adminPackages'
import type { CreditPackage } from '../services/packages'
import { Icon } from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import './JobPostListPage.css'
import './AdminPackagesPage.css'

const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 2 })
const count = new Intl.NumberFormat('vi-VN')
function toast(type: 'success' | 'error', message: string) { window.dispatchEvent(new CustomEvent('app-toast', { detail: { type, message } })) }
type Editor = { mode: 'create' } | { mode: 'edit' | 'view'; item: CreditPackage }

export function AdminPackagesPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <PackagesContent key={token} token={token} />
}

function PackagesContent({ token }: { token: string }) {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PackagePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [busy, setBusy] = useState(false)
  const action = useRef(false)
  const detailRequest = useRef<AbortController | null>(null)
  useEffect(() => () => detailRequest.current?.abort(), [])
  useEffect(() => {
    const controller = new AbortController()
    fetchAdminPackages(token, page, 10, controller.signal).then((result) => {
      if (controller.signal.aborted) return
      const last = Math.max(0, result.totalPages - 1)
      if (page > last) { setPage(last); return }
      setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải danh sách gói.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, page, retry])
  function reload() { setLoading(true); setError(''); setRetry((value) => value + 1) }
  async function open(id: number, mode: 'view' | 'edit') {
    if (action.current) return
    action.current = true; setBusy(true)
    const controller = new AbortController()
    detailRequest.current = controller
    try {
      const item = await fetchPackageDetail(token, id, AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]))
      if (!controller.signal.aborted) setEditor({ mode, item })
    } catch (error) {
      if (!controller.signal.aborted) toast('error', error instanceof Error ? error.message : 'Không thể tải chi tiết gói.')
    } finally { action.current = false; setBusy(false) }
  }
  async function remove(item: CreditPackage) {
    if (action.current || !window.confirm(`Bạn có chắc muốn xóa gói "${item.name}"?`)) return
    action.current = true; setBusy(true)
    try { await deletePackage(token, item.id); toast('success', 'Xóa gói thành công.'); reload() }
    catch (error) { toast('error', error instanceof Error ? error.message : 'Không thể xóa gói.') }
    finally { action.current = false; setBusy(false) }
  }
  return <section className="post-list admin-packages">
    <header className="admin-packages__heading"><div className="post-list__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>Quản lý gói</h1><p>Quản lý giá, số credits và thông tin các gói dành cho nhà tuyển dụng.</p></div><button className="button button-primary" type="button" disabled={busy} onClick={() => setEditor({ mode: 'create' })}>Thêm gói</button></header>
    {loading ? <p role="status">Đang tải danh sách gói...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={reload}>Thử lại</button></div> : data && <>
      <div className="post-list__card"><table className="post-table"><thead><tr>{['STT', 'ID', 'Tên gói', 'Giá', 'Credits', 'Thao tác'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{data.content.map((item, index) => <tr key={item.id}><td>{data.page * data.size + index + 1}</td><td className="post-table__id">#{item.id}</td><td><strong>{item.name}</strong></td><td>{money.format(item.price)}</td><td><span className="admin-packages__credits">{count.format(item.credits)}</span></td><td><div className="admin-packages__actions"><button type="button" disabled={busy} onClick={() => open(item.id, 'view')}><Icon name="eye" /> Xem chi tiết</button><button type="button" disabled={busy} onClick={() => open(item.id, 'edit')}><Icon name="edit" /> Sửa</button><button className="admin-packages__delete" type="button" disabled={busy} onClick={() => remove(item)}><Icon name="trash" /> Xóa</button></div></td></tr>)}{!data.content.length && <tr><td colSpan={6} className="post-table__empty">Chưa có gói nào.</td></tr>}</tbody></table></div>
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="gói" onChange={(next) => { setPage(next); setLoading(true); setError('') }} />
    </>}
    {busy && <p role="status">Đang xử lý...</p>}
    {editor && <PackageDialog token={token} editor={editor} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); reload() }} />}
  </section>
}

function PackageDialog({ token, editor, onClose, onSaved }: { token: string; editor: Editor; onClose: () => void; onSaved: () => void }) {
  const item = editor.mode === 'create' ? null : editor.item
  const view = editor.mode === 'view'
  const [name, setName] = useState(item?.name ?? '')
  const [price, setPrice] = useState(item ? String(item.price) : '')
  const [credits, setCredits] = useState(item ? String(item.credits) : '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = previous }
  }, [])
  function close() { if (!submitting.current) onClose() }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (view || submitting.current) return
    if (!name.trim() || !price.trim() || !credits.trim() || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isSafeInteger(Number(credits)) || Number(credits) < 0) { setError('Vui lòng nhập tên gói, giá không âm và số credits nguyên không âm.'); return }
    submitting.current = true; setSaving(true); setError('')
    const payload: PackagePayload = { name: name.trim(), price: Number(price).toFixed(2), credits: String(Number(credits)), description }
    try {
      await savePackage(token, payload, item?.id)
      toast('success', item ? 'Cập nhật gói thành công.' : 'Thêm gói thành công.')
      onSaved()
    } catch (error) { const message = error instanceof Error ? error.message : 'Không thể lưu gói.'; setError(message); toast('error', message) }
    finally { submitting.current = false; setSaving(false) }
  }
  return <dialog className="admin-package-dialog" ref={ref} aria-labelledby="admin-package-title" aria-busy={saving} onCancel={(event) => { event.preventDefault(); close() }} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
    <header><h2 id="admin-package-title">{view ? `Chi tiết gói #${item?.id}` : item ? 'Sửa gói' : 'Thêm gói'}</h2><button type="button" disabled={saving} aria-label="Đóng" onClick={close}>×</button></header>
    {view && item ? <div className="admin-package-dialog__body"><h3>{item.name}</h3><dl><div><dt>ID</dt><dd>#{item.id}</dd></div><div><dt>Giá gói</dt><dd>{money.format(item.price)}</dd></div><div><dt>Credits</dt><dd>{count.format(item.credits)}</dd></div></dl><h4>Mô tả</h4><p className="admin-package-dialog__description">{item.description || 'Chưa có mô tả.'}</p><button type="button" className="button button-outline" onClick={close}>Đóng</button></div> : <form className="admin-package-dialog__body" onSubmit={submit}>
      <label>Tên gói<input name="name" required disabled={saving} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <div className="admin-package-dialog__row"><label>Giá (VNĐ)<input name="price" type="number" min="0" step="0.01" required disabled={saving} value={price} onChange={(event) => setPrice(event.target.value)} /></label><label>Số credits<input name="credits" type="number" min="0" step="1" required disabled={saving} value={credits} onChange={(event) => setCredits(event.target.value)} /></label></div>
      <label>Mô tả<textarea name="description" rows={5} disabled={saving} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <footer><button type="button" className="button button-outline" disabled={saving} onClick={close}>Hủy</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : item ? 'Lưu thay đổi' : 'Thêm gói'}</button></footer>
    </form>}
  </dialog>
}
