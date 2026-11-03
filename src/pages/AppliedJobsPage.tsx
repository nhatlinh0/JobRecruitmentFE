import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { canReviewApplications, updateApplicationStatus, fetchJobApplications, fetchUserApplications, type UserApplicationPage, type UserApplication } from '../services/applications'
import { Pagination } from '../components/ui/Pagination'
import { formatDate } from '../utils/format'
import './JobPostListPage.css'
import './AppliedJobsPage.css'

export function AppliedJobsPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'USER') return <Navigate to="/" replace />
  return <ApplicationsContent key={token} token={token} />
}

function CvPreview({ application, onClose }: { application: UserApplication; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = overflow }
  }, [])
  return <dialog className="application-cv" ref={ref} aria-labelledby="application-cv-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="application-cv__header"><h2 id="application-cv-title">CV ứng tuyển{application.jobTitle ? ` — ${application.jobTitle}` : ''}</h2><button type="button" aria-label="Đóng CV" onClick={onClose}>×</button></div>
    <div className="application-cv__body">{failed ? <p role="alert">Không thể tải ảnh CV.</p> : <img src={application.cvUrl} alt="CV đã gửi trong đơn ứng tuyển" onError={() => setFailed(true)} />}</div>
  </dialog>
}

export function ApplicationsContent({ token, jobId }: { token: string; jobId?: number }) {
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<UserApplicationPage | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const [preview, setPreview] = useState<UserApplication | null>(null)
  const [reviewAccess, setReviewAccess] = useState<{ allowed: boolean; error: string } | null>(null)
  const [reviewRetry, setReviewRetry] = useState(0)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const updating = useRef(false)
  useEffect(() => {
    if (jobId === undefined) return
    const controller = new AbortController()
    canReviewApplications(token, controller.signal).then((allowed) => {
      if (!controller.signal.aborted) setReviewAccess({ allowed, error: '' })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setReviewAccess({ allowed: false, error: error instanceof Error ? error.message : 'Không thể kiểm tra quyền duyệt.' })
    })
    return () => controller.abort()
  }, [token, jobId, reviewRetry])

  async function review(application: UserApplication, status: 'ACCEPTED' | 'REJECT') {
    if (jobId === undefined || !reviewAccess?.allowed || updating.current || !application.id) return
    updating.current = true
    setUpdatingId(application.id)
    try {
      await updateApplicationStatus(token, application.id, status)
      setResult((current) => current ? { ...current, content: current.content.map((item) => item.id === application.id ? { ...item, status } : item) } : current)
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: status === 'ACCEPTED' ? 'Đã duyệt đơn ứng tuyển.' : 'Đã loại đơn ứng tuyển.' } }))
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: error instanceof Error ? error.message : 'Không thể cập nhật đơn ứng tuyển.' } }))
    } finally { updating.current = false; setUpdatingId(null) }
  }
  useEffect(() => {
    const controller = new AbortController()
    const request = jobId === undefined ? fetchUserApplications(token, page, 10, controller.signal) : fetchJobApplications(jobId, token, page, 10, controller.signal)
    request.then((data) => {
      if (!controller.signal.aborted) setResult(data)
    }).catch((error: unknown) => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải đơn ứng tuyển.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, jobId, page, retry])
  return <section className="post-list application-list">
    {jobId !== undefined && <Link className="applicants-page__back" to="/recruit/posts">← Quay lại danh sách bài đăng</Link>}
    <div className="post-list__heading"><span className="section-kicker">{jobId === undefined ? 'HỒ SƠ CỦA BẠN' : 'DANH SÁCH ỨNG TUYỂN'}</span><h1>{jobId !== undefined ? result?.content[0]?.jobTitle || `Ứng tuyển công việc #${jobId}` : 'Danh sách ứng tuyển'}</h1>{!loading && !error && <p>{result?.totalElements ?? 0} đơn ứng tuyển.</p>}</div>
    {jobId !== undefined && <div className="application-list__permission" role="status">{!reviewAccess ? 'Đang kiểm tra quyền duyệt...' : reviewAccess.error ? <>{reviewAccess.error} <button type="button" onClick={() => { setReviewAccess(null); setReviewRetry((value) => value + 1) }}>Kiểm tra lại</button></> : !reviewAccess.allowed ? 'Công ty chưa được duyệt. Bạn có thể xem danh sách nhưng không thể duyệt hoặc loại ứng viên.' : null}</div>}
    {loading ? <p role="status">Đang tải đơn ứng tuyển...</p> : error ? <div role="alert">{error} <button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : result && <>
      <div className="post-list__card"><table className="post-table"><thead><tr><th scope="col">STT</th><th scope="col">ID đơn</th><th scope="col">Công việc</th><th scope="col">Người ứng tuyển</th><th scope="col">Thư giới thiệu</th><th scope="col">Ngày ứng tuyển</th><th scope="col">Trạng thái</th><th scope="col">CV</th>{jobId !== undefined && <th scope="col">Thao tác</th>}</tr></thead><tbody>
        {result.content.map((application, index) => <tr key={application.id || index}>
          <td>{result.page * result.size + index + 1}</td><td>{application.id || '—'}</td>
          <td className="post-table__title">{application.jobSlug ? <Link to={`/jobs/${encodeURIComponent(application.jobSlug)}`}>{application.jobTitle || 'Xem công việc'}</Link> : application.jobTitle || 'Chưa có thông tin'}{application.companyName && <small className="application-list__company">{application.companyName}</small>}</td>
          <td>{application.userName || '—'}</td>
          <td className="application-list__letter">{application.coverLetter || '—'}</td>
          <td>{application.submittedAt && !Number.isNaN(Date.parse(application.submittedAt)) ? formatDate(application.submittedAt) : '—'}</td>
          <td>{application.status || '—'}</td>
          <td><button className="button button-outline application-list__cv-button" type="button" disabled={!/^https?:\/\//i.test(application.cvUrl)} onClick={() => setPreview(application)}>Xem CV</button></td>
          {jobId !== undefined && <td><div className="application-list__review" aria-busy={updatingId === application.id}>
            <button type="button" className="button button-primary" disabled={!reviewAccess?.allowed || updatingId !== null || application.status === 'ACCEPTED' || !application.id} onClick={() => review(application, 'ACCEPTED')}>Duyệt</button>
            <button type="button" className="button button-outline application-list__reject" disabled={!reviewAccess?.allowed || updatingId !== null || application.status === 'REJECT' || !application.id} onClick={() => review(application, 'REJECT')}>Loại</button>
          </div></td>}
        </tr>)}
        {!result.content.length && <tr><td className="post-table__empty" colSpan={jobId === undefined ? 8 : 9}>{jobId === undefined ? 'Bạn chưa có đơn ứng tuyển nào.' : 'Công việc này chưa có đơn ứng tuyển.'}</td></tr>}
      </tbody></table></div>
      <Pagination page={result.page} totalPages={result.totalPages} totalElements={result.totalElements} label="đơn ứng tuyển" onChange={(next) => { setLoading(true); setError(''); setPreview(null); setPage(next) }} />
    </>}
    {preview && <CvPreview key={preview.id} application={preview} onClose={() => setPreview(null)} />}
  </section>
}
