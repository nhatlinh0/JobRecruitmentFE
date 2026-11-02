import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { deleteJob, fetchMyJobs } from '../services/jobs'
import { Toast, type ToastMessage } from '../components/ui/Toast'
import { useAuth } from '../hooks/useAuth'
import { formatDate } from '../utils/format'
import { Icon } from '../components/ui/Icon'
import './JobPostListPage.css'

const PAGE_SIZE = 5

const statusInfo: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'is-expiring' },
  ACCEPTED: { label: 'Được chấp nhận', className: 'is-open' },
  REJECT: { label: 'Từ chối', className: 'is-closed' },
  SUSPEND: { label: 'Tạm ngưng', className: 'is-suspended' },
}

export function JobPostListPage() {
  const { token, user } = useAuth()
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchMyJobs>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const deleting = useRef(false)
  const [notification, setNotification] = useState<ToastMessage | null>(null)
  const closeToast = useCallback(() => setNotification(null), [])
  const totalElements = result?.totalElements ?? 0
  const totalPages = result?.totalPages ?? 0
  const currentPage = result?.page ?? page
  const isLast = result?.isLast ?? true
  const pagePosts = result?.content ?? []
  useEffect(() => {
    if (!token || user?.role !== 'RECRUIT') return
    const controller = new AbortController()
    fetchMyJobs(token, page, PAGE_SIZE, controller.signal).then((data) => {
      if (!controller.signal.aborted) {
        if (page > 0 && data.totalPages <= page) {
          setPage(Math.max(0, data.totalPages - 1))
          return
        }
        setResult(data)
      }
    }).catch((error: unknown) => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải bài đăng.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, user?.role, page, retry])
  function changePage(next: number) { setLoading(true); setError(''); setPage(next) }

  async function handleDelete(id: number, title: string) {
    if (!token || deleting.current || !window.confirm(`Xóa bài đăng "${title}"?`)) return
    deleting.current = true
    setDeletingId(id)
    setNotification(null)
    try {
      await deleteJob(token, id)
      setNotification({ type: 'success', message: 'Đã xóa bài đăng.' })
      setLoading(true)
      setError('')
      setRetry((value) => value + 1)
    } catch (error) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Không thể kết nối máy chủ.' })
    } finally {
      deleting.current = false
      setDeletingId(null)
    }
  }

  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'RECRUIT') return <Navigate to="/" replace />

  return (
    <section className="post-list">
      <Toast notification={notification} onClose={closeToast} />
      <div className="post-list__heading">
        <span className="section-kicker">NHÀ TUYỂN DỤNG</span>
        <h1>Danh sách bài đăng</h1>
        <p>Quản lý toàn bộ tin tuyển dụng của công ty bạn.</p>
      </div>
      {loading && <p role="status">Đang tải bài đăng...</p>}
      {error && <div role="alert">{error} <button type="button" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div>}

      <div className="post-list__card">
        <table className="post-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã bài đăng</th>
              <th>Tên công việc</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && !error && pagePosts.map((post, index) => {
              const status = statusInfo[post.status] ?? { label: post.status || 'Chưa có trạng thái', className: 'is-suspended' }
              return (
                <tr key={post.id}>
                  <td>{currentPage * (result?.size ?? PAGE_SIZE) + index + 1}</td>
                  <td className="post-table__id">#{post.id}</td>
                  <td className="post-table__title">{post.title}</td>
                  <td>{post.deadline && !Number.isNaN(Date.parse(post.deadline)) ? formatDate(post.deadline) : 'Chưa cập nhật'}</td>
                  <td>
                    <span className={`post-status ${status.className}`}>{status.label}</span>
                  </td>
                  <td>
                    <div className="post-actions">
                      <Link
                        aria-label={`Xem ${post.title}`}
                        className="post-actions__icon"
                        title="Xem"
                        to={`/recruit/posts/${post.id}`}
                      >
                        <Icon name="eye" />
                      </Link>
                      <Link
                        aria-label={`Sửa ${post.title}`}
                        className="post-actions__icon"
                        title="Sửa"
                        to={`/recruit/posts/${post.id}/edit`}
                      >
                        <Icon name="settings" />
                      </Link>
                      <button
                        aria-label={`Xóa ${post.title}`}
                        className="post-actions__icon post-actions__icon--danger"
                        disabled={deletingId !== null}
                        aria-busy={deletingId === post.id}
                        onClick={() => handleDelete(post.id, post.title)}
                        title="Xóa"
                        type="button"
                      >
                        <Icon name="trash" />
                      </button>
                      <Link className="post-actions__applicants" to={`/recruit/posts/${post.id}/applicants`}>
                        DS ứng tuyển
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!loading && !error && pagePosts.length === 0 && (
              <tr>
                <td className="post-table__empty" colSpan={6}>Chưa có bài đăng nào.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="post-pagination">
          <span className="post-pagination__info">
            Trang {totalPages ? currentPage + 1 : 0}/{totalPages} · Tổng {totalElements} bài đăng
          </span>
          <div className="post-pagination__buttons">
            <button
              disabled={loading || currentPage === 0}
              onClick={() => changePage(currentPage - 1)}
              type="button"
            >
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                aria-current={i === currentPage ? 'page' : undefined}
                className={i === currentPage ? 'is-active' : ''}
                key={i}
                disabled={loading}
                onClick={() => changePage(i)}
                type="button"
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={loading || isLast}
              onClick={() => changePage(currentPage + 1)}
              type="button"
            >
              Sau →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
