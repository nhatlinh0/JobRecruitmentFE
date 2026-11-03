import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { fetchUserJobs, type UserJobKind, type UserJobsPageData } from '../services/userJobs'
import { JobList } from '../components/jobs/JobList'
import { Pagination } from '../components/ui/Pagination'
import './JobPostListPage.css'

export function UserJobsPage({ kind }: { kind: UserJobKind }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'USER') return <Navigate to="/" replace />
  return <UserJobsContent key={`${token}:${kind}`} token={token} kind={kind} />
}

function UserJobsContent({ token, kind }: { token: string; kind: UserJobKind }) {
  const { savedIds, toggleSaved } = useSavedJobs()
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<UserJobsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const title = kind === 'saved' ? 'Việc làm đã lưu' : 'Việc làm đã ứng tuyển'

  useEffect(() => {
    const controller = new AbortController()
    fetchUserJobs(kind, token, page, 6, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult(data)
    }).catch((error: unknown) => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải danh sách việc làm.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [kind, token, page, retry])

  function changePage(next: number) { setLoading(true); setError(''); setPage(next) }
  const ids = kind === 'saved' ? [...new Set([...savedIds, ...(result?.content.map((job) => job.id) ?? [])])] : savedIds

  return <section className="post-list">
    <div className="post-list__heading"><span className="section-kicker">CƠ HỘI CỦA BẠN</span><h1>{title}</h1>{!loading && !error && <p>{result?.totalElements ?? 0} việc làm.</p>}</div>
    {loading ? <p role="status">Đang tải danh sách việc làm...</p> : error ? <div role="alert">{error} <button className="button button-outline" type="button" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : result && <>
      {result.content.length ? <JobList jobs={result.content} savedIds={ids} onToggleSave={toggleSaved} onReset={() => changePage(0)} /> : <div className="empty-state"><h2>{kind === 'saved' ? 'Bạn chưa lưu việc làm nào' : 'Bạn chưa ứng tuyển việc làm nào'}</h2><p>Khám phá những cơ hội phù hợp với bạn.</p><Link className="button button-primary" to="/">Khám phá việc làm</Link></div>}
      <Pagination page={result.page} totalPages={result.totalPages} totalElements={result.totalElements} label="việc làm" onChange={changePage} />
    </>}
  </section>
}
