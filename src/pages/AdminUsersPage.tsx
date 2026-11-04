import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { changeAdminUserStatus, fetchAdminUsers, type AdminUserPage, type AdminUser } from '../services/adminUsers'
import { Pagination } from '../components/ui/Pagination'
import './JobPostListPage.css'
import './AdminUsersPage.css'

export function AdminUsersPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <UsersContent key={token} token={token} />
}

function UsersContent({ token }: { token: string }) {
  const [page, setPage] = useState(0)
  const [email, setEmail] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [data, setData] = useState<AdminUserPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const updating = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchAdminUsers(token, page, 10, controller.signal, searchEmail).then((result) => {
      if (!controller.signal.aborted) setData(result)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải danh sách người dùng.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, page, retry, searchEmail])

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError(''); setPage(0); setSearchEmail(email.trim()); setRetry((value) => value + 1)
  }

  async function changeStatus(user: AdminUser, action: 'active' | 'inactive') {
    if (updating.current) return
    updating.current = true
    setUpdatingId(user.id)
    try {
      await changeAdminUserStatus(token, user.id, action)
      const status = action === 'active' ? 'ACTIVE' : 'INACTIVE'
      setData((current) => current ? { ...current, content: current.content.map((item) => item.id === user.id ? { ...item, status } : item) } : current)
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: action === 'active' ? `Đã kích hoạt tài khoản ${user.username || user.email}.` : `Đã tạm ngưng tài khoản ${user.username || user.email}.` } }))
      setLoading(true); setError(''); setRetry((value) => value + 1)
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: error instanceof Error ? error.message : 'Không thể cập nhật người dùng.' } }))
    } finally { updating.current = false; setUpdatingId(null) }
  }

  return <section className="post-list admin-users">
    <div className="post-list__heading"><span className="section-kicker">QUẢN TRỊ HỆ THỐNG</span><h1>Quản lý người dùng</h1><p>Thông tin tài khoản, vai trò và trạng thái hoạt động.</p></div>
    <form className="admin-users__search" onSubmit={search}>
      <label htmlFor="admin-user-email">Tìm theo email<input id="admin-user-email" name="email" type="email" autoComplete="email" required value={email} disabled={updatingId !== null} onChange={(event) => setEmail(event.target.value)} /></label>
      <button type="submit" className="button button-primary" disabled={loading || updatingId !== null}>Gửi</button>
      {searchEmail && <button type="button" className="button button-outline" disabled={loading || updatingId !== null} onClick={() => { setEmail(''); setSearchEmail(''); setPage(0); setLoading(true); setError('') }}>Tất cả</button>}
    </form>
    {loading ? <p role="status">Đang tải người dùng...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : data && <>
      <div className="post-list__card"><table className="post-table"><thead><tr><th scope="col">STT</th><th scope="col">ID</th><th scope="col">Email</th><th scope="col">Tên người dùng</th><th scope="col">Vai trò</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead><tbody>
        {data.content.map((user, index) => <tr key={user.id}>
          <td>{data.page * data.size + index + 1}</td><td className="post-table__id">#{user.id}</td><td>{user.email || '—'}</td><td className="post-table__title">{user.username || '—'}</td><td><span className="admin-users__role">{user.roleName || '—'}</span></td>
          <td><span className={`post-status ${user.status === 'ACTIVE' ? 'is-open' : 'is-suspended'}`}>{user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'INACTIVE' ? 'Tạm ngưng' : user.status || '—'}</span></td>
          <td><div className="admin-users__actions" aria-busy={updatingId === user.id}>
            <button className="admin-users__active" type="button" disabled={updatingId !== null || user.status === 'ACTIVE'} onClick={() => changeStatus(user, 'active')}>Hoạt động</button>
            <button className="admin-users__inactive" type="button" disabled={updatingId !== null || user.status === 'INACTIVE'} onClick={() => changeStatus(user, 'inactive')}>Tạm ngưng</button>
          </div></td>
        </tr>)}
        {!data.content.length && <tr><td className="post-table__empty" colSpan={7}>{searchEmail ? 'Không tìm thấy người dùng với email này.' : 'Chưa có người dùng nào.'}</td></tr>}
      </tbody></table></div>
      <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} label="người dùng" onChange={(next) => { setLoading(true); setError(''); setPage(next) }} />
    </>}
  </section>
}
