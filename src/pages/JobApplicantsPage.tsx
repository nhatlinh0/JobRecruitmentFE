import { Fragment, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { getApplicationsPage, type ApplicationStatus } from '../data/applications'
import { jobs } from '../data/jobs'
import { formatDate } from '../utils/format'
import './JobPostListPage.css'
import './JobApplicantsPage.css'

const statusInfo: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'is-expiring' },
  approved: { label: 'Đã duyệt', className: 'is-open' },
  rejected: { label: 'Đã từ chối', className: 'is-closed' },
}

const PAGE_SIZE = 5

export function JobApplicantsPage() {
  const { id } = useParams<{ id: string }>()
  const job = jobs.find((item) => item.id === Number(id))
  const [statuses, setStatuses] = useState<Record<number, ApplicationStatus>>({})
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [approvedOnly, setApprovedOnly] = useState(false)
  const [pageRequest, setPageRequest] = useState({ jobId: id, page: 0 })
  const response = getApplicationsPage(job?.id ?? -1, pageRequest.jobId === id ? pageRequest.page : 0, PAGE_SIZE, approvedOnly ? 'approved' : 'all', statuses)
  const { content: applicants, page, size, totalElements, totalPages, isLast } = response

  function changePage(nextPage: number) {
    setPageRequest({ jobId: id, page: nextPage })
    setExpandedId(null)
    setMessage('')
  }

  function updateStatus(applicationId: number, status: ApplicationStatus, name: string) {
    setStatuses((current) => ({ ...current, [applicationId]: status }))
    setMessage(`${status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'} đơn của ${name}.`)
  }

  return (
    <section className="post-list applicants-page">
      <Link className="applicants-page__back" to="/recruit/posts">← Quay lại danh sách bài đăng</Link>
      <div className="post-list__heading">
        <span className="section-kicker">DANH SÁCH ỨNG TUYỂN</span>
        <h1>{job?.title ?? 'Không tìm thấy công việc'}</h1>
        {job && <p>{totalElements} đơn ứng tuyển · Dữ liệu mẫu, thay đổi trạng thái chỉ lưu trong phiên trang hiện tại.</p>}
      </div>
      {job && <>
        <div className="applicants-page__filters" role="group" aria-label="Lọc đơn ứng tuyển">
          <button className={`button ${approvedOnly ? 'button-outline' : 'button-primary'}`} aria-pressed={!approvedOnly} type="button" onClick={() => { setApprovedOnly(false); changePage(0) }}>Tất cả</button>
          <button className={`button ${approvedOnly ? 'button-primary' : 'button-outline'}`} aria-pressed={approvedOnly} type="button" onClick={() => { setApprovedOnly(true); changePage(0) }}><Icon name="check" /> Đã duyệt</button>
        </div>
        <p className="applicants-page__message" role="status">{message}</p>
        <div className="post-list__card">
          <table className="post-table">
            <thead>
              <tr>
                <th scope="col">STT</th><th scope="col">ID</th><th scope="col">Tên người gửi</th>
                <th scope="col">Thời gian</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((application, index) => {
                const status = statuses[application.id] ?? application.status
                const info = statusInfo[status]
                const expanded = expandedId === application.id
                return (
                  <Fragment key={application.id}>
                    <tr>
                      <td>{page * size + index + 1}</td>
                      <td className="post-table__id">#{application.id}</td>
                      <td className="post-table__title">
                        {application.senderName}
                        {approvedOnly && <div className="applicants-page__contact">
                          <a href={`mailto:${application.email}`}>{application.email}</a>
                        </div>}
                      </td>
                      <td>{formatDate(application.submittedAt)}</td>
                      <td><span className={`post-status ${info.className}`}>{info.label}</span></td>
                      <td>
                        <div className="post-actions">
                          <button aria-label={`Xem đơn của ${application.senderName}`} aria-expanded={expanded} aria-controls={`application-${application.id}`} className="post-actions__icon" title="Xem" type="button" onClick={() => setExpandedId(expanded ? null : application.id)}><Icon name="eye" /></button>
                          <button aria-label={`Duyệt đơn của ${application.senderName}`} className="post-actions__icon" disabled={status === 'approved'} title="Duyệt" type="button" onClick={() => updateStatus(application.id, 'approved', application.senderName)}><Icon name="check" /></button>
                          <button aria-label={`Từ chối đơn của ${application.senderName}`} className="post-actions__icon post-actions__icon--danger" disabled={status === 'rejected'} title="Từ chối" type="button" onClick={() => updateStatus(application.id, 'rejected', application.senderName)}><Icon name="close" /></button>
                        </div>
                      </td>
                    </tr>
                    <tr hidden={!expanded} id={`application-${application.id}`}>
                      <td colSpan={6}>
                        <div className="applicants-page__details">
                          <h2>Đơn ứng tuyển của {application.senderName}</h2>
                          <p><strong>Email:</strong> {application.email}</p>
                          <p><strong>Giới thiệu:</strong> {application.introduction}</p>
                          <p>Chưa có CV đính kèm trong dữ liệu mẫu.</p>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
              {applicants.length === 0 && <tr><td className="post-table__empty" colSpan={6}>{approvedOnly ? 'Chưa có ứng viên được duyệt cho công việc này.' : 'Chưa có đơn ứng tuyển cho công việc này.'}</td></tr>}
            </tbody>
          </table>
          <nav className="post-pagination" aria-label="Phân trang danh sách ứng tuyển">
            <span className="post-pagination__info">
              Trang {totalPages === 0 ? 0 : page + 1}/{totalPages} · Tổng {totalElements} đơn ứng tuyển
            </span>
            <div className="post-pagination__buttons">
              <button disabled={page === 0} onClick={() => changePage(page - 1)} type="button">← Trước</button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  aria-label={`Trang ${index + 1}`}
                  aria-current={index === page ? 'page' : undefined}
                  className={index === page ? 'is-active' : ''}
                  key={index}
                  onClick={() => changePage(index)}
                  type="button"
                >{index + 1}</button>
              ))}
              <button disabled={isLast} onClick={() => changePage(page + 1)} type="button">Sau →</button>
            </div>
          </nav>
        </div>
      </>}
    </section>
  )
}
