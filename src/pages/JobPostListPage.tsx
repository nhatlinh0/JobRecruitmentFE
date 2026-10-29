import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobs } from '../data/jobs'
import { formatDate } from '../utils/format'
import { Icon } from '../components/ui/Icon'
import './JobPostListPage.css'

const PAGE_SIZE = 5

type PostStatus = 'Đang tuyển' | 'Sắp hết hạn' | 'Hết hạn'

function statusOf(deadline: string): PostStatus {
  const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)
  if (daysLeft < 0) return 'Hết hạn'
  if (daysLeft <= 7) return 'Sắp hết hạn'
  return 'Đang tuyển'
}

const statusClass: Record<PostStatus, string> = {
  'Đang tuyển': 'is-open',
  'Sắp hết hạn': 'is-expiring',
  'Hết hạn': 'is-closed',
}

export function JobPostListPage() {
  const [page, setPage] = useState(0)
  const [removedIds, setRemovedIds] = useState<number[]>([])

  const posts = useMemo(() => jobs.filter((job) => !removedIds.includes(job.id)), [removedIds])

  // Giả định phân trang phía server; sau này thay bằng response thật
  const totalElements = posts.length
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const isLast = currentPage >= totalPages - 1
  const pagePosts = posts.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  function handleDelete(id: number, title: string) {
    if (window.confirm(`Xóa bài đăng "${title}"?`)) {
      setRemovedIds((current) => [...current, id])
    }
  }

  return (
    <section className="post-list">
      <div className="post-list__heading">
        <span className="section-kicker">NHÀ TUYỂN DỤNG</span>
        <h1>Danh sách bài đăng</h1>
        <p>Quản lý toàn bộ tin tuyển dụng của công ty bạn.</p>
      </div>

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
            {pagePosts.map((post, index) => {
              const status = statusOf(post.deadline)
              return (
                <tr key={post.id}>
                  <td>{currentPage * PAGE_SIZE + index + 1}</td>
                  <td className="post-table__id">#{post.id}</td>
                  <td className="post-table__title">{post.title}</td>
                  <td>{formatDate(post.deadline)}</td>
                  <td>
                    <span className={`post-status ${statusClass[status]}`}>{status}</span>
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
                        onClick={() => handleDelete(post.id, post.title)}
                        title="Xóa"
                        type="button"
                      >
                        <Icon name="trash" />
                      </button>
                      <Link className="post-actions__applicants" to={`/recruit/posts`}>
                        DS ứng tuyển
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {pagePosts.length === 0 && (
              <tr>
                <td className="post-table__empty" colSpan={6}>Chưa có bài đăng nào.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="post-pagination">
          <span className="post-pagination__info">
            Trang {currentPage + 1}/{totalPages} · Tổng {totalElements} bài đăng
          </span>
          <div className="post-pagination__buttons">
            <button
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
              type="button"
            >
              ← Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                aria-current={i === currentPage ? 'page' : undefined}
                className={i === currentPage ? 'is-active' : ''}
                key={i}
                onClick={() => setPage(i)}
                type="button"
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={isLast}
              onClick={() => setPage(currentPage + 1)}
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
