import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { JobList } from '../components/jobs/JobList'
import { Pagination } from '../components/ui/Pagination'
import { fetchJobsByTag } from '../services/home'
import type { Job } from '../types/job'
import { useSavedJobs } from '../hooks/useSavedJobs'
import './TagJobsPage.css'

const PAGE_SIZE = 6


interface TagJobsPageProps {
  kind: 'skill' | 'field' | 'company'
}

function TagJobsPage({ kind }: TagJobsPageProps) {
  const { slug = '' } = useParams<{ slug: string }>()
  const { savedIds, toggleSaved } = useSavedJobs()
  const listKey = `${kind}:${slug}`
  const [pagination, setPagination] = useState({ key: listKey, page: 0 })
  const location = useLocation()
  const [result, setResult] = useState<{ key: string; jobs: Job[]; error: string } | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    const controller = new AbortController()
    fetchJobsByTag(kind, slug, controller.signal).then((jobs) => {
      if (!controller.signal.aborted) setResult({ key: listKey, jobs, error: '' })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({ key: listKey, jobs: [], error: error instanceof Error ? error.message : 'Không thể tải danh sách việc làm.' })
    })
    return () => controller.abort()
  }, [slug, kind, listKey, retry])

  const label = typeof location.state?.label === 'string' ? location.state.label : slug.replaceAll('-', ' ')
  const data = result?.key === listKey ? result : null
  const matchedJobs = data?.jobs ?? []

  const title = kind === 'company' ? `Việc làm tại ${label}` : kind === 'skill' ? `Việc làm ${label}` : `Việc làm theo ${label}`
  const totalPages = Math.ceil(matchedJobs.length / PAGE_SIZE)
  const page = pagination.key === listKey ? Math.max(0, Math.min(pagination.page, totalPages - 1)) : 0
  const content = matchedJobs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section className="tag-jobs">
      <div className="tag-jobs__heading">
        <span className="section-kicker">{kind === 'company' ? 'CÔNG TY' : kind === 'skill' ? 'KỸ NĂNG' : 'CHUYÊN MÔN'}</span>
        <h1>{title}</h1>
        {data && !data.error && <p>{matchedJobs.length} vị trí đang tuyển dụng.</p>}
      </div>

      {!data ? <p role="status">Đang tải việc làm...</p> : data.error ? <div role="alert">{data.error} <button type="button" onClick={() => { setResult(null); setRetry((value) => value + 1) }}>Thử lại</button></div> : matchedJobs.length > 0 ? (
        <JobList jobs={content} onReset={() => {}} onToggleSave={toggleSaved} savedIds={savedIds} />
      ) : (
        <div className="tag-jobs__empty">
          <h2>Chưa có việc làm phù hợp</h2>
          <p>Hiện chưa có tin tuyển dụng nào cho {label}. Quay lại sau nhé.</p>
          <Link className="button button-primary" to="/">Khám phá việc làm khác</Link>
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} totalElements={matchedJobs.length} label="việc làm" onChange={(nextPage) => setPagination({ key: listKey, page: nextPage })} />
    </section>
  )
}

export function SkillJobsPage() {
  return <TagJobsPage kind="skill" />
}

export function FieldJobsPage() {
  return <TagJobsPage kind="field" />
}

export function CompanyJobsPage() {
  return <TagJobsPage kind="company" />
}
